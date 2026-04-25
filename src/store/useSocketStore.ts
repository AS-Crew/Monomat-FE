import { create } from 'zustand';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

// useSocketStore는 소켓 연결 관리라는 단일 책임만 갖는다.
import { WS_ENDPOINT } from '../constants/endpoints';

// 소켓 연결 상태를 세 단계로 구분한다.
// UI에서 "연결 중...", "연결됨", "연결 끊김" 표시에 활용할 수 있다.
type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

interface SocketState {
    stompClient: Client | null;
    connectionStatus: ConnectionStatus;
    connect: (uuid: string) => void;
    disconnect: () => Promise<void>;
}

export const useSocketStore = create<SocketState>((set, get) => ({
    stompClient: null,
    connectionStatus: 'disconnected',

    connect: (uuid: string) => {
        const { connectionStatus, stompClient: existingClient } = get();

        // 이미 연결 중이거나 연결된 상태라면 중복 실행을 막는다.
        if (connectionStatus === 'connecting' || connectionStatus === 'connected') {
            console.warn('[Socket] 이미 연결 중이거나 연결된 상태입니다.');
            return;
        }

        // 이전에 연결이 실패하는 등의 이유로 인스턴스가 남아있을 경우 먼저 정리한다.
        if (existingClient) {
            void existingClient.deactivate();
            set({ stompClient: null, connectionStatus: 'disconnected' });
        }

        const client = new Client({
            // SockJS는 WebSocket 연결이 불가능한 환경(일부 방화벽 등)에서
            // HTTP 폴링 등으로 자동 대체하여 안정적으로 동작하게 해준다.
            webSocketFactory: () => new SockJS(WS_ENDPOINT) as WebSocket,

            // STOMP 연결 시 UUID를 헤더에 포함한다.
            // Spring Security에서 이 값으로 게스트 세션을 식별한다.
            connectHeaders: { uuid },

            // 연결이 끊어지면 5초 후 자동으로 재연결을 시도
            reconnectDelay: 5000,

            onConnect: () => {
                console.info('[Socket] 연결 성공');
                set({ connectionStatus: 'connected' });
            },

            onDisconnect: () => {
                console.info('[Socket] 연결 종료 - 5초 후 재연결 시도');
                set({ connectionStatus: 'disconnected' });
            },

            onStompError: (frame) => {
                console.error('[Socket] STOMP 에러 발생:', frame.headers['message']);
                set({ connectionStatus: 'disconnected' });
            },

            onWebSocketError: (event) => {
                console.error('[Socket] WebSocket 에러 발생:', event);
                set({ connectionStatus: 'disconnected' });
            },
        });

        set({ connectionStatus: 'connecting' });
        client.activate();
        set({ stompClient: client });
    },

    disconnect: async () => {
        const { stompClient } = get();
        if (!stompClient) return;

        // 재연결 시도를 먼저 차단한 뒤 연결을 끊는다.
        // 이 순서가 바뀌면 deactivate() 도중 재연결을 시도하는 경합 상태가 발생할 수 있다.
        stompClient.reconnectDelay = 0;

        if (stompClient.active) {
            await stompClient.deactivate();
        }

        set({ stompClient: null, connectionStatus: 'disconnected' });
        console.info('[Socket] 소켓 연결 해제 완료');
    },
}));