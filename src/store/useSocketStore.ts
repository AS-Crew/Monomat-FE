import { create } from 'zustand';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

// ── 상수 ──────────────────────────────────────────────────────────────────────
// 환경별 WebSocket 엔드포인트를 .env 파일에서 가져옵니다.
// 개발: .env.development / 배포: .env.production
const WS_ENDPOINT = import.meta.env.VITE_WS_URL;

// ── 타입 정의 ─────────────────────────────────────────────────────────────────
// 이 스토어가 관리할 상태(State)와 액션(Action)의 타입을 정의합니다.
interface SocketState {
    // STOMP 클라이언트 인스턴스. 연결 전에는 null입니다.
    stompClient: Client | null;

    // 실제 STOMP 세션이 맺어진 상태인지 나타내는 플래그.
    // UI에서 "연결 중..." 표시나 버튼 활성화 여부 등에 활용합니다.
    isConnected: boolean;

    // uuid를 받아 WebSocket 연결을 시작하는 액션
    connect: (uuid: string) => void;

    disconnect: () => Promise<void>;
}

// ── 스토어 생성 ───────────────────────────────────────────────────────────────
// create<타입>((set, get) => ({ ... })) 형태가 Zustand의 기본 패턴입니다.
// - set: 상태를 변경할 때 사용
// - get: 현재 상태를 읽을 때 사용 (액션 내부에서 현재 상태 확인 시 필요)
export const useSocketStore = create<SocketState>((set, get) => ({

    // ── 초기 상태 ──────────────────────────────────────────────────────────────
    stompClient: null,
    isConnected: false,

    // ── connect 액션 ───────────────────────────────────────────────────────────
    connect: (uuid: string) => {
        const existingClient = get().stompClient;

        // [멱등성 보장]
        // active 상태면 이미 연결 중이므로 중복 실행을 막습니다.
        if (existingClient?.active) {
            console.warn('[Socket] 이미 활성화된 세션이 있습니다.');
            return;
        }

        // [인스턴스 누수 방지]
        // active는 아니지만 이전 인스턴스가 남아있는 경우 (연결 실패 등)
        // 새 클라이언트를 만들기 전에 기존 인스턴스를 먼저 정리합니다.
        if (existingClient) {
            existingClient.deactivate();
            set({ stompClient: null, isConnected: false });
        }

        const client = new Client({
            // [SockJS 주입]
            // brokerURL('ws://...') 대신 webSocketFactory를 쓰는 이유:
            // Spring 서버가 SockJS 방식으로 열려 있기 때문입니다.
            // SockJS는 WebSocket 연결이 실패할 경우 HTTP 폴링 등으로
            // 자동 대체(fallback)하여 방화벽 환경에서도 안정적으로 동작합니다.
            webSocketFactory: () => new SockJS(WS_ENDPOINT),

            // [인증 헤더]
            // STOMP CONNECT 프레임에 UUID를 포함합니다.
            // 추후 Spring Security에서 이 헤더를 읽어 게스트 세션을 검증할 예정입니다.
            connectHeaders: {
                'X-Guest-UUID': uuid,
            },

            // [재연결 정책]
            // 네트워크 일시 단절 시 5초 간격으로 자동 재연결을 시도합니다.
            // 0으로 설정하면 자동 재연결을 하지 않습니다.
            reconnectDelay: 5000,

            // [연결 성공 콜백]
            // STOMP 세션이 정상적으로 맺어지면 실행됩니다.
            // isConnected를 true로 바꿔 UI가 연결 상태를 인식하게 합니다.
            onConnect: () => {
                console.info('[Socket] 연결 성공');
                set({ isConnected: true });
            },

            // [연결 종료 콜백]
            // 정상 종료 또는 예기치 않은 단절 시 실행됩니다.
            // reconnectDelay가 설정되어 있으므로 단절 시 5초 후 자동 재연결을 시도합니다.
            onDisconnect: () => {
                console.info('[Socket] 연결 종료 - 5초 후 재연결 시도');
                set({ isConnected: false });
            },

            // [STOMP 에러 핸들링]
            // 서버가 STOMP ERROR 프레임을 보낼 때 실행됩니다.
            // 예 : 인증 실패, 잘못된 구독 경로 등
            onStompError: (frame) => {
                console.error('[Socket] STOMP 에러 발생:', frame.headers['message']);
                set({ isConnected: false });
            },

            // [WebSocket 에러 핸들링]
            // WebSocket 연결 자체가 실패하거나 끊어질 때 실행됩니다.
            // 예 : 네트워크 단절, 서버 다운
            onWebSocketError: (event) => {
                console.error('[Socket] WebSocket 에러 발생:', event);
                set({ isConnected: false });
            },
        });

        // STOMP 클라이언트를 활성화합니다 (실제 WebSocket 연결 시작).
        client.activate();

        // 생성된 클라이언트 인스턴스를 스토어에 저장합니다.
        // 이후 다른 컴포넌트에서 이 클라이언트를 통해 메시지를 보내거나 구독할 수 있습니다.
        set({ stompClient: client });
    },

    // ── disconnect 액션 ────────────────────────────────────────────────────────
    disconnect: async () => {
        const { stompClient } = get();

        // 연결된 클라이언트가 없으면 아무것도 하지 않습니다.
        if (!stompClient) return;

        // STOMP 세션을 비활성화합니다.
        // deactivate()는 Promise를 반환하므로 완전히 종료될 때까지 기다립니다.
        await stompClient.deactivate();

        // 스토어 상태를 초기값으로 되돌립니다.
        set({ stompClient: null, isConnected: false });

        console.info('[Socket] 소켓 연결 해제 완료');
    },

}));