import { useEffect, useRef } from 'react';

import { loadYouTubeIframeApi } from '../../utils/youtube';

interface GameYoutubePlayerProps {
    videoId: string;
    startTime: number;
    roundNo: number;
    shouldPlay: boolean;
    onReady: () => void;
    onBuffering: () => void;
    onPlaying: () => void;
    onEnded: () => void;
    onError: (errorCode: number | null) => void;
}

const YOUTUBE_PLAYER_STATE = {
    ENDED: 0,
    PLAYING: 1,
    BUFFERING: 3,
    CUED: 5,
} as const;

export function GameYoutubePlayer({
    videoId,
    startTime,
    roundNo,
    shouldPlay,
    onReady,
    onBuffering,
    onPlaying,
    onEnded,
    onError,
}: GameYoutubePlayerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<YT.Player | null>(null);
    const generationRef = useRef(0);
    const shouldPlayRef = useRef(shouldPlay);
    const callbacksRef = useRef({
        onReady,
        onBuffering,
        onPlaying,
        onEnded,
        onError,
    });

    useEffect(() => {
        shouldPlayRef.current = shouldPlay;
    }, [shouldPlay]);

    useEffect(() => {
        callbacksRef.current = {
            onReady,
            onBuffering,
            onPlaying,
            onEnded,
            onError,
        };
    }, [onBuffering, onEnded, onError, onPlaying, onReady]);

    useEffect(() => {
        const container = containerRef.current;

        if (!container) {
            return;
        }

        const generation = generationRef.current + 1;
        generationRef.current = generation;
        let isDisposed = false;
        let player: YT.Player | null = null;
        const playerMount = document.createElement('div');

        playerMount.className = 'h-full w-full';
        container.replaceChildren(playerMount);

        const isCurrentGeneration = () =>
            !isDisposed && generationRef.current === generation;

        void loadYouTubeIframeApi()
            .then((youtubeApi) => {
                if (!isCurrentGeneration()) {
                    return;
                }

                player = new youtubeApi.Player(playerMount, {
                    width: '100%',
                    height: '100%',
                    playerVars: {
                        autoplay: 0,
                        controls: 0,
                        disablekb: 1,
                        modestbranding: 1,
                        origin: window.location.origin,
                        playsinline: 1,
                        rel: 0,
                    },
                    events: {
                        onReady: (event) => {
                            if (!isCurrentGeneration()) {
                                return;
                            }

                            event.target.cueVideoById({
                                videoId,
                                startSeconds: startTime,
                            });
                            callbacksRef.current.onReady();

                            if (shouldPlayRef.current) {
                                event.target.playVideo();
                            }
                        },
                        onStateChange: (event) => {
                            if (!isCurrentGeneration()) {
                                return;
                            }

                            switch (event.data) {
                                case YOUTUBE_PLAYER_STATE.BUFFERING:
                                    if (shouldPlayRef.current) {
                                        callbacksRef.current.onBuffering();
                                    }
                                    break;
                                case YOUTUBE_PLAYER_STATE.PLAYING:
                                    if (shouldPlayRef.current) {
                                        callbacksRef.current.onPlaying();
                                    } else {
                                        event.target.pauseVideo();
                                    }
                                    break;
                                case YOUTUBE_PLAYER_STATE.ENDED:
                                    if (shouldPlayRef.current) {
                                        callbacksRef.current.onEnded();
                                    }
                                    break;
                                case YOUTUBE_PLAYER_STATE.CUED:
                                    if (shouldPlayRef.current) {
                                        event.target.playVideo();
                                    }
                                    break;
                            }
                        },
                        onError: (event) => {
                            if (!isCurrentGeneration()) {
                                return;
                            }

                            if (import.meta.env.DEV) {
                                console.warn(
                                    '[GameYoutubePlayer] YouTube player 오류',
                                    {
                                        errorCode: event.data,
                                        roundNo,
                                        videoId,
                                    },
                                );
                            }

                            callbacksRef.current.onError(event.data);
                        },
                    },
                });
                playerRef.current = player;
            })
            .catch((error: unknown) => {
                if (!isCurrentGeneration()) {
                    return;
                }

                if (import.meta.env.DEV) {
                    console.warn(
                        '[GameYoutubePlayer] YouTube IFrame API 로드 실패',
                        error,
                    );
                }

                callbacksRef.current.onError(null);
            });

        return () => {
            isDisposed = true;

            if (playerRef.current === player) {
                playerRef.current = null;
            }

            player?.destroy();
            container.replaceChildren();
        };
    }, [roundNo, startTime, videoId]);

    useEffect(() => {
        const player = playerRef.current;

        if (!player) {
            return;
        }

        if (shouldPlay) {
            player.playVideo();
        } else {
            player.pauseVideo();
        }
    }, [shouldPlay]);

    return (
        <div
            ref={containerRef}
            className="h-full w-full overflow-hidden rounded-xl bg-[#111318] [&>iframe]:pointer-events-none [&>iframe]:h-full [&>iframe]:w-full"
            aria-label="YouTube 음악 플레이어"
        />
    );
}
