import { useCallback, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import {
    SOCKET_MESSAGES,
    SOCKET_PUBLISH,
    SOCKET_SUBSCRIBE,
} from '../constants/socketEvents';
import { useSocketStore } from '../store/useSocketStore';
import { lobbyDetailQueryKey } from './useLobbyDetail';

type LobbyGameStatus = 'idle' | 'started';

function parseSocketMessageType(body: string): string {
    try {
        const parsed = JSON.parse(body) as unknown;

        if (typeof parsed === 'string') {
            return parsed;
        }

        if (
            parsed &&
            typeof parsed === 'object' &&
            'type' in parsed &&
            typeof parsed.type === 'string'
        ) {
            return parsed.type;
        }
    } catch {
        return body;
    }

    return body;
}

export function useLobbySocket(
    inviteCode: string | undefined,
    onLobbyMessageBody?: (body: string) => void,
) {
    const normalizedInviteCode = inviteCode?.trim() ?? '';
    const queryClient = useQueryClient();
    const stompClient = useSocketStore((state) => state.stompClient);
    const connectionStatus = useSocketStore((state) => state.connectionStatus);
    const [gameStartedInviteCode, setGameStartedInviteCode] =
        useState<string | null>(null);

    useEffect(() => {
        if (
            !normalizedInviteCode ||
            !stompClient ||
            connectionStatus !== 'connected'
        ) {
            return;
        }

        const lobbySubscription = stompClient.subscribe(
            SOCKET_SUBSCRIBE.LOBBY(normalizedInviteCode),
            (frame) => {
                // 이 구독 자체가 BE의 로비 참여자 등록 트리거다.
                onLobbyMessageBody?.(frame.body);
            },
        );

        const refreshSubscription = stompClient.subscribe(
            SOCKET_SUBSCRIBE.LOBBY_REFRESH(normalizedInviteCode),
            (frame) => {
                const messageType = parseSocketMessageType(frame.body);

                if (messageType !== SOCKET_MESSAGES.REFRESH_LOBBY_INFO) {
                    return;
                }

                void queryClient.invalidateQueries({
                    queryKey: lobbyDetailQueryKey(normalizedInviteCode),
                });
            },
        );

        const gameSubscription = stompClient.subscribe(
            SOCKET_SUBSCRIBE.LOBBY_GAME(normalizedInviteCode),
            (frame) => {
                const messageType = parseSocketMessageType(frame.body);

                if (messageType === SOCKET_MESSAGES.GAME_STARTED) {
                    setGameStartedInviteCode(normalizedInviteCode);
                }
            },
        );

        void queryClient.invalidateQueries({
            queryKey: lobbyDetailQueryKey(normalizedInviteCode),
        });

        return () => {
            lobbySubscription.unsubscribe();
            refreshSubscription.unsubscribe();
            gameSubscription.unsubscribe();
        };
    }, [
        normalizedInviteCode,
        stompClient,
        connectionStatus,
        queryClient,
        onLobbyMessageBody,
    ]);

    // 로비에서 나갈 때 BE에 명시적 퇴장을 알린다.
    // 구독 해제만으로는 BE가 연결 종료(새로고침/종료) 전까지 참여자를 유지하므로,
    // 다른 참여자 화면에서 즉시 빠지려면 leave 메시지를 보내야 한다.
    const leaveLobby = useCallback(() => {
        if (
            !stompClient ||
            connectionStatus !== 'connected' ||
            !normalizedInviteCode
        ) {
            return;
        }

        try {
            stompClient.publish({
                destination: SOCKET_PUBLISH.LOBBY_LEAVE(normalizedInviteCode),
            });
        } catch (error) {
            // 발행 실패가 화면 이동을 막지 않도록 경고만 남긴다.
            console.warn('[useLobbySocket] 로비 퇴장 메시지 전송 실패:', error);
        }
    }, [connectionStatus, normalizedInviteCode, stompClient]);

    const gameStatus: LobbyGameStatus =
        gameStartedInviteCode === normalizedInviteCode ? 'started' : 'idle';

    return {
        connectionStatus,
        gameStatus,
        leaveLobby,
    };
}
