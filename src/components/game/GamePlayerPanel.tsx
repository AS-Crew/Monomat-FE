import { useState } from 'react';
import {
    AlertCircle,
    Headphones,
    LoaderCircle,
    Music2,
    Radio,
} from 'lucide-react';

import { GAME_COPY } from '../../constants/game';
import { GameYoutubePlayer } from './GameYoutubePlayer';

import type { GameRoundReadyEvent } from '../../types/game';

const AUDIO_WAVE_BARS = [
    12, 20, 30, 18, 36, 25, 40, 22, 34, 18, 28, 14, 24,
] as const;

interface GamePlayerPanelProps {
    currentRound: number | null;
    totalQuestionCount: number | null;
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
    totalQuestionCount,
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
    const [playRequestToken, setPlayRequestToken] = useState(0);
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
                        : totalQuestionCount == null
                          ? `${currentRound}번째 문제`
                          : `${currentRound} / ${totalQuestionCount} 문제`}
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
        <section className="flex h-[440px] flex-col items-center overflow-hidden rounded-2xl bg-white px-6 pb-4 pt-4 text-center shadow-[0_4px_16px_rgba(0,0,0,0.18)]">
            <div className="relative flex h-[72px] w-full max-w-[594px] shrink-0 items-center overflow-hidden rounded-xl border border-[#E8EBF3] bg-[linear-gradient(145deg,#F9FAFD_0%,#F0F4FF_52%,#F8F9FC_100%)] px-4 text-left">
                    <div
                        className="absolute inset-0 opacity-60"
                        aria-hidden="true"
                        style={{
                            backgroundImage:
                                'radial-gradient(circle at 50% 45%, rgba(75,115,218,0.16), transparent 34%), radial-gradient(circle at 18% 20%, rgba(75,115,218,0.08), transparent 24%)',
                        }}
                    />

                    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-4 border-white bg-[var(--monomat-primary)] shadow-[0_8px_20px_rgba(65,105,210,0.22)]">
                        <Music2
                            size={23}
                            strokeWidth={2.4}
                            className="text-white"
                            aria-hidden="true"
                        />
                    </div>

                    <div className="relative ml-3 min-w-0">
                        <div className="flex items-center gap-1.5 text-[9px] font-extrabold tracking-[0.15em] text-[var(--monomat-primary)]">
                            <Headphones size={12} aria-hidden="true" />
                            {GAME_COPY.PLAYER_BLIND_LABEL}
                        </div>
                        <p className="mt-1 truncate text-sm font-extrabold text-[var(--monomat-text-strong)]">
                            {GAME_COPY.PLAYER_LISTEN_GUIDE}
                        </p>
                        <p className="mt-0.5 text-[11px] font-medium text-[var(--monomat-text-muted)] tabular-nums">
                            {currentRound == null
                                ? GAME_COPY.ROUND_WAITING
                                : totalQuestionCount == null
                                  ? `${currentRound}번째 문제`
                                  : `${currentRound} / ${totalQuestionCount} 문제`}
                        </p>
                    </div>

                    <div
                        className="relative ml-auto flex h-9 shrink-0 items-center gap-[3px]"
                        aria-hidden="true"
                    >
                        {AUDIO_WAVE_BARS.slice(0, 9).map((height, index) => (
                            <span
                                key={`${height}-${index}`}
                                className={`w-[3px] rounded-full bg-[var(--monomat-primary)] ${
                                    playerPlaying
                                        ? 'animate-pulse'
                                        : 'opacity-35'
                                }`}
                                style={{
                                    height: Math.max(8, height * 0.7),
                                    animationDelay: `${index * 75}ms`,
                                    animationDuration: '700ms',
                                }}
                            />
                        ))}
                    </div>

                    {shouldPlay &&
                    playerReady &&
                    !playerPlaying &&
                    !playerBuffering &&
                    !playerErrorMessage ? (
                        <button
                            type="button"
                            onClick={() => {
                                setPlayRequestToken((token) => token + 1);
                            }}
                            className="relative ml-3 shrink-0 rounded-full bg-[var(--monomat-primary)] px-3 py-2 text-[11px] font-extrabold text-white transition hover:bg-[var(--monomat-primary-hover)]"
                        >
                            {GAME_COPY.PLAYER_START_SOUND}
                        </button>
                    ) : null}
            </div>

            <div className="relative mt-3 aspect-video w-full max-w-[480px] overflow-hidden rounded-xl bg-[var(--monomat-primary)] shadow-[0_12px_30px_rgba(15,23,42,0.18)]">
                <GameYoutubePlayer
                    videoId={roundReady.videoId}
                    startTime={roundReady.startTime}
                    roundNo={roundReady.roundNo}
                    shouldPlay={shouldPlay}
                    playRequestToken={playRequestToken}
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

                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--monomat-primary)] px-6 text-white">
                    <div className="flex h-24 w-24 items-center justify-center rounded-full border border-white/25 bg-white/10">
                        <Music2
                            size={42}
                            strokeWidth={2.3}
                            aria-hidden="true"
                        />
                    </div>
                    <p className="mt-5 text-base font-extrabold">
                        {GAME_COPY.PLAYER_LISTEN_GUIDE}
                    </p>
                    <div
                        className="mt-4 flex h-9 items-center gap-1"
                        aria-hidden="true"
                    >
                        {AUDIO_WAVE_BARS.map((height, index) => (
                            <span
                                key={`${height}-${index}`}
                                className={`w-1 rounded-full bg-white ${
                                    playerPlaying
                                        ? 'animate-pulse'
                                        : 'opacity-40'
                                }`}
                                style={{
                                    height,
                                    animationDelay: `${index * 75}ms`,
                                    animationDuration: '700ms',
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-2 flex w-full max-w-[594px] justify-center">
                <div
                    className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold ${statusToneClass}`}
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
