// 채팅 메시지와 관련된 타입을 정의한다.
// BE의 ChatMessageDto와 동일한 구조를 유지한다.

// 채팅 메시지의 종류를 정의한다.
// 서버에서 오는 메시지가 어떤 종류인지에 따라 UI 표시 방식이 달라진다.
export type ChatMessageType =
    | 'CHAT'     // 일반 채팅 메시지 — 흰색 말풍선으로 표시
    | 'SYSTEM'   // 시스템 알림 — 예: "홍길동님이 입장했습니다" (회색으로 표시)
    | 'CORRECT'; // 정답 알림 — 예: "홍길동님이 정답을 맞혔습니다!" (강조 표시)

// 채팅 메시지 하나의 구조를 정의한다.
// 서버에서 WebSocket으로 이 구조의 JSON 데이터가 전달된다.
export interface ChatMessage {
    // 메시지 종류 : 이 값에 따라 UI 렌더링 방식이 달라진다.
    type: ChatMessageType;

    // 메시지를 보낸 사람의 닉네임이다.
    nickname: string;

    // 메시지 내용이다.
    content: string;

    // 서버 기준 메시지 발신 시각이다. (ISO 8601 형식, 예: '2026-04-25T12:00:00Z')
    timestamp: string;
}