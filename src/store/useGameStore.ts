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
    isSubmittingGameInput: boolean;
    lastSubmittedContent: string | null;
    gameInputErrorMessage: string | null;
    initializeGame: (inviteCode: string) => void;
    setSubscriptionStatus: (status: GameSubscriptionStatus) => void;
    setError: (message: string | null) => void;
    applyRoundEvent: (event: GameRoundEvent) => void;
    applyRoundEnd: (event: GameRoundEndEvent) => void;
    appendChatMessage: (message: GameChatMessage) => void;
    applyCorrectAnswer: (event: GameRoundCorrectEvent) => void;
    applyCurrentRoundStatus: (status: CurrentGameRoundStatus) => void;
    startGameInputSubmission: () => boolean;
    completeGameInputSubmission: (content: string) => void;
    failGameInputSubmission: (message: string) => void;
    finishGameInputSubmission: () => void;
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
        isSubmittingGameInput: false,
        lastSubmittedContent: null,
        gameInputErrorMessage: null,
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
        const hasRoundChanged =
            get().currentRoundNo !== event.roundNo;
        const resetSubmissionState = hasRoundChanged
            ? {
                isSubmittingGameInput: false,
                lastSubmittedContent: null,
                gameInputErrorMessage: null,
                correctAnswer: null,
            }
            : {};

        switch (event.type) {
            case 'ROUND_READY':
                set({
                    ...receivedState,
                    ...resetSubmissionState,
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
                    ...resetSubmissionState,
                    currentRoundNo: event.roundNo,
                    playbackStarted: event,
                });
                break;
            case 'ROUND_SKIP_VOTE':
                set({
                    ...receivedState,
                    ...resetSubmissionState,
                    currentRoundNo: event.roundNo,
                    skipVote: event,
                });
                break;
            case 'ROUND_SKIPPED':
                set({
                    ...receivedState,
                    ...resetSubmissionState,
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
        set((state) => {
            if (
                state.currentRoundNo != null &&
                state.currentRoundNo !== event.roundNo
            ) {
                return state;
            }

            return {
                ...createReceivedState(),
                currentRoundNo: event.roundNo,
                correctAnswer: event,
            };
        });
    },

    applyCurrentRoundStatus: (status) => {
        set((state) => {
            const hasRoundChanged =
                state.currentRoundNo !== status.roundNo;

            return {
                currentRoundNo: status.roundNo,
                currentRoundStatus: status,
                ...(hasRoundChanged
                    ? {
                        isSubmittingGameInput: false,
                        lastSubmittedContent: null,
                        gameInputErrorMessage: null,
                        correctAnswer: null,
                    }
                    : {}),
            };
        });
    },

    startGameInputSubmission: () => {
        if (get().isSubmittingGameInput) {
            return false;
        }

        set({
            isSubmittingGameInput: true,
            gameInputErrorMessage: null,
        });
        return true;
    },

    completeGameInputSubmission: (lastSubmittedContent) => {
        set({
            lastSubmittedContent,
            gameInputErrorMessage: null,
        });
    },

    failGameInputSubmission: (gameInputErrorMessage) => {
        set({ gameInputErrorMessage });
    },

    finishGameInputSubmission: () => {
        set({ isSubmittingGameInput: false });
    },

    reset: () => {
        set(createEmptyGameState());
    },
}));
