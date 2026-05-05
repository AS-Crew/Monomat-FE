// 채팅 메시지와 관련된 타입을 정의한다.
// BE의 ChatMessageDto와 동일한 구조를 유지한다.

// 채팅 메시지의 종류를 정의한다.
// 서버에서 오는 메시지가 어떤 종류인지에 따라 UI 표시 방식이 달라진다.
export type ChatMessageType = 'CHAT' | 'ANSWER' | 'ENTER' | 'LEAVE';

// BE ChatMessageDto와 동일한 구조
// sender: 서버가 세션에서 추출한 UUID (위변조 방지)
export interface ChatMessage {
    type: ChatMessageType;
    roomId: string;    // 전체 채팅은 "global"
    sender: string;    // UUID 그대로 표시 (닉네임 조회 API 미구현 상태)
    content: string;
    timestamp: string; // ISO 8601 형식
}