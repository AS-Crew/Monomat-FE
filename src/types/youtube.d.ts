declare namespace YT {
    interface VideoByIdOptions {
        videoId: string;
        startSeconds?: number;
    }

    interface PlayerVars {
        autoplay?: 0 | 1;
        controls?: 0 | 1;
        disablekb?: 0 | 1;
        modestbranding?: 0 | 1;
        origin?: string;
        playsinline?: 0 | 1;
        rel?: 0 | 1;
    }

    interface PlayerOptions {
        width?: string | number;
        height?: string | number;
        videoId?: string;
        playerVars?: PlayerVars;
        events?: {
            onReady?: (event: PlayerEvent) => void;
            onStateChange?: (event: OnStateChangeEvent) => void;
            onError?: (event: OnErrorEvent) => void;
        };
    }

    class Player {
        constructor(
            element: HTMLElement | string,
            options?: PlayerOptions,
        );

        cueVideoById(options: VideoByIdOptions): void;
        playVideo(): void;
        pauseVideo(): void;
        stopVideo(): void;
        destroy(): void;
        getDuration(): number;
    }

    interface PlayerEvent {
        target: Player;
    }

    interface OnStateChangeEvent extends PlayerEvent {
        data: number;
    }

    interface OnErrorEvent extends PlayerEvent {
        data: number;
    }
}

interface Window {
    YT?: typeof YT;
    onYouTubeIframeAPIReady?: () => void;
}
