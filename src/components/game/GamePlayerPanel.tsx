import {
    AlertCircle,
    LoaderCircle,
    Music2,
    Radio,
} from 'lucide-react';

import { GAME_COPY } from '../../constants/game';
import { GameYoutubePlayer } from './GameYoutubePlayer';

import type { GameRoundReadyEvent } from '../../types/game';

interface GamePlayerPanelProps {
    currentRound: number | null;
    roundReady: GameRoundReadyEvent | null;
    shouldPlay: boolean;
    isRoundFinished: boolean;
    playerReady: boolean;
    playerBuffering: boolean;
    playerPlaying: boolean;
    playerErrorMessage: string | null;
    onPlayerReady: (roundNo: number, videoId: string) => void;
    onPlayerBuffering: (roundNo: number, videoId: string) => void;
    onPlayerPlaying: (roundNo: number, videoId: string) => void;
    onPlayerEnded: (roundNo: number, videoId: string) => void;
    onPlayerError: (
        roundNo: number,
        videoId: string,
        errorCode: number | null,
        errorMessage: string,
    ) => void;
}

function getPlayerErrorMessage(errorCode: number | null) {
    if (errorCode === 100) {
        return GAME_COPY.PLAYER_UNAVAILABLE_ERROR;
    }

    if (errorCode === 101 || errorCode === 150) {
        return GAME_COPY.PLAYER_EMBED_ERROR;
    }

    return GAME_COPY.PLAYER_ERROR;
}

