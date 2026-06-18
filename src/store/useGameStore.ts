import { create } from 'zustand';

import type {
    CurrentGameRoundStatus,
    GameChatMessage,
    GamePlayerRanking,
    GameRoundCorrectEvent,
    GameRoundEndEvent,
    GameRoundEvent,
    GameRoundPlaybackStartedEvent,
    GameRoundReadyEvent,
    GameRoundSkippedEvent,
    GameRoundSkipVoteEvent,
    GameSubscriptionStatus,
} from '../types/game';

interface GameState {
    inviteCode: string | null;
    subscriptionStatus: GameSubscriptionStatus;
    lastReceivedAt: number | null;
    errorMessage: string | null;
    currentRoundNo: number | null;
    roundReady: GameRoundReadyEvent | null;
    playbackStarted: GameRoundPlaybackStartedEvent | null;
    skipVote: GameRoundSkipVoteEvent | null;
    roundSkipped: GameRoundSkippedEvent | null;
    roundEnd: GameRoundEndEvent | null;
    rankings: GamePlayerRanking[] | null;
    chatMessages: GameChatMessage[];
    correctAnswer: GameRoundCorrectEvent | null;
    currentRoundStatus: CurrentGameRoundStatus | null;
    initializeGame: (inviteCode: string) => void;
    setSubscriptionStatus: (status: GameSubscriptionStatus) => void;
    setError: (message: string | null) => void;
    applyRoundEvent: (event: GameRoundEvent) => void;
    applyRoundEnd: (event: GameRoundEndEvent) => void;
    appendChatMessage: (message: GameChatMessage) => void;
    applyCorrectAnswer: (event: GameRoundCorrectEvent) => void;
    applyCurrentRoundStatus: (status: CurrentGameRoundStatus) => void;
    reset: () => void;
}

function createEmptyGameState() {
    return {
        inviteCode: null,
        subscriptionStatus: 'idle' as const,
        lastReceivedAt: null,
        errorMessage: null,
        currentRoundNo: null,
        roundReady: null,
        playbackStarted: null,
        skipVote: null,
        roundSkipped: null,
        roundEnd: null,
        rankings: null,
        chatMessages: [],
        correctAnswer: null,
        currentRoundStatus: null,
    };
}

function createReceivedState() {
    return {
        lastReceivedAt: Date.now(),
        errorMessage: null,
    };
}

export const useGameStore = create<GameState>((set, get) => ({
    ...createEmptyGameState(),

    initializeGame: (inviteCode) => {
        if (get().inviteCode === inviteCode) {
            return;
        }

        set({
            ...createEmptyGameState(),
            inviteCode,
        });
    },

    setSubscriptionStatus: (subscriptionStatus) => {
        set({ subscriptionStatus });
    },

    setError: (errorMessage) => {
        set({ errorMessage });
    },

    applyRoundEvent: (event) => {
        const receivedState = createReceivedState();

        switch (event.type) {
            case 'ROUND_READY':
                set({
                    ...receivedState,
                    currentRoundNo: event.roundNo,
                    roundReady: event,
                    playbackStarted: null,
                    skipVote: null,
                    roundSkipped: null,
                    roundEnd: null,
                    correctAnswer: null,
                });
                break;
            case 'ROUND_PLAYBACK_STARTED':
                set({
                    ...receivedState,
                    currentRoundNo: event.roundNo,
                    playbackStarted: event,
                });
                break;
            case 'ROUND_SKIP_VOTE':
                set({
                    ...receivedState,
                    currentRoundNo: event.roundNo,
                    skipVote: event,
                });
                break;
            case 'ROUND_SKIPPED':
                set({
                    ...receivedState,
                    currentRoundNo: event.roundNo,
                    roundSkipped: event,
                });
                break;
        }
    },

    applyRoundEnd: (event) => {
        set({
            ...createReceivedState(),
            roundEnd: event,
            rankings: event.rankings,
        });
    },

    appendChatMessage: (message) => {
        set((state) => ({
            ...createReceivedState(),
            chatMessages: [...state.chatMessages, message],
        }));
    },

    applyCorrectAnswer: (event) => {
        set({
            ...createReceivedState(),
            currentRoundNo: event.roundNo,
            correctAnswer: event,
        });
    },

    applyCurrentRoundStatus: (status) => {
        set({
            currentRoundNo: status.roundNo,
            currentRoundStatus: status,
        });
    },

    reset: () => {
        set(createEmptyGameState());
    },
}));
