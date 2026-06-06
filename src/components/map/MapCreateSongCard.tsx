import { useEffect, useRef, useState } from 'react';
import {
    ChevronDown,
    ChevronUp,
    Music2,
    Play,
    Trash2,
} from 'lucide-react';

import { MonomatInput } from '../common/MonomatInput';
import {
    MAP_CREATE_POLICY,
    MAP_CREATE_SONG_COPY,
} from '../../constants/map';
import {
    createYouTubeEmbedUrl,
    createYouTubeThumbnailUrl,
    extractYouTubeVideoId,
    loadYouTubeIframeApi,
} from '../../utils/youtube';
import {
    normalizeAnswer,
    normalizeAnswerList,
} from '../../utils/answerNormalizer';
import { getMapCreateTimingError } from '../../utils/mapCreateTiming';

import type { CreateMapSongFormState } from '../../types/map';
import type { YouTubeIframePlayer } from '../../utils/youtube';

interface MapCreateSongCardProps {
    index: number;
    song: CreateMapSongFormState;
    canDeleteSong: boolean;
    canMoveUp: boolean;
    canMoveDown: boolean;
    disabled: boolean;
    onChange: (
        songId: string,
        field: Exclude<
            keyof CreateMapSongFormState,
            'id' | 'answers' | 'videoDurationSeconds'
        >,
        value: string,
    ) => void;
    onAnswerChange: (
        songId: string,
        answerIndex: number,
        value: string,
    ) => void;
    onDurationChange: (
        songId: string,
        videoDurationSeconds: number | null,
    ) => void;
    onAddAnswer: (songId: string) => void;
    onDeleteAnswer: (songId: string, answerIndex: number) => void;
    onDeleteSong: (songId: string) => void;
    onMoveUp: (songId: string) => void;
    onMoveDown: (songId: string) => void;
}

const inputClassName =
    'h-[45px] w-full rounded-lg border border-[color:var(--monomat-border-input)] bg-[#FBFCFE] px-[14px] text-[15px] text-[var(--monomat-text-strong)] outline-none transition placeholder:text-[var(--monomat-text-muted)] focus:border-[var(--monomat-primary)] disabled:cursor-not-allowed disabled:opacity-60';

function SongFieldLabel({ children }: { children: string }) {
    return (
        <span className="mb-1 block text-sm font-medium leading-5 text-[var(--monomat-text-muted)]">
            {children}
        </span>
    );
}

