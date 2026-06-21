import { create } from 'zustand';

import {
    calculatePlaybackEventTimeOffsetMs,
    calculateRecoveryTimeOffsetMs,
} from '../utils/serverTime';

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
    playerReady: boolean;
    playerBuffering: boolean;
    playerPlaying: boolean;
    playerErrorMessage: string | null;
    playerErrorCode: number | null;
    currentVideoId: string | null;
    playerRoundNo: number | null;
    isSubmittingGameInput: boolean;
    lastSubmittedContent: string | null;
    gameInputErrorMessage: string | null;
    serverTimeOffsetMs: number | null;
    serverTimeOffsetRoundNo: number | null;
    serverTimeSyncSource: 'playback-event' | 'round-recovery' | null;
    initializeGame: (inviteCode: string) => void;
    setSubscriptionStatus: (status: GameSubscriptionStatus) => void;
    setError: (message: string | null) => void;
    applyRoundEvent: (
        event: GameRoundEvent,
        clientReceivedAtMs: number,
    ) => void;
    applyRoundEnd: (event: GameRoundEndEvent) => void;
    appendChatMessage: (message: GameChatMessage) => void;
    applyCorrectAnswer: (event: GameRoundCorrectEvent) => void;
    applyCurrentRoundStatus: (
        status: CurrentGameRoundStatus,
        clientReceivedAtMs: number,
    ) => void;
    markPlayerReady: (roundNo: number, videoId: string) => void;
    markPlayerBuffering: (roundNo: number, videoId: string) => void;
    markPlayerPlaying: (roundNo: number, videoId: string) => void;
    markPlayerEnded: (roundNo: number, videoId: string) => void;
    setPlayerError: (
        roundNo: number,
        videoId: string,
        errorCode: number | null,
        errorMessage: string,
    ) => void;
    startGameInputSubmission: () => boolean;
    completeGameInputSubmission: (content: string) => void;
    failGameInputSubmission: (message: string) => void;
    finishGameInputSubmission: () => void;
    reset: () => void;
}

