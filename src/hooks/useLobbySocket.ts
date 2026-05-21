import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { SOCKET_MESSAGES, SOCKET_SUBSCRIBE } from '../constants/socketEvents';
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

export function useLobbySocket(inviteCode: string | undefined) {
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
            () => {
                // 이 구독 자체가 BE의 로비 참여자 등록 트리거다.
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
    }, [normalizedInviteCode, stompClient, connectionStatus, queryClient]);

    const gameStatus: LobbyGameStatus =
        gameStartedInviteCode === normalizedInviteCode ? 'started' : 'idle';

    return {
        connectionStatus,
        gameStatus,
    };
}
