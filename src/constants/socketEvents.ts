// 서버와 실시간 통신 (WebSocket)에 사용하는 채널 경로를 모아둔 파일이다.
// STOMP 프로토콜은 채팅방처럼 '채널'이라는 개념을 사용한다.
// 특정 채널에 '발행 (메시지 보내기)'하거나 '구독 (메시지 받기)' 하는 방식으로 동작한다.

// BE 기준 :
//   - WebSocketConfig.java : /app (발행 prefix), /topic (구독 prefix)
//   - ChatController.java  : /topic/chat/global, /topic/lobby/{code}

// 발행 경로 (클라이언트 → 서버)
// 클라이언트가 서버로 메시지를 보낼 때 사용하는 경로이다.
// Spring의 @MessageMapping이 /app prefix를 제거한 뒤 경로를 매핑한다.
export const SOCKET_PUBLISH = {
    // 모든 사용자가 보는 전체 채팅에 메시지를 보낼 때 사용한다.
    CHAT_GLOBAL: '/app/chat/global',

    // 특정 로비 (방)의 채팅에 메시지를 보낼 때 사용한다.
    // code는 로비의 6자리 초대 코드이다.
    // 예 : SOCKET_PUBLISH.CHAT_LOBBY('ABC123') → '/app/chat/lobby/ABC123'
    CHAT_LOBBY: (code: string) => `/app/chat/lobby/${code}`,
} as const;

// 구독 경로 (서버 → 클라이언트)
// 서버에서 클라이언트로 메시지가 전달되는 경로이다.
// 이 경로를 구독하면 해당 채널에 새 메시지가 올 때마다 자동으로 수신한다.
export const SOCKET_SUBSCRIBE = {
    // 전체 채팅 메시지를 수신할 때 사용한다.
    CHAT_GLOBAL: '/topic/chat/global',

    // 특정 로비 (방)의 메시지를 수신할 때 사용한다.
    // 채팅 메시지뿐 아니라 게임 이벤트 (라운드 시작/종료, 정답 알림 등)도
    // 이 채널로 수신하며, 메시지 안에 type 필드로 어떤 종류인지 구분한다.
    LOBBY: (code: string) => `/topic/lobby/${code}`,
} as const;