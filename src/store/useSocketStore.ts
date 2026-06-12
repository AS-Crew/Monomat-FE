import { create } from 'zustand';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

import { WS_ENDPOINT } from '../constants/endpoints';

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

interface SocketState {
    stompClient: Client | null;
    connectionStatus: ConnectionStatus;
    shouldReconnect: boolean;
    connect: (uuid: string) => void;
    disconnect: () => Promise<void>;
}

const RECONNECT_DELAY_MS = 5000;

export const useSocketStore = create<SocketState>((set, get) => ({
    stompClient: null,
    connectionStatus: 'disconnected',
    shouldReconnect: false,

    connect: (uuid: string) => {
        const { connectionStatus, stompClient: existingClient } = get();

        if (connectionStatus === 'connecting' || connectionStatus === 'connected') {
            console.warn('[Socket] 이미 연결 중이거나 연결된 상태입니다.');
            return;
        }

        if (existingClient) {
            existingClient.reconnectDelay = 0;
            void existingClient.deactivate();

            set({
                stompClient: null,
                connectionStatus: 'disconnected',
                shouldReconnect: false,
            });
        }

        const client = new Client({
            webSocketFactory: () => new SockJS(WS_ENDPOINT) as WebSocket,

            connectHeaders: {
                userIdentifier: uuid,
            },

            reconnectDelay: RECONNECT_DELAY_MS,

            onConnect: () => {
                console.info('[Socket] 연결 성공');

                set({
                    connectionStatus: 'connected',
                    shouldReconnect: true,
                });
            },

            onDisconnect: () => {
                console.info('[Socket] STOMP 연결 종료');

                const { shouldReconnect } = get();

                set({
                    connectionStatus: shouldReconnect ? 'connecting' : 'disconnected',
                });
            },

            onStompError: (frame) => {
                console.error('[Socket] STOMP 에러 발생:', frame.headers['message']);

                set({
                    connectionStatus: 'connecting',
                    shouldReconnect: true,
                });
            },

            onWebSocketError: (event) => {
                console.error('[Socket] WebSocket 에러 발생:', event);

                set({
                    connectionStatus: 'connecting',
                    shouldReconnect: true,
                });
            },

            onWebSocketClose: () => {
                const { shouldReconnect } = get();

                if (!shouldReconnect) {
                    console.info('[Socket] WebSocket 연결 종료');

                    set({
                        connectionStatus: 'disconnected',
                    });

                    return;
                }

                console.info('[Socket] WebSocket 연결 종료 - 재연결 대기');

                set({
                    connectionStatus: 'connecting',
                });
            },
        });

        set({
            stompClient: client,
            connectionStatus: 'connecting',
            shouldReconnect: true,
        });

        client.activate();
    },

    disconnect: async () => {
        const { stompClient } = get();

        set({
            shouldReconnect: false,
        });

        if (!stompClient) {
            set({
                connectionStatus: 'disconnected',
            });
            return;
        }

        stompClient.reconnectDelay = 0;

        if (stompClient.active) {
            await stompClient.deactivate();
        }

        set({
            stompClient: null,
            connectionStatus: 'disconnected',
            shouldReconnect: false,
        });

        console.info('[Socket] 소켓 연결 해제 완료');
    },
}));