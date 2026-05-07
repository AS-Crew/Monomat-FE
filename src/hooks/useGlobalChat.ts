import { useState, useEffect, useCallback } from 'react';
import { useSocketStore } from '../store/useSocketStore';
import { SOCKET_PUBLISH, SOCKET_SUBSCRIBE } from '../constants/socketEvents';
import type { ChatMessage } from '../types/chat';

const MAX_MESSAGES = 50;

interface UseGlobalChatReturn {
    messages: ChatMessage[];
    sendMessage: (content: string) => boolean;
}

export function useGlobalChat(): UseGlobalChatReturn {
    const stompClient = useSocketStore((state) => state.stompClient);
    const connectionStatus = useSocketStore((state) => state.connectionStatus);
    const [messages, setMessages] = useState<ChatMessage[]>([]);

    useEffect(() => {
        if (!stompClient || connectionStatus !== 'connected') {
            return;
        }

        const subscription = stompClient.subscribe(
            SOCKET_SUBSCRIBE.CHAT_GLOBAL,
            (frame) => {
                try {
                    const received = JSON.parse(frame.body) as ChatMessage;

                    setMessages((prev) => {
                        const next = [...prev, received];

                        return next.length > MAX_MESSAGES
                            ? next.slice(next.length - MAX_MESSAGES)
                            : next;
                    });
                } catch (error) {
                    console.error('[useGlobalChat] 메시지 파싱 실패:', error);
                }
            },
        );

        return () => {
            subscription.unsubscribe();
        };
    }, [stompClient, connectionStatus]);

    const sendMessage = useCallback(
        (content: string): boolean => {
            if (!stompClient || connectionStatus !== 'connected') {
                console.warn('[useGlobalChat] 소켓 미연결 상태에서 메시지 발행 시도');
                return false;
            }

            const trimmed = content.trim();

            if (!trimmed) {
                return false;
            }

            stompClient.publish({
                destination: SOCKET_PUBLISH.CHAT_GLOBAL,
                body: JSON.stringify({
                    type: 'CHAT',
                    content: trimmed,
                }),
            });

            return true;
        },
        [stompClient, connectionStatus],
    );

    return { messages, sendMessage };
}