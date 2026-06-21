import { useCallback, useEffect, useRef } from 'react';

import { getCurrentGameRoundStatus } from '../api/gameApi';
import { GAME_COPY, GAME_INPUT_POLICY } from '../constants/game';
import {
    SOCKET_PUBLISH,
    SOCKET_SUBSCRIBE,
} from '../constants/socketEvents';
import {
    gameChatMessageSchema,
    gameInputRequestSchema,
    gameRoundCorrectEventSchema,
    gameRoundEndEventSchema,
    gameRoundEventSchema,
} from '../schemas/gameSchema';
import { useGameStore } from '../store/useGameStore';
import { useSocketStore } from '../store/useSocketStore';

import type { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import type { GameInputRequest } from '../types/game';
import type { ZodType } from 'zod';

type MessageListener = (message: IMessage) => void;

interface SharedSubscription {
    subscription: StompSubscription;
    listeners: Set<MessageListener>;
}

const MAX_TRACKED_MESSAGE_IDS = 500;
const CURRENT_ROUND_RECOVERY_RETRY_DELAYS_MS = [0, 150, 300, 600] as const;

const subscriptionsByClient = new WeakMap<
    Client,
    Map<string, SharedSubscription>
>();

function addSharedSubscription(
    client: Client,
    destination: string,
    listener: MessageListener,
) {
    let clientSubscriptions = subscriptionsByClient.get(client);

    if (!clientSubscriptions) {
        clientSubscriptions = new Map();
        subscriptionsByClient.set(client, clientSubscriptions);
    }

    let sharedSubscription = clientSubscriptions.get(destination);

    if (!sharedSubscription) {
        const listeners = new Set<MessageListener>();
        const subscription = client.subscribe(destination, (message) => {
            for (const activeListener of listeners) {
                activeListener(message);
            }
        });

        sharedSubscription = {
            subscription,
            listeners,
        };
        clientSubscriptions.set(destination, sharedSubscription);
    }

    sharedSubscription.listeners.add(listener);

    return () => {
        sharedSubscription.listeners.delete(listener);

        if (sharedSubscription.listeners.size > 0) {
            return;
        }

        sharedSubscription.subscription.unsubscribe();
        clientSubscriptions.delete(destination);

        if (clientSubscriptions.size === 0) {
            subscriptionsByClient.delete(client);
        }
    };
}

function getMessageId(message: IMessage) {
    const messageId = message.headers['message-id'];

    return typeof messageId === 'string' && messageId
        ? messageId
        : null;
}

function parseMessage<T>(
    message: IMessage,
    schema: ZodType<T>,
    destination: string,
): T | null {
    let payload: unknown;

    try {
        payload = JSON.parse(message.body) as unknown;
    } catch (error) {
        const errorMessage = `${destination} 메시지의 JSON 파싱에 실패했습니다.`;

        useGameStore.getState().setError(errorMessage);
        console.warn(`[useGameSocket] ${errorMessage}`, error);
        return null;
    }

    const result = schema.safeParse(payload);

    if (!result.success) {
        const errorMessage = `${destination} 메시지 검증에 실패했습니다.`;

        useGameStore.getState().setError(errorMessage);
        console.warn(`[useGameSocket] ${errorMessage}`, {
            payload,
            issues: result.error.issues,
        });
        return null;
    }

    return result.data;
}

export function useGameSocket(inviteCode: string | undefined) {
    const normalizedInviteCode = inviteCode?.trim() ?? '';
    const stompClient = useSocketStore((state) => state.stompClient);
    const connectionStatus = useSocketStore((state) => state.connectionStatus);
    const subscriptionStatus = useGameStore(
        (state) => state.subscriptionStatus,
    );
    const currentRoundNo = useGameStore((state) => state.currentRoundNo);
    const isSubmittingGameInput = useGameStore(
        (state) => state.isSubmittingGameInput,
    );
    const pendingReadyRoundRef = useRef<number | null>(null);
    const reportedReadyRoundsRef = useRef(new Set<number>());
    const reportedPlaybackErrorsRef = useRef(new Set<string>());

    const publishReadyToPlay = useCallback(
        (roundNo: number) => {
            if (
                !normalizedInviteCode ||
                !stompClient ||
                connectionStatus !== 'connected' ||
                subscriptionStatus !== 'subscribed' ||
                reportedReadyRoundsRef.current.has(roundNo)
            ) {
                return false;
            }

            reportedReadyRoundsRef.current.add(roundNo);

            try {
                stompClient.publish({
                    destination: SOCKET_PUBLISH.GAME_READY_TO_PLAY(
                        normalizedInviteCode,
                    ),
                    body: JSON.stringify({ roundNo }),
                });

                if (pendingReadyRoundRef.current === roundNo) {
                    pendingReadyRoundRef.current = null;
                }

                return true;
            } catch (error) {
                reportedReadyRoundsRef.current.delete(roundNo);
                console.warn(
                    '[useGameSocket] player 준비 완료 전송에 실패했습니다.',
                    error,
                );
                return false;
            }
        },
        [
            connectionStatus,
            normalizedInviteCode,
            stompClient,
            subscriptionStatus,
        ],
    );

    const reportPlayerReady = useCallback(
        (roundNo: number) => {
            pendingReadyRoundRef.current = roundNo;
            publishReadyToPlay(roundNo);
        },
        [publishReadyToPlay],
    );

    const reportPlaybackError = useCallback(
        (
            roundNo: number,
            errorCode: number | string | null,
            message: string,
        ) => {
            if (
                !normalizedInviteCode ||
                !stompClient ||
                connectionStatus !== 'connected' ||
                !Number.isInteger(roundNo) ||
                roundNo <= 0
            ) {
                return false;
            }

            const normalizedErrorCode =
                errorCode == null
                    ? 'UNKNOWN'
                    : String(errorCode).slice(0, 100);
            const reportKey = `${roundNo}:${normalizedErrorCode}`;

            if (reportedPlaybackErrorsRef.current.has(reportKey)) {
                return true;
            }

            reportedPlaybackErrorsRef.current.add(reportKey);

            try {
                stompClient.publish({
                    destination: SOCKET_PUBLISH.GAME_PLAYBACK_ERROR(
                        normalizedInviteCode,
                    ),
                    body: JSON.stringify({
                        roundNo,
                        errorCode: normalizedErrorCode,
                        message:
                            (
                                message.trim() ||
                                'YouTube 영상을 재생할 수 없습니다.'
                            ).slice(0, 500),
                    }),
                });
                return true;
            } catch (error) {
                reportedPlaybackErrorsRef.current.delete(reportKey);
                console.warn(
                    '[useGameSocket] 재생 오류 보고에 실패했습니다.',
                    error,
                );
                return false;
            }
        },
        [connectionStatus, normalizedInviteCode, stompClient],
    );

    useEffect(() => {
        const gameStore = useGameStore.getState();
        pendingReadyRoundRef.current = null;
        reportedReadyRoundsRef.current.clear();
        reportedPlaybackErrorsRef.current.clear();

        if (!normalizedInviteCode) {
            gameStore.reset();
            return;
        }

        gameStore.initializeGame(normalizedInviteCode);

        return () => {
            const currentStore = useGameStore.getState();

            if (currentStore.inviteCode === normalizedInviteCode) {
                currentStore.reset();
            }
        };
    }, [normalizedInviteCode]);

    useEffect(() => {
        const pendingRoundNo = pendingReadyRoundRef.current;

        if (pendingRoundNo != null) {
            publishReadyToPlay(pendingRoundNo);
        }
    }, [publishReadyToPlay]);

    useEffect(() => {
        if (!normalizedInviteCode) {
            return;
        }

        let isCancelled = false;
        let retryTimer: ReturnType<typeof setTimeout> | null = null;

        const recoverCurrentRound = async (attempt: number) => {
            const retryDelay =
                CURRENT_ROUND_RECOVERY_RETRY_DELAYS_MS[attempt];

            if (retryDelay == null) {
                return;
            }

            if (retryDelay > 0) {
                await new Promise<void>((resolve) => {
                    retryTimer = setTimeout(resolve, retryDelay);
                });
            }

            if (isCancelled) {
                return;
            }

            try {
                const status =
                    await getCurrentGameRoundStatus(normalizedInviteCode);
                const clientReceivedAtMs = Date.now();

                if (
                    isCancelled ||
                    useGameStore.getState().inviteCode !==
                        normalizedInviteCode
                ) {
                    return;
                }

                useGameStore
                    .getState()
                    .applyCurrentRoundStatus(status, clientReceivedAtMs);
            } catch (error: unknown) {
                if (isCancelled) {
                    return;
                }

                if (
                    attempt + 1 <
                    CURRENT_ROUND_RECOVERY_RETRY_DELAYS_MS.length
                ) {
                    await recoverCurrentRound(attempt + 1);
                    return;
                }

                const errorMessage =
                    '현재 라운드 정보를 불러오지 못했습니다.';

                useGameStore.getState().setError(errorMessage);
                console.warn(`[useGameSocket] ${errorMessage}`, error);
            }
        };

        void recoverCurrentRound(0);

        return () => {
            isCancelled = true;

            if (retryTimer) {
                clearTimeout(retryTimer);
            }
        };
    }, [normalizedInviteCode]);

    useEffect(() => {
        if (!normalizedInviteCode) {
            return;
        }

        const gameStore = useGameStore.getState();

        if (!stompClient || connectionStatus !== 'connected') {
            gameStore.setSubscriptionStatus('idle');
            return;
        }

        let isActive = true;
        const seenMessageIds = new Set<string>();
        const trackedMessageIds: string[] = [];
        const unsubscribeCallbacks: Array<() => void> = [];

        const handleMessage = (
            destination: string,
            message: IMessage,
            applyMessage: (receivedMessage: IMessage) => void,
        ) => {
            if (!isActive) {
                return;
            }

            const messageId = getMessageId(message);

            if (messageId && seenMessageIds.has(messageId)) {
                return;
            }

            if (messageId) {
                seenMessageIds.add(messageId);
                trackedMessageIds.push(messageId);

                if (trackedMessageIds.length > MAX_TRACKED_MESSAGE_IDS) {
                    const oldestMessageId = trackedMessageIds.shift();

                    if (oldestMessageId) {
                        seenMessageIds.delete(oldestMessageId);
                    }
                }
            }

            try {
                applyMessage(message);
            } catch (error) {
                const errorMessage = `${destination} 구독 메시지 처리에 실패했습니다.`;

                useGameStore.getState().setError(errorMessage);
                console.warn(`[useGameSocket] ${errorMessage}`, error);
            }
        };

        const subscribe = (
            destination: string,
            applyMessage: (message: IMessage) => void,
        ) => {
            const unsubscribe = addSharedSubscription(
                stompClient,
                destination,
                (message) => {
                    handleMessage(destination, message, applyMessage);
                },
            );

            unsubscribeCallbacks.push(unsubscribe);
        };

        const unsubscribeAll = () => {
            for (const unsubscribe of unsubscribeCallbacks.splice(0)) {
                unsubscribe();
            }
        };

        gameStore.setSubscriptionStatus('subscribing');
        gameStore.setError(null);

        try {
            const roundDestination =
                SOCKET_SUBSCRIBE.GAME_ROUND(normalizedInviteCode);
            const roundEndDestination =
                SOCKET_SUBSCRIBE.GAME_ROUND_END(normalizedInviteCode);
            const chatDestination =
                SOCKET_SUBSCRIBE.GAME_CHAT(normalizedInviteCode);
            const answersDestination = SOCKET_SUBSCRIBE.GAME_ANSWERS;

            subscribe(roundDestination, (message) => {
                const clientReceivedAtMs = Date.now();
                const event = parseMessage(
                    message,
                    gameRoundEventSchema,
                    roundDestination,
                );

                if (event) {
                    useGameStore
                        .getState()
                        .applyRoundEvent(event, clientReceivedAtMs);
                }
            });

            subscribe(roundEndDestination, (message) => {
                const event = parseMessage(
                    message,
                    gameRoundEndEventSchema,
                    roundEndDestination,
                );

                if (event) {
                    useGameStore.getState().applyRoundEnd(event);
                }
            });

            subscribe(chatDestination, (message) => {
                if (import.meta.env.DEV) {
                    console.debug(
                        '[useGameSocket] 인게임 채팅 raw 수신',
                        {
                            destination:
                                message.headers.destination ??
                                chatDestination,
                            body: message.body,
                        },
                    );
                }

                const chatMessage = parseMessage(
                    message,
                    gameChatMessageSchema,
                    chatDestination,
                );

                if (!chatMessage) {
                    return;
                }

                if (import.meta.env.DEV) {
                    console.debug(
                        '[useGameSocket] 인게임 채팅 수신',
                        chatMessage,
                    );
                }

                if (
                    chatMessage.roomId &&
                    chatMessage.roomId !== normalizedInviteCode
                ) {
                    console.warn(
                        '[useGameSocket] 구독 destination과 채팅 roomId가 일치하지 않습니다.',
                        {
                            destination: chatDestination,
                            inviteCode: normalizedInviteCode,
                            roomId: chatMessage.roomId,
                        },
                    );
                }

                // 구독 destination이 게임별로 분리되어 있으므로 roomId 불일치만으로
                // 정상 수신 메시지를 버리지 않는다.
                useGameStore.getState().appendChatMessage(chatMessage);
            });

            subscribe(answersDestination, (message) => {
                const event = parseMessage(
                    message,
                    gameRoundCorrectEventSchema,
                    answersDestination,
                );

                if (event) {
                    useGameStore.getState().applyCorrectAnswer(event);
                }
            });

            useGameStore.getState().setSubscriptionStatus('subscribed');
        } catch (error) {
            const errorMessage = '인게임 WebSocket 구독에 실패했습니다.';

            unsubscribeAll();
            useGameStore.getState().setSubscriptionStatus('error');
            useGameStore.getState().setError(errorMessage);
            console.warn(`[useGameSocket] ${errorMessage}`, error);
        }

        return () => {
            isActive = false;
            unsubscribeAll();
        };
    }, [connectionStatus, normalizedInviteCode, stompClient]);

    const submitGameInput = useCallback(
        (content: string) => {
            const trimmedContent = content.trim();
            const gameStore = useGameStore.getState();

            if (
                !normalizedInviteCode ||
                !stompClient ||
                connectionStatus !== 'connected' ||
                subscriptionStatus !== 'subscribed' ||
                currentRoundNo == null
            ) {
                gameStore.failGameInputSubmission(
                    currentRoundNo == null
                        ? GAME_COPY.GAME_INPUT_WAITING
                        : GAME_COPY.GAME_INPUT_CONNECTING,
                );
                return false;
            }

            const request: GameInputRequest = {
                roundNo: currentRoundNo,
                content: trimmedContent,
            };
            const parsedRequest =
                gameInputRequestSchema.safeParse(request);

            if (!parsedRequest.success) {
                gameStore.failGameInputSubmission(
                    trimmedContent.length >
                        GAME_INPUT_POLICY.MAX_MESSAGE_LENGTH
                        ? GAME_COPY.GAME_INPUT_TOO_LONG
                        : '정답 또는 메시지를 입력해주세요.',
                );
                return false;
            }

            if (!gameStore.startGameInputSubmission()) {
                return false;
            }

            try {
                const destination =
                    SOCKET_PUBLISH.GAME_INPUT(normalizedInviteCode);

                if (import.meta.env.DEV) {
                    console.debug(
                        '[useGameSocket] 인게임 통합 입력 publish',
                        {
                            destination,
                            payload: parsedRequest.data,
                        },
                    );
                }

                stompClient.publish({
                    destination,
                    body: JSON.stringify(parsedRequest.data),
                });
                gameStore.completeGameInputSubmission(
                    parsedRequest.data.content,
                );
                return true;
            } catch (error) {
                const errorMessage =
                    '정답 또는 메시지 전송에 실패했습니다.';

                gameStore.failGameInputSubmission(errorMessage);
                console.warn(`[useGameSocket] ${errorMessage}`, error);
                return false;
            } finally {
                gameStore.finishGameInputSubmission();
            }
        },
        [
            connectionStatus,
            currentRoundNo,
            normalizedInviteCode,
            stompClient,
            subscriptionStatus,
        ],
    );

    return {
        connectionStatus,
        subscriptionStatus,
        canSubmitGameInput:
            connectionStatus === 'connected' &&
            subscriptionStatus === 'subscribed' &&
            currentRoundNo != null &&
            !isSubmittingGameInput,
        reportPlayerReady,
        reportPlaybackError,
        submitGameInput,
    };
}
