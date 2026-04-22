import { create } from 'zustand';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

// ── 상수 ──────────────────────────────────────────────────────────────────────
// 환경별 WebSocket 엔드포인트를 .env 파일에서 가져옵니다.
// 개발: .env.development / 배포: .env.production
const WS_ENDPOINT = import.meta.env.VITE_WS_URL;

// [엔드포인트 유효성 검증]
// 앱 초기화 시점에 환경변수 누락을 즉시 감지합니다.
if (!WS_ENDPOINT) {
    throw new Error(
        '[Socket] VITE_WS_URL 환경변수가 설정되지 않았습니다.\n' +
        '.env.development 또는 .env.production 파일을 확인해주세요.'
    );
}

// ── 타입 정의 ─────────────────────────────────────────────────────────────────
// 소켓 연결 상태를 3단계로 구분합니다.
// - disconnected : 연결 끊김 또는 초기 상태
// - connecting   : 연결 시도 중 (이 상태에서 connect() 재호출 차단)
// - connected    : STOMP 세션 수립 완료
type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

// 이 스토어가 관리할 상태(State)와 액션(Action)의 타입을 정의합니다.
interface SocketState {
    // STOMP 클라이언트 인스턴스. 연결 전에는 null입니다.
    stompClient: Client | null;

    // 소켓 연결 상태. UI에서 "연결 중..." 표시나 버튼 활성화 여부 등에 활용합니다.
    connectionStatus: ConnectionStatus;

    // uuid를 받아 WebSocket 연결을 시작하는 액션
    connect: (uuid: string) => void;

    // 소켓 연결을 종료하는 액션
    disconnect: () => Promise<void>;
}

// ── 스토어 생성 ───────────────────────────────────────────────────────────────
// create<타입>((set, get) => ({ ... })) 형태가 Zustand의 기본 패턴입니다.
// - set: 상태를 변경할 때 사용
// - get: 현재 상태를 읽을 때 사용 (액션 내부에서 현재 상태 확인 시 필요)
export const useSocketStore = create<SocketState>((set, get) => ({

    // ── 초기 상태 ──────────────────────────────────────────────────────────────
    stompClient: null,
    connectionStatus: 'disconnected',

    // ── connect 액션 ───────────────────────────────────────────────────────────
    connect: (uuid: string) => {
        const { connectionStatus, stompClient: existingClient } = get();

        // [멱등성 보장]
        // connecting 또는 connected 상태면 중복 실행을 막습니다.
        // 기존 stompClient?.active 체크보다 명확하게 상태값으로 판단합니다.
        if (connectionStatus === 'connecting' || connectionStatus === 'connected') {
            console.warn('[Socket] 이미 연결 중이거나 연결된 상태입니다.');
            return;
        }

        // [인스턴스 누수 방지]
        // disconnected 상태지만 이전 인스턴스가 남아있는 경우 (연결 실패 등)
        // 새 클라이언트를 만들기 전에 기존 인스턴스를 먼저 정리합니다.
        if (existingClient) {
            void existingClient.deactivate();
            set({ stompClient: null, connectionStatus: 'disconnected' });
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
                'uuid': uuid,
            },

            // [재연결 정책]
            // 네트워크 일시 단절 시 5초 간격으로 자동 재연결을 시도합니다.
            // 0으로 설정하면 자동 재연결을 하지 않습니다.
            reconnectDelay: 5000,

            // [연결 성공 콜백]
            // STOMP 세션이 정상적으로 맺어지면 실행됩니다.
            onConnect: () => {
                console.info('[Socket] 연결 성공');
                set({ connectionStatus: 'connected' });
            },

            // [연결 종료 콜백]
            // 정상 종료 또는 예기치 않은 단절 시 실행됩니다.
            // reconnectDelay가 설정되어 있으므로 단절 시 5초 후 자동 재연결을 시도합니다.
            onDisconnect: () => {
                console.info('[Socket] 연결 종료 - 5초 후 재연결 시도');
                set({ connectionStatus: 'disconnected' });
            },

            // [STOMP 에러 핸들링]
            // 서버가 STOMP ERROR 프레임을 보낼 때 실행됩니다.
            // 예 : 인증 실패, 잘못된 구독 경로 등
            onStompError: (frame) => {
                console.error('[Socket] STOMP 에러 발생:', frame.headers['message']);
                set({ connectionStatus: 'disconnected' });
            },

            // [WebSocket 에러 핸들링]
            // WebSocket 연결 자체가 실패하거나 끊어질 때 실행됩니다.
            // 예 : 네트워크 단절, 서버 다운
            onWebSocketError: (event) => {
                console.error('[Socket] WebSocket 에러 발생:', event);
                set({ connectionStatus: 'disconnected' });
            },
        });

        // connecting 상태로 먼저 변경 후 activate() 호출합니다.
        // 이 순서가 중요한 이유: activate() 이후 onConnect가 오기 전까지
        // 다른 곳에서 connect()를 재호출하는 것을 차단하기 위함입니다.
        set({ connectionStatus: 'connecting' });
        client.activate();

        // 생성된 클라이언트 인스턴스를 스토어에 저장합니다.
        set({ stompClient: client });
    },

    // ── disconnect 액션 ────────────────────────────────────────────────────────
    disconnect: async () => {
        const { stompClient } = get();

        if (!stompClient) return;

        // [타이밍 제어]
        // deactivate() 전에 reconnectDelay를 0으로 설정하여
        // 진행 중인 재연결 시도를 즉시 차단합니다.
        stompClient.reconnectDelay = 0;

        // [불필요 호출 방지]
        // active 상태일 때만 deactivate()를 호출합니다.
        // active가 false인 상태에서 deactivate()를 호출하면 불필요한 비동기 작업이 발생할 수 있습니다.
        if (stompClient.active) {
            await stompClient.deactivate();
        }

        set({ stompClient: null, connectionStatus: 'disconnected' });

        console.info('[Socket] 소켓 연결 해제 완료');
    },

}));