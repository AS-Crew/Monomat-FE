export interface GameRankingEntry {
    rank: number;
    nickname: string;
    score: number;
    isCurrentUser?: boolean;
}

export interface GameChatDisplayMessage {
    nickname: string;
    time: string;
    content: string;
}

export type GameRoundEndReason =
    | 'TIMEOUT'
    | 'SKIP_VOTE'
    | 'HOST_SKIP'
    | 'PLAYBACK_ERROR';

export interface GamePlayerRanking {
    userIdentifier: string;
    nickname: string;
    score: number;
    rank: number;
    scoreAdded: number;
}

export interface GameRoundReadyEvent {
    type: 'ROUND_READY';
    videoId: string;
    youtubeUrl: string;
    startTime: number;
    timeLimitSeconds: number;
    roundNo: number;
    serverStartedAt: number;
}

export interface GameRoundPlaybackStartedEvent {
    type: 'ROUND_PLAYBACK_STARTED';
    roundNo: number;
    serverStartedAt: number;
    durationSeconds: number;
}

export interface GameRoundSkipVoteEvent {
    type: 'ROUND_SKIP_VOTE';
    roundNo: number;
    votes: number;
    requiredVotes: number;
    totalParticipants: number;
}

export interface GameRoundSkippedEvent {
    type: 'ROUND_SKIPPED';
    roundNo: number;
    endReason: GameRoundEndReason;
}

export type GameRoundEvent =
    | GameRoundReadyEvent
    | GameRoundPlaybackStartedEvent
    | GameRoundSkipVoteEvent
    | GameRoundSkippedEvent;

export interface GameRoundEndEvent {
    type: 'ROUND_END';
    title: string;
    artist: string;
    answer: string;
    thumbnailUrl: string;
    rankings: GamePlayerRanking[];
    waitTimeSeconds: number;
    isLastRound: boolean;
    endReason: GameRoundEndReason;
}

export type GameChatMessageType = 'CHAT' | 'SYSTEM';

export interface GameChatMessage {
    type: GameChatMessageType;
    roomId: string;
    sender: string;
    content: string;
    timestamp: string;
}

export interface GameRoundCorrectEvent {
    type: 'ROUND_CORRECT';
    roundNo: number;
    isFuzzy: boolean;
    message: string;
}

export interface CurrentGameRoundStatus {
    roundNo: number;
    status: string;
    roundPhase: string;
    timeLimitSeconds: number;
    serverStartedAt: number | null;
    videoId: string | null;
    youtubeUrl: string | null;
    startTime: number | null;
    remainingSeconds: number | null;
    isCorrect: boolean;
}

export type GameSubscriptionStatus =
    | 'idle'
    | 'subscribing'
    | 'subscribed'
    | 'error';
