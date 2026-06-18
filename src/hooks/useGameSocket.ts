import { useCallback, useEffect } from 'react';

import { getCurrentGameRoundStatus } from '../api/gameApi';
import { GAME_CHAT_POLICY } from '../constants/game';
import {
    SOCKET_PUBLISH,
    SOCKET_SUBSCRIBE,
} from '../constants/socketEvents';
import {
    gameChatMessageSchema,
    gameRoundCorrectEventSchema,
    gameRoundEndEventSchema,
    gameRoundEventSchema,
} from '../schemas/gameSchema';
import { useGameStore } from '../store/useGameStore';
import { useSocketStore } from '../store/useSocketStore';

import type { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import type { ZodType } from 'zod';

type MessageListener = (message: IMessage) => void;

interface SharedSubscription {
    subscription: StompSubscription;
    listeners: Set<MessageListener>;
}

const MAX_TRACKED_MESSAGE_IDS = 500;

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
        console.warn(`[useGameSocket] ${errorMessage}`, result.error);
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

    useEffect(() => {
        const gameStore = useGameStore.getState();

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
        if (!normalizedInviteCode) {
            return;
        }

        let isCancelled = false;

        void getCurrentGameRoundStatus(normalizedInviteCode)
            .then((status) => {
                if (
                    isCancelled ||
                    useGameStore.getState().inviteCode !==
                        normalizedInviteCode
                ) {
                    return;
                }

                useGameStore.getState().applyCurrentRoundStatus(status);
            })
            .catch((error: unknown) => {
                if (isCancelled) {
                    return;
                }

                const errorMessage =
                    '현재 라운드 정보를 불러오지 못했습니다.';

                useGameStore.getState().setError(errorMessage);
                console.warn(`[useGameSocket] ${errorMessage}`, error);
            });

        return () => {
            isCancelled = true;
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
                const event = parseMessage(
                    message,
                    gameRoundEventSchema,
                    roundDestination,
                );

                if (event) {
                    useGameStore.getState().applyRoundEvent(event);
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
                const chatMessage = parseMessage(
                    message,
                    gameChatMessageSchema,
                    chatDestination,
                );

                if (
                    chatMessage &&
                    chatMessage.roomId === normalizedInviteCode
                ) {
                    useGameStore.getState().appendChatMessage(chatMessage);
                }
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

    const sendMessage = useCallback(
        (content: string) => {
            const trimmedContent = content.trim();

            if (
                !normalizedInviteCode ||
                !stompClient ||
                connectionStatus !== 'connected' ||
                subscriptionStatus !== 'subscribed' ||
                currentRoundNo == null
            ) {
                useGameStore.getState().setError(
                    '게임 채팅을 보낼 수 없는 연결 상태입니다.',
                );
                return false;
            }

            if (
                !trimmedContent ||
                trimmedContent.length > GAME_CHAT_POLICY.MAX_MESSAGE_LENGTH
            ) {
                useGameStore.getState().setError(
                    `게임 채팅은 1자 이상 ${GAME_CHAT_POLICY.MAX_MESSAGE_LENGTH}자 이하로 입력해주세요.`,
                );
                return false;
            }

            try {
                stompClient.publish({
                    destination:
                        SOCKET_PUBLISH.GAME_CHAT(normalizedInviteCode),
                    body: JSON.stringify({
                        roundNo: currentRoundNo,
                        content: trimmedContent,
                    }),
                });
                useGameStore.getState().setError(null);
                return true;
            } catch (error) {
                const errorMessage = '게임 채팅 전송에 실패했습니다.';

                useGameStore.getState().setError(errorMessage);
                console.warn(`[useGameSocket] ${errorMessage}`, error);
                return false;
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
        canSendMessage:
            connectionStatus === 'connected' &&
            subscriptionStatus === 'subscribed' &&
            currentRoundNo != null,
        sendMessage,
    };
}
