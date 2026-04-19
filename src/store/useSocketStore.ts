import { create } from 'zustand';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

// ── 상수 ──────────────────────────────────────────────────────────────────────
// 백엔드 WebSocketConfig.java에 정의된 엔드포인트와 일치해야 합니다.
// 추후 배포 환경에서는 .env 파일의 VITE_WS_URL 변수로 교체할 예정입니다.
const WS_ENDPOINT = 'http://localhost:8080/ws';

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

        // [멱등성 보장]
        // .active는 @stomp/stompjs가 제공하는 속성으로,
        // 클라이언트가 현재 활성화(연결 중 or 연결됨) 상태이면 true를 반환합니다.
        // React StrictMode는 개발 환경에서 컴포넌트를 2번 마운트하기 때문에
        // 이 체크가 없으면 소켓이 중복으로 생성될 수 있습니다.
        if (get().stompClient?.active) {
            console.warn('[Socket] 이미 활성화된 세션이 있습니다.');
            return;
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

            // [연결 성공 콜백]
            // STOMP 세션이 정상적으로 맺어지면 실행됩니다.
            // isConnected를 true로 바꿔 UI가 연결 상태를 인식하게 합니다.
            onConnect: () => {
                console.info('[Socket] 연결 성공');
                set({ isConnected: true });
            },

            // [연결 종료 콜백]
            // 정상 종료 또는 예기치 않은 단절 시 실행됩니다.
            // isConnected를 false로 되돌려 UI가 단절 상태를 인식하게 합니다.
            onDisconnect: () => {
                console.info('[Socket] 연결 종료');
                set({ isConnected: false });
            },
        });

        // STOMP 클라이언트를 활성화합니다 (실제 WebSocket 연결 시작).
        client.activate();

        // 생성된 클라이언트 인스턴스를 스토어에 저장합니다.
        // 이후 다른 컴포넌트에서 이 클라이언트를 통해 메시지를 보내거나 구독할 수 있습니다.
        set({ stompClient: client });
    },
}));