export interface GameRankingEntry {
    rank: number;
    nickname: string;
    score: number;
    isCurrentUser?: boolean;
}

export interface GameChatPreviewMessage {
    nickname: string;
    time: string;
    content: string;
}
