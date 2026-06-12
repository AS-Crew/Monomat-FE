import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';

import { getRecentLobbyChats } from '../api/lobbyChatApi';
import {
    LOBBY_CHAT_COPY,
    LOBBY_CHAT_POLICY,
} from '../constants/lobby';
import { SOCKET_PUBLISH } from '../constants/socketEvents';
import { lobbyChatMessageSchema } from '../schemas/lobbyChatSchema';
import { useSocketStore } from '../store/useSocketStore';

import type {
    LobbyChatMessage,
    SendLobbyChatMessageRequest,
} from '../types/lobbyChat';

const SEND_STATE_RESET_DELAY_MS = 150;

function getErrorMessage(error: unknown, fallbackMessage: string) {
    return error instanceof Error && error.message
        ? error.message
        : fallbackMessage;
}

function getMessageDeduplicationKey(message: LobbyChatMessage) {
    const messageId = message.messageId?.trim();

    if (messageId) {
        return `id:${messageId}`;
    }

    const sentAt = message.sentAt?.trim() || message.timestamp?.trim();

    if (!sentAt) {
        return null;
    }

    return [
        'fallback',
        message.type,
        sentAt,
        message.content,
    ].join(':');
}

function mergeMessages(
    existingMessages: LobbyChatMessage[],
    incomingMessages: LobbyChatMessage[],
) {
    const mergedMessages = [...existingMessages];
    const seenKeys = new Set(
        existingMessages
            .map(getMessageDeduplicationKey)
            .filter((key): key is string => Boolean(key)),
    );

    for (const message of incomingMessages) {
        const key = getMessageDeduplicationKey(message);

        if (key && seenKeys.has(key)) {
            continue;
        }

        mergedMessages.push(message);

        if (key) {
            seenKeys.add(key);
        }
    }

    return mergedMessages.slice(-LOBBY_CHAT_POLICY.MAX_RECENT_MESSAGES);
}

export function useLobbyChat(inviteCode: string | undefined) {
    const normalizedInviteCode = inviteCode?.trim() ?? '';
    const stompClient = useSocketStore((state) => state.stompClient);
    const connectionStatus = useSocketStore((state) => state.connectionStatus);
    const [messages, setMessages] = useState<LobbyChatMessage[]>([]);
    const [isRecentChatsLoading, setIsRecentChatsLoading] = useState(false);
    const [hasLoadedRecentChats, setHasLoadedRecentChats] = useState(false);
    const [recentChatsError, setRecentChatsError] = useState<string | null>(null);
    const [sendError, setSendError] = useState<string | null>(null);
    const [isSending, setIsSending] = useState(false);
    const lastSentAtRef = useRef(0);
    const lastSentMessageRef = useRef<{
        content: string;
        sentAt: number;
    } | null>(null);
    const sendStateTimerRef = useRef<number | null>(null);

    useEffect(() => {
        let isCancelled = false;

        setMessages([]);
        setRecentChatsError(null);
        setSendError(null);
        setHasLoadedRecentChats(false);

        if (!normalizedInviteCode) {
            setIsRecentChatsLoading(false);
            return;
        }

        setIsRecentChatsLoading(true);

        void getRecentLobbyChats(normalizedInviteCode)
            .then((recentMessages) => {
                if (isCancelled) {
                    return;
                }

                setMessages((liveMessages) =>
                    mergeMessages(recentMessages, liveMessages),
                );
            })
            .catch((error: unknown) => {
                if (isCancelled) {
                    return;
                }

                setRecentChatsError(
                    getErrorMessage(
                        error,
                        LOBBY_CHAT_COPY.RECENT_FETCH_FAILED,
                    ),
                );
            })
            .finally(() => {
                if (isCancelled) {
                    return;
                }

                setIsRecentChatsLoading(false);
                setHasLoadedRecentChats(true);
            });

        return () => {
            isCancelled = true;
        };
    }, [normalizedInviteCode]);

    useEffect(() => {
        return () => {
            if (sendStateTimerRef.current != null) {
                window.clearTimeout(sendStateTimerRef.current);
            }
        };
    }, []);

    const handleLobbyMessageBody = useCallback(
        (body: string) => {
            let payload: unknown;

            try {
                payload = JSON.parse(body) as unknown;
            } catch (error) {
                console.error('[useLobbyChat] 채팅 메시지 JSON 파싱 실패:', error);
                return;
            }

            const parsed = lobbyChatMessageSchema.safeParse(payload);

            if (!parsed.success) {
                console.error(
                    '[useLobbyChat] 채팅 메시지 검증 실패:',
                    parsed.error,
                );
                return;
            }

            if (
                parsed.data.roomId &&
                parsed.data.roomId !== normalizedInviteCode
            ) {
                return;
            }

            setMessages((currentMessages) =>
                mergeMessages(currentMessages, [parsed.data]),
            );
        },
        [normalizedInviteCode],
    );

    const sendMessage = useCallback(
        (content: string) => {
            const trimmedContent = content.trim();

            setSendError(null);

            if (
                !stompClient ||
                connectionStatus !== 'connected' ||
                !normalizedInviteCode
            ) {
                setSendError(LOBBY_CHAT_COPY.SEND_DISCONNECTED);
                return false;
            }

            if (!trimmedContent) {
                setSendError(LOBBY_CHAT_COPY.MESSAGE_REQUIRED);
                return false;
            }

            if (trimmedContent.length > LOBBY_CHAT_POLICY.MAX_MESSAGE_LENGTH) {
                setSendError(LOBBY_CHAT_COPY.MESSAGE_TOO_LONG);
                return false;
            }

            const now = Date.now();

            if (
                now - lastSentAtRef.current <
                LOBBY_CHAT_POLICY.SEND_COOLDOWN_MS
            ) {
                setSendError(LOBBY_CHAT_COPY.SEND_TOO_FAST);
                return false;
            }

            const lastSentMessage = lastSentMessageRef.current;

            if (
                lastSentMessage?.content === trimmedContent &&
                now - lastSentMessage.sentAt <
                LOBBY_CHAT_POLICY.REPEATED_MESSAGE_COOLDOWN_MS
            ) {
                setSendError(LOBBY_CHAT_COPY.SEND_REPEATED);
                return false;
            }

            const request: SendLobbyChatMessageRequest = {
                content: trimmedContent,
            };

            setIsSending(true);

            try {
                stompClient.publish({
                    destination: SOCKET_PUBLISH.CHAT_LOBBY(
                        normalizedInviteCode,
                    ),
                    body: JSON.stringify(request),
                });

                lastSentAtRef.current = now;
                lastSentMessageRef.current = {
                    content: trimmedContent,
                    sentAt: now,
                };

                return true;
            } catch (error) {
                console.error('[useLobbyChat] 채팅 메시지 전송 실패:', error);
                setSendError(
                    getErrorMessage(error, LOBBY_CHAT_COPY.SEND_FAILED),
                );
                return false;
            } finally {
                if (sendStateTimerRef.current != null) {
                    window.clearTimeout(sendStateTimerRef.current);
                }

                sendStateTimerRef.current = window.setTimeout(() => {
                    setIsSending(false);
                    sendStateTimerRef.current = null;
                }, SEND_STATE_RESET_DELAY_MS);
            }
        },
        [connectionStatus, normalizedInviteCode, stompClient],
    );

    return {
        messages,
        connectionStatus,
        isRecentChatsLoading,
        hasLoadedRecentChats,
        recentChatsError,
        sendError,
        isSending,
        handleLobbyMessageBody,
        sendMessage,
    };
}