export function GamePlayerPanel({
    currentRound,
    roundReady,
    shouldPlay,
    isRoundFinished,
    playerReady,
    playerBuffering,
    playerPlaying,
    playerErrorMessage,
    onPlayerReady,
    onPlayerBuffering,
    onPlayerPlaying,
    onPlayerEnded,
    onPlayerError,
}: GamePlayerPanelProps) {
    const showPlayer = roundReady != null && !isRoundFinished;

    if (!showPlayer) {
        return (
            <section className="flex h-[440px] flex-col items-center overflow-hidden rounded-2xl bg-white px-6 text-center shadow-[0_4px_16px_rgba(0,0,0,0.18)]">
                <div
                    role="img"
                    aria-label={GAME_COPY.PLAYER_PLACEHOLDER_ARIA_LABEL}
                    className="mt-[57px] flex h-[200px] w-[200px] shrink-0 items-center justify-center rounded-full bg-[var(--monomat-primary)]"
                >
                    <Music2
                        size={52}
                        strokeWidth={2.2}
                        className="text-white"
                        aria-hidden="true"
                    />
                </div>

                <p className="mt-[58px] text-[15px] font-bold leading-[17px] text-[var(--monomat-text-muted)]">
                    {GAME_COPY.NOW_PLAYING}
                </p>
                <h1 className="!m-0 mt-5 !text-xl !font-bold !leading-6 !text-[var(--monomat-text-strong)]">
                    {GAME_COPY.PLAYER_GUIDE}
                </h1>
                <p className="mt-5 text-sm leading-[17px] text-[var(--monomat-text-muted)] tabular-nums">
                    {currentRound == null
                        ? GAME_COPY.ROUND_WAITING
                        : `${currentRound}번째 문제`}
                </p>
            </section>
        );
    }

    const playerStatus = (() => {
        if (playerErrorMessage) {
            return {
                label: playerErrorMessage,
                icon: AlertCircle,
                tone: 'error' as const,
            };
        }

        if (playerBuffering) {
            return {
                label: GAME_COPY.PLAYER_BUFFERING,
                icon: LoaderCircle,
                tone: 'loading' as const,
            };
        }

        if (playerPlaying) {
            return {
                label: GAME_COPY.PLAYER_PLAYING,
                icon: Radio,
                tone: 'playing' as const,
            };
        }

        if (playerReady) {
            return {
                label: shouldPlay
                    ? GAME_COPY.PLAYER_BUFFERING
                    : GAME_COPY.PLAYER_WAITING,
                icon: shouldPlay ? LoaderCircle : Radio,
                tone: shouldPlay
                    ? ('loading' as const)
                    : ('waiting' as const),
            };
        }

        return {
            label: GAME_COPY.PLAYER_PREPARING,
            icon: LoaderCircle,
            tone: 'loading' as const,
        };
    })();
    const StatusIcon = playerStatus.icon;
    const statusToneClass = {
        error: 'bg-[var(--monomat-danger-light)] text-[var(--monomat-danger)]',
        loading: 'bg-white/[0.92] text-[var(--monomat-text-secondary)]',
        playing: 'bg-[#E9F8EF] text-[#178548]',
        waiting: 'bg-[var(--monomat-primary-light)] text-[var(--monomat-primary)]',
    }[playerStatus.tone];

    return (
        <section className="flex h-[440px] flex-col items-center overflow-hidden rounded-2xl bg-white px-6 pb-5 pt-6 text-center shadow-[0_4px_16px_rgba(0,0,0,0.18)]">
            <div className="relative aspect-video w-full max-w-[594px] shrink-0 overflow-hidden rounded-xl bg-[#111318] shadow-inner">
                <GameYoutubePlayer
                    videoId={roundReady.videoId}
                    startTime={roundReady.startTime}
                    roundNo={roundReady.roundNo}
                    shouldPlay={shouldPlay}
                    onReady={() =>
                        onPlayerReady(
                            roundReady.roundNo,
                            roundReady.videoId,
                        )
                    }
                    onBuffering={() =>
                        onPlayerBuffering(
                            roundReady.roundNo,
                            roundReady.videoId,
                        )
                    }
                    onPlaying={() =>
                        onPlayerPlaying(
                            roundReady.roundNo,
                            roundReady.videoId,
                        )
                    }
                    onEnded={() =>
                        onPlayerEnded(
                            roundReady.roundNo,
                            roundReady.videoId,
                        )
                    }
                    onError={(errorCode) =>
                        onPlayerError(
                            roundReady.roundNo,
                            roundReady.videoId,
                            errorCode,
                            getPlayerErrorMessage(errorCode),
                        )
                    }
                />

                {(!playerReady ||
                    !shouldPlay ||
                    playerBuffering ||
                    playerErrorMessage) && (
                    <div
                        className={`absolute inset-0 flex items-center justify-center px-6 ${
                            playerErrorMessage
                                ? 'bg-white/[0.96]'
                                : !shouldPlay
                                  ? 'bg-[#111318]'
                                  : 'bg-[#111318]/72'
                        }`}
                    >
                        <div
                            className={`flex max-w-sm items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold shadow-sm ${statusToneClass}`}
                            role="status"
                            aria-live="polite"
                        >
                            <StatusIcon
                                size={17}
                                className={
                                    playerStatus.tone === 'loading'
                                        ? 'animate-spin'
                                        : ''
                                }
                                aria-hidden="true"
                            />
                            <span>{playerStatus.label}</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-4 flex w-full max-w-[594px] items-center justify-between gap-4">
                <div className="min-w-0 text-left">
                    <p className="text-sm font-bold text-[var(--monomat-text-strong)]">
                        {GAME_COPY.PLAYER_GUIDE}
                    </p>
                    <p className="mt-1 text-xs text-[var(--monomat-text-muted)] tabular-nums">
                        {currentRound == null
                            ? GAME_COPY.ROUND_WAITING
                            : `${currentRound}번째 문제`}
                    </p>
                </div>

                <div
                    className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold ${statusToneClass}`}
                    role="status"
                    aria-live="polite"
                >
                    <StatusIcon
                        size={15}
                        className={
                            playerStatus.tone === 'loading'
                                ? 'animate-spin'
                                : ''
                        }
                        aria-hidden="true"
                    />
                    <span>{playerStatus.label}</span>
                </div>
            </div>
        </section>
    );
}
