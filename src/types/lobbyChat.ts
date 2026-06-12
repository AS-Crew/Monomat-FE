export type LobbyChatMessageType =
    | 'CHAT'
    | 'SYSTEM'
    | 'ENTER'
    | 'LEAVE'
    | 'KICK'
    | 'READY_CHANGED'
    | 'HOST_CHANGED';

export interface LobbyChatMessage {
    messageId?: string;
    type: LobbyChatMessageType;
    roomId?: string;
    sender?: string;
    senderId?: number;
    senderNickname?: string;
    content: string;
    timestamp?: string;
    sentAt?: string;
}

export interface SendLobbyChatMessageRequest {
    content: string;
}
