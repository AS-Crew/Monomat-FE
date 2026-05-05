// 전체 채팅 Pub/Sub 연동 커스텀 훅.
//
// [책임]
// - 컴포넌트 마운트 시 /topic/chat/global 구독
// - 수신 메시지를 로컬 상태에 누적 (최대 MAX_MESSAGES개 유지)
// - 메시지 발행 (/app/chat/global)
// - 컴포넌트 언마운트 시 구독 해제

import { useState, useEffect, useCallback } from 'react';
import { useSocketStore } from '../store/useSocketStore';
import { SOCKET_PUBLISH, SOCKET_SUBSCRIBE } from '../constants/socketEvents';
import type { ChatMessage } from '../types/chat';

// 기능명세서: Redis List 최근 50개 유지 정책과 동일하게 맞춤
const MAX_MESSAGES = 50;

interface UseGlobalChatReturn {
    messages: ChatMessage[];
    sendMessage: (content: string) => void;
}

export function useGlobalChat(): UseGlobalChatReturn {
    const stompClient = useSocketStore((state) => state.stompClient);
    const connectionStatus = useSocketStore((state) => state.connectionStatus);
    const [messages, setMessages] = useState<ChatMessage[]>([]);

    useEffect(() => {
        // 연결이 완료된 상태에서만 구독을 시도한다.
        // stompClient가 있어도 'connecting' 상태면 subscribe 호출이 실패한다.
        if (!stompClient || connectionStatus !== 'connected') return;

        const subscription = stompClient.subscribe(
            SOCKET_SUBSCRIBE.CHAT_GLOBAL,
            (frame) => {
                try {
                    const received = JSON.parse(frame.body) as ChatMessage;

                    setMessages((prev) => {
                        const next = [...prev, received];
                        // 50개 초과 시 가장 오래된 메시지부터 제거 (FIFO)
                        return next.length > MAX_MESSAGES
                            ? next.slice(next.length - MAX_MESSAGES)
                            : next;
                    });
                } catch (error) {
                    console.error('[useGlobalChat] 메시지 파싱 실패:', error);
                }
            },
        );

        // cleanup: 컴포넌트 언마운트 또는 연결 상태 변경 시 구독 해제
        return () => {
            subscription.unsubscribe();
        };
    }, [stompClient, connectionStatus]);

    const sendMessage = useCallback(
        (content: string) => {
            // 연결이 안 된 상태에서 발행 시도 방어
            if (!stompClient || connectionStatus !== 'connected') {
                console.warn('[useGlobalChat] 소켓 미연결 상태에서 메시지 발행 시도');
                return;
            }

            const trimmed = content.trim();
            if (!trimmed) return;

            // BE ChatController가 기대하는 형식
            // sender는 서버가 세션에서 덮어쓰므로 빈 문자열로 전송
            stompClient.publish({
                destination: SOCKET_PUBLISH.CHAT_GLOBAL,
                body: JSON.stringify({
                    type: 'CHAT',
                    content: trimmed,
                }),
            });
        },
        [stompClient, connectionStatus],
    );

    return { messages, sendMessage };
}