export function MapCreateSongCard({
    index,
    song,
    canDeleteSong,
    canMoveUp,
    canMoveDown,
    disabled,
    onChange,
    onAnswerChange,
    onDurationChange,
    onAddAnswer,
    onDeleteAnswer,
    onDeleteSong,
    onMoveUp,
    onMoveDown,
}: MapCreateSongCardProps) {
    const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
    const onDurationChangeRef = useRef(onDurationChange);
    const songNumber = String(index + 1).padStart(2, '0');
    const songTitle =
        song.answers[0]?.trim() || MAP_CREATE_SONG_COPY.TITLE;
    const canAddAnswer =
        song.answers.length < MAP_CREATE_POLICY.MAX_ANSWER_COUNT;
    const normalizedAnswers = normalizeAnswerList(song.answers);
    const normalizedAnswerCount = song.answers
        .map((answer) => normalizeAnswer(answer))
        .filter(Boolean)
        .length;
    const hasDuplicateAnswers =
        normalizedAnswerCount > normalizedAnswers.length;
    const videoId = extractYouTubeVideoId(song.youtubeUrl);
    const parsedStartTime = Number(song.startTime);
    const previewStartTime =
        song.startTime.trim() &&
        Number.isInteger(parsedStartTime) &&
        parsedStartTime >= MAP_CREATE_POLICY.MIN_START_TIME_SECONDS
            ? parsedStartTime
            : MAP_CREATE_POLICY.MIN_START_TIME_SECONDS;
    const thumbnailUrl = videoId
        ? createYouTubeThumbnailUrl(videoId)
        : null;
    const embedUrl = videoId
        ? createYouTubeEmbedUrl(
              videoId,
              previewStartTime,
              window.location.origin,
          )
        : null;
    const timingError = getMapCreateTimingError(
        song.startTime,
        song.videoDurationSeconds,
    );
    const playerElementId = `youtube-preview-${song.id}`;

    useEffect(() => {
        onDurationChangeRef.current = onDurationChange;
    }, [onDurationChange]);

    useEffect(() => {
        setPlayingVideoId(null);
    }, [song.startTime, song.youtubeUrl]);

    useEffect(() => {
        if (
            !videoId ||
            playingVideoId !== videoId ||
            !embedUrl
        ) {
            return;
        }

        let isDisposed = false;
        let player: YouTubeIframePlayer | null = null;
        let durationTimer: ReturnType<typeof setTimeout> | null = null;

        const reportDuration = (attempt = 0) => {
            if (isDisposed || !player) {
                return;
            }

            const duration = player.getDuration();

            if (Number.isFinite(duration) && duration > 0) {
                onDurationChangeRef.current(
                    song.id,
                    Math.floor(duration),
                );
                return;
            }

            if (attempt < 20) {
                durationTimer = setTimeout(
                    () => reportDuration(attempt + 1),
                    500,
                );
            }
        };

        void loadYouTubeIframeApi()
            .then((youtubeApi) => {
                if (isDisposed) {
                    return;
                }

                player = new youtubeApi.Player(playerElementId, {
                    events: {
                        onReady: () => reportDuration(),
                        onError: () =>
                            onDurationChangeRef.current(song.id, null),
                    },
                });
            })
            .catch(() => {
                if (!isDisposed) {
                    onDurationChangeRef.current(song.id, null);
                }
            });

        return () => {
            isDisposed = true;

            if (durationTimer) {
                clearTimeout(durationTimer);
            }
        };
    }, [embedUrl, playerElementId, playingVideoId, song.id, videoId]);

    return (
        <article className="overflow-hidden rounded-2xl border border-[color:var(--monomat-border-input)] bg-[#FBFCFE]">
            <header className="flex h-[60px] items-center border-b border-[color:var(--monomat-border-input)] bg-[#F7F8FA] px-5">
                <span className="w-9 shrink-0 text-center font-mono text-sm font-bold text-[var(--monomat-text-secondary)]">
                    {songNumber}
                </span>
                <Music2
                    size={22}
                    className="ml-1 shrink-0 text-[var(--monomat-primary)]"
                    aria-hidden="true"
                />
                <h3
                    className="ml-3 min-w-0 truncate text-base font-bold text-[var(--monomat-text-secondary)]"
                    title={songTitle}
                >
                    {songTitle}
                </h3>
                <div className="ml-auto flex items-center gap-1">
                    <button
                        type="button"
                        onClick={() => onMoveUp(song.id)}
                        disabled={disabled || !canMoveUp}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--monomat-text-secondary)] transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-30"
                        aria-label={MAP_CREATE_SONG_COPY.MOVE_SONG_UP_ARIA_LABEL(
                            index,
                        )}
                    >
                        <ChevronUp
                            size={19}
                            strokeWidth={2}
                            aria-hidden="true"
                        />
                    </button>
                    <button
                        type="button"
                        onClick={() => onMoveDown(song.id)}
                        disabled={disabled || !canMoveDown}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--monomat-text-secondary)] transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-30"
                        aria-label={MAP_CREATE_SONG_COPY.MOVE_SONG_DOWN_ARIA_LABEL(
                            index,
                        )}
                    >
                        <ChevronDown
                            size={19}
                            strokeWidth={2}
                            aria-hidden="true"
                        />
                    </button>
                </div>
                <button
                    type="button"
                    onClick={() => onDeleteSong(song.id)}
                    disabled={disabled || !canDeleteSong}
                    className="ml-1 flex h-9 w-9 items-center justify-center rounded-lg text-[var(--monomat-text-secondary)] transition hover:bg-white hover:text-[var(--monomat-danger)] disabled:cursor-not-allowed disabled:opacity-35"
                    aria-label={MAP_CREATE_SONG_COPY.DELETE_SONG_ARIA_LABEL(
                        index,
                    )}
                >
                    <Trash2 size={20} strokeWidth={1.8} aria-hidden="true" />
                </button>
            </header>

            <div className="grid gap-5 p-4 lg:grid-cols-[240px_minmax(0,1fr)] lg:p-6">
                <div>
                    {videoId && thumbnailUrl && embedUrl ? (
                        playingVideoId === videoId ? (
                            <iframe
                                id={playerElementId}
                                src={embedUrl}
                                title={MAP_CREATE_SONG_COPY.YOUTUBE_PREVIEW_IFRAME_TITLE(
                                    index,
                                )}
                                className="aspect-video w-full rounded-lg border-0 bg-black"
                                loading="lazy"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                referrerPolicy="strict-origin-when-cross-origin"
                                allowFullScreen
                            />
                        ) : (
                            <button
                                type="button"
                                onClick={() => setPlayingVideoId(videoId)}
                                disabled={disabled}
                                className="group relative block aspect-video w-full overflow-hidden rounded-lg bg-black disabled:cursor-not-allowed"
                                aria-label={MAP_CREATE_SONG_COPY.YOUTUBE_PREVIEW_PLAY_ARIA_LABEL(
                                    index,
                                )}
                            >
                                <img
                                    src={thumbnailUrl}
                                    alt=""
                                    className="h-full w-full object-contain"
                                />
                                <span className="absolute inset-0 flex items-center justify-center bg-black/20 transition group-hover:bg-black/30">
                                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/70 text-white">
                                        <Play
                                            size={25}
                                            fill="currentColor"
                                            aria-hidden="true"
                                        />
                                    </span>
                                </span>
                            </button>
                        )
                    ) : (
                        <div
                            className="flex aspect-video w-full items-center justify-center rounded-lg bg-[#F1F2F5] text-[var(--monomat-text-muted)]"
                            aria-label={MAP_CREATE_SONG_COPY.YOUTUBE_PREVIEW}
                        >
                            <div className="text-center">
                                <Play
                                    size={34}
                                    strokeWidth={1.6}
                                    className="mx-auto"
                                    aria-hidden="true"
                                />
                                <span className="mt-2 block text-xs">
                                    {
                                        MAP_CREATE_SONG_COPY.YOUTUBE_PREVIEW_PLACEHOLDER
                                    }
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="min-w-0">
                    <label className="block">
                        <SongFieldLabel>
                            {MAP_CREATE_SONG_COPY.YOUTUBE_URL_LABEL}
                        </SongFieldLabel>
                        <MonomatInput
                            type="url"
                            value={song.youtubeUrl}
                            maxLength={
                                MAP_CREATE_POLICY.YOUTUBE_URL_MAX_LENGTH
                            }
                            placeholder={
                                MAP_CREATE_SONG_COPY.YOUTUBE_URL_PLACEHOLDER
                            }
                            disabled={disabled}
                            onChange={(event) =>
                                onChange(
                                    song.id,
                                    'youtubeUrl',
                                    event.target.value,
                                )
                            }
                            className={inputClassName}
                        />
                    </label>

                    <label className="mt-4 block">
                        <div className="flex items-center justify-between">
                            <SongFieldLabel>
                                {MAP_CREATE_SONG_COPY.HINT_LABEL}
                            </SongFieldLabel>
                            <span className="mb-1 text-xs text-[var(--monomat-text-muted)]">
                                {song.hint.length}/
                                {MAP_CREATE_POLICY.HINT_MAX_LENGTH}
                            </span>
                        </div>
                        <MonomatInput
                            value={song.hint}
                            maxLength={MAP_CREATE_POLICY.HINT_MAX_LENGTH}
                            placeholder={MAP_CREATE_SONG_COPY.HINT_PLACEHOLDER}
                            disabled={disabled}
                            onChange={(event) =>
                                onChange(song.id, 'hint', event.target.value)
                            }
                            className={inputClassName}
                        />
                    </label>

                    <div className="mt-4">
                        <label className="block min-w-0">
                            <SongFieldLabel>
                                {MAP_CREATE_SONG_COPY.START_TIME_LABEL}
                            </SongFieldLabel>
                            <MonomatInput
                                type="number"
                                min={
                                    MAP_CREATE_POLICY.MIN_START_TIME_SECONDS
                                }
                                step={1}
                                value={song.startTime}
                                placeholder={
                                    MAP_CREATE_SONG_COPY.START_TIME_PLACEHOLDER
                                }
                                disabled={disabled}
                                onChange={(event) =>
                                    onChange(
                                        song.id,
                                        'startTime',
                                        event.target.value,
                                    )
                                }
                                aria-invalid={timingError != null}
                                aria-describedby={
                                    timingError
                                        ? `${song.id}-timing-error`
                                        : undefined
                                }
                                className={`${inputClassName} ${
                                    timingError
                                        ? 'border-[var(--monomat-danger)] focus:border-[var(--monomat-danger)]'
                                        : ''
                                }`}
                            />
                        </label>
                        {timingError && (
                            <p
                                id={`${song.id}-timing-error`}
                                className="mt-1 text-xs font-medium leading-5 text-[var(--monomat-danger)]"
                            >
                                {timingError}
                            </p>
                        )}
                        {song.videoDurationSeconds != null &&
                            !timingError && (
                                <p className="mt-1 text-xs leading-5 text-[var(--monomat-text-muted)]">
                                    영상 길이{' '}
                                    {song.videoDurationSeconds}초 확인됨
                                </p>
                            )}
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                        <span className="text-sm font-medium text-[var(--monomat-text-muted)]">
                            정답 후보
                        </span>
                        <button
                            type="button"
                            onClick={() => onAddAnswer(song.id)}
                            disabled={disabled || !canAddAnswer}
                            className="text-sm font-medium text-[var(--monomat-primary)] transition hover:text-[var(--monomat-primary-hover)] disabled:cursor-not-allowed disabled:opacity-45"
                        >
                            {MAP_CREATE_SONG_COPY.ADD_ANSWER}
                        </button>
                    </div>

                    <div className="mt-2 space-y-3">
                        {song.answers.map((answer, answerIndex) => (
                            <div
                                key={answerIndex}
                                className="block min-w-0"
                            >
                                <SongFieldLabel>
                                    {MAP_CREATE_SONG_COPY.ANSWER_LABEL(
                                        answerIndex,
                                    )}
                                </SongFieldLabel>
                                <div className="flex gap-2">
                                    <MonomatInput
                                        aria-label={MAP_CREATE_SONG_COPY.ANSWER_LABEL(
                                            answerIndex,
                                        )}
                                        value={answer}
                                        maxLength={
                                            MAP_CREATE_POLICY.ANSWER_MAX_LENGTH
                                        }
                                        placeholder={
                                            MAP_CREATE_SONG_COPY.ANSWER_PLACEHOLDER
                                        }
                                        disabled={disabled}
                                        onChange={(event) =>
                                            onAnswerChange(
                                                song.id,
                                                answerIndex,
                                                event.target.value,
                                            )
                                        }
                                        onBlur={(event) =>
                                            onAnswerChange(
                                                song.id,
                                                answerIndex,
                                                normalizeAnswer(
                                                    event.currentTarget.value,
                                                ),
                                            )
                                        }
                                        className={inputClassName}
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            onDeleteAnswer(
                                                song.id,
                                                answerIndex,
                                            )
                                        }
                                        disabled={
                                            disabled ||
                                            song.answers.length <=
                                                MAP_CREATE_POLICY.MIN_ANSWER_COUNT
                                        }
                                        className="flex h-[45px] w-[45px] shrink-0 items-center justify-center rounded-lg border border-[color:var(--monomat-border-input)] bg-[#FBFCFE] text-[var(--monomat-text-secondary)] transition hover:text-[var(--monomat-danger)] disabled:cursor-not-allowed disabled:opacity-35"
                                        aria-label={MAP_CREATE_SONG_COPY.DELETE_ANSWER_ARIA_LABEL(
                                            answerIndex,
                                        )}
                                    >
                                        <Trash2
                                            size={20}
                                            strokeWidth={1.8}
                                            aria-hidden="true"
                                        />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <p className="mt-2 text-[13px] leading-5 text-[var(--monomat-text-muted)]">
                        {MAP_CREATE_SONG_COPY.ANSWER_DESCRIPTION}
                    </p>
                    {hasDuplicateAnswers && (
                        <p className="mt-1 text-xs leading-5 text-[var(--monomat-text-muted)]">
                            {
                                MAP_CREATE_SONG_COPY.NORMALIZED_ANSWER_DUPLICATE
                            }{' '}
                            중복 제거 후 {normalizedAnswers.length}개가
                            저장됩니다.
                        </p>
                    )}
                </div>
            </div>
        </article>
    );
}