function createEmptyPlayerState() {
    return {
        playerReady: false,
        playerBuffering: false,
        playerPlaying: false,
        playerErrorMessage: null,
        playerErrorCode: null,
        currentVideoId: null,
        playerRoundNo: null,
    };
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
        ...createEmptyPlayerState(),
        isSubmittingGameInput: false,
        lastSubmittedContent: null,
        gameInputErrorMessage: null,
        serverTimeOffsetMs: null,
        serverTimeOffsetRoundNo: null,
        serverTimeSyncSource: null,
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

    applyRoundEvent: (event, clientReceivedAtMs) => {
        const receivedState = createReceivedState();
        const currentState = get();
        const hasRoundChanged =
            currentState.currentRoundNo !== event.roundNo;
        const resetServerTimeState = hasRoundChanged
            ? {
                serverTimeOffsetMs: null,
                serverTimeOffsetRoundNo: null,
                serverTimeSyncSource: null,
            }
            : {};
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
                    ...resetServerTimeState,
                    currentRoundNo: event.roundNo,
                    roundReady: event,
                    playbackStarted:
                        currentState.playbackStarted?.roundNo ===
                        event.roundNo
                            ? currentState.playbackStarted
                            : null,
                    skipVote: null,
                    roundSkipped: null,
                    roundEnd: null,
                    correctAnswer: null,
                    ...createEmptyPlayerState(),
                    currentVideoId: event.videoId,
                    playerRoundNo: event.roundNo,
                });
                break;
            case 'ROUND_PLAYBACK_STARTED': {
                const playbackEventOffsetMs =
                    calculatePlaybackEventTimeOffsetMs(
                        event.serverStartedAt,
                        clientReceivedAtMs,
                    );
                const hasRecoveryOffsetForRound =
                    currentState.serverTimeOffsetRoundNo === event.roundNo &&
                    currentState.serverTimeSyncSource === 'round-recovery' &&
                    currentState.serverTimeOffsetMs != null;

                set({
                    ...receivedState,
                    ...resetSubmissionState,
                    ...(hasRoundChanged
                        ? createEmptyPlayerState()
                        : {}),
                    currentRoundNo: event.roundNo,
                    playbackStarted: event,
                    ...(!hasRecoveryOffsetForRound &&
                    playbackEventOffsetMs != null
                        ? {
                            serverTimeOffsetMs: playbackEventOffsetMs,
                            serverTimeOffsetRoundNo: event.roundNo,
                            serverTimeSyncSource:
                                'playback-event' as const,
                        }
                        : resetServerTimeState),
                });
                break;
            }
            case 'ROUND_SKIP_VOTE':
                set({
                    ...receivedState,
                    ...resetSubmissionState,
                    ...resetServerTimeState,
                    currentRoundNo: event.roundNo,
                    skipVote: event,
                });
                break;
            case 'ROUND_SKIPPED':
                set({
                    ...receivedState,
                    ...resetSubmissionState,
                    ...resetServerTimeState,
                    ...createEmptyPlayerState(),
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
            ...createEmptyPlayerState(),
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

    applyCurrentRoundStatus: (status, clientReceivedAtMs) => {
        set((state) => {
            const hasRoundChanged =
                state.currentRoundNo !== status.roundNo;
            const recoveryOffsetMs =
                status.roundPhase === 'PLAYING' &&
                status.serverStartedAt != null &&
                status.remainingSeconds != null
                    ? calculateRecoveryTimeOffsetMs({
                        serverStartedAtMs: status.serverStartedAt,
                        timeLimitSeconds: status.timeLimitSeconds,
                        remainingSeconds: status.remainingSeconds,
                        clientReceivedAtMs,
                    })
                    : null;
            let restoredRoundReady: GameRoundReadyEvent | null = null;

            if (
                status.videoId != null &&
                status.youtubeUrl != null &&
                status.startTime != null &&
                status.serverStartedAt != null
            ) {
                restoredRoundReady = {
                    type: 'ROUND_READY' as const,
                    videoId: status.videoId,
                    youtubeUrl: status.youtubeUrl,
                    startTime: status.startTime,
                    timeLimitSeconds: status.timeLimitSeconds,
                    roundNo: status.roundNo,
                    serverStartedAt: status.serverStartedAt,
                };
            }

            const restoredPlaybackStarted: GameRoundPlaybackStartedEvent | null =
                restoredRoundReady != null &&
                status.roundPhase === 'PLAYING'
                ? {
                    type: 'ROUND_PLAYBACK_STARTED' as const,
                    roundNo: status.roundNo,
                    serverStartedAt: restoredRoundReady.serverStartedAt,
                    durationSeconds: status.timeLimitSeconds,
                }
                : null;

            return {
                currentRoundNo: status.roundNo,
                currentRoundStatus: status,
                roundReady:
                    state.roundReady?.roundNo === status.roundNo
                        ? state.roundReady
                        : restoredRoundReady,
                playbackStarted:
                    state.playbackStarted?.roundNo === status.roundNo
                        ? state.playbackStarted
                        : restoredPlaybackStarted,
                ...(hasRoundChanged
                    ? createEmptyPlayerState()
                    : {}),
                ...(restoredRoundReady &&
                (state.playerRoundNo !== status.roundNo ||
                    state.currentVideoId !== restoredRoundReady.videoId)
                    ? {
                        ...createEmptyPlayerState(),
                        currentVideoId: restoredRoundReady.videoId,
                        playerRoundNo: status.roundNo,
                    }
                    : {}),
                ...(hasRoundChanged
                    ? {
                        isSubmittingGameInput: false,
                        lastSubmittedContent: null,
                        gameInputErrorMessage: null,
                        correctAnswer: null,
                    }
                    : {}),
                ...(recoveryOffsetMs != null
                    ? {
                        serverTimeOffsetMs: recoveryOffsetMs,
                        serverTimeOffsetRoundNo: status.roundNo,
                        serverTimeSyncSource:
                            'round-recovery' as const,
                    }
                    : hasRoundChanged
                        ? {
                            serverTimeOffsetMs: null,
                            serverTimeOffsetRoundNo: null,
                            serverTimeSyncSource: null,
                        }
                        : {}),
            };
        });
    },

    markPlayerReady: (roundNo, videoId) => {
        set((state) => {
            if (
                state.playerRoundNo !== roundNo ||
                state.currentVideoId !== videoId
            ) {
                return state;
            }

            return {
                playerReady: true,
                playerBuffering: false,
                playerErrorMessage: null,
                playerErrorCode: null,
            };
        });
    },

    markPlayerBuffering: (roundNo, videoId) => {
        set((state) => {
            if (
                state.playerRoundNo !== roundNo ||
                state.currentVideoId !== videoId
            ) {
                return state;
            }

            return {
                playerBuffering: true,
                playerPlaying: false,
            };
        });
    },

    markPlayerPlaying: (roundNo, videoId) => {
        set((state) => {
            if (
                state.playerRoundNo !== roundNo ||
                state.currentVideoId !== videoId
            ) {
                return state;
            }

            return {
                playerReady: true,
                playerBuffering: false,
                playerPlaying: true,
            };
        });
    },

    markPlayerEnded: (roundNo, videoId) => {
        set((state) => {
            if (
                state.playerRoundNo !== roundNo ||
                state.currentVideoId !== videoId
            ) {
                return state;
            }

            return {
                playerBuffering: false,
                playerPlaying: false,
            };
        });
    },

    setPlayerError: (
        roundNo,
        videoId,
        playerErrorCode,
        playerErrorMessage,
    ) => {
        set((state) => {
            if (
                state.playerRoundNo !== roundNo ||
                state.currentVideoId !== videoId
            ) {
                return state;
            }

            return {
                playerReady: false,
                playerBuffering: false,
                playerPlaying: false,
                playerErrorCode,
                playerErrorMessage,
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
