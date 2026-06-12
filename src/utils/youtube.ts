const YOUTUBE_VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;
const YOUTUBE_HOSTS = new Set([
    'youtube.com',
    'www.youtube.com',
    'm.youtube.com',
]);
const YOUTUBE_IFRAME_API_SCRIPT_ID = 'youtube-iframe-api';

export interface YouTubeIframePlayer {
    getDuration: () => number;
}

interface YouTubeIframePlayerEvent {
    target: YouTubeIframePlayer;
}

interface YouTubeIframePlayerOptions {
    events?: {
        onReady?: (event: YouTubeIframePlayerEvent) => void;
        onError?: () => void;
    };
}

interface YouTubeIframeApi {
    Player: new (
        elementId: string,
        options: YouTubeIframePlayerOptions,
    ) => YouTubeIframePlayer;
}

declare global {
    interface Window {
        YT?: YouTubeIframeApi;
        onYouTubeIframeAPIReady?: () => void;
    }
}

let youtubeIframeApiPromise: Promise<YouTubeIframeApi> | null = null;

function getVideoIdFromYoutubePath(pathname: string) {
    const segments = pathname.split('/').filter(Boolean);

    if (
        segments.length >= 2 &&
        (segments[0] === 'shorts' || segments[0] === 'embed')
    ) {
        return segments[1];
    }

    return null;
}

export function extractYouTubeVideoId(rawUrl: string): string | null {
    const trimmedUrl = rawUrl.trim();

    if (!trimmedUrl) {
        return null;
    }

    try {
        const url = new URL(trimmedUrl);
        const hostname = url.hostname.toLowerCase();
        let videoId: string | null = null;

        if (hostname === 'youtu.be') {
            videoId = url.pathname.split('/').filter(Boolean)[0] ?? null;
        } else if (YOUTUBE_HOSTS.has(hostname)) {
            videoId = url.pathname === '/watch'
                ? url.searchParams.get('v')
                : getVideoIdFromYoutubePath(url.pathname);
        }

        return videoId && YOUTUBE_VIDEO_ID_PATTERN.test(videoId)
            ? videoId
            : null;
    } catch {
        return null;
    }
}

export function createYouTubeThumbnailUrl(videoId: string) {
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export function createYouTubeEmbedUrl(
    videoId: string,
    startTimeSeconds = 0,
    origin?: string,
) {
    const normalizedStartTime =
        Number.isInteger(startTimeSeconds) && startTimeSeconds >= 0
            ? startTimeSeconds
            : 0;
    const searchParams = new URLSearchParams({
        autoplay: '1',
        start: String(normalizedStartTime),
    });

    if (origin) {
        searchParams.set('enablejsapi', '1');
        searchParams.set('origin', origin);
    }

    return `https://www.youtube.com/embed/${videoId}?${searchParams}`;
}

export function loadYouTubeIframeApi() {
    if (window.YT?.Player) {
        return Promise.resolve(window.YT);
    }

    if (youtubeIframeApiPromise) {
        return youtubeIframeApiPromise;
    }

    youtubeIframeApiPromise = new Promise<YouTubeIframeApi>(
        (resolve, reject) => {
            const previousReadyHandler =
                window.onYouTubeIframeAPIReady;

            window.onYouTubeIframeAPIReady = () => {
                previousReadyHandler?.();

                if (window.YT?.Player) {
                    resolve(window.YT);
                    return;
                }

                reject(new Error('YouTube IFrame API를 불러오지 못했습니다.'));
            };

            const existingScript = document.getElementById(
                YOUTUBE_IFRAME_API_SCRIPT_ID,
            );

            if (existingScript) {
                return;
            }

            const script = document.createElement('script');
            script.id = YOUTUBE_IFRAME_API_SCRIPT_ID;
            script.src = 'https://www.youtube.com/iframe_api';
            script.async = true;
            script.onerror = () => {
                script.remove();
                youtubeIframeApiPromise = null;
                reject(
                    new Error('YouTube IFrame API를 불러오지 못했습니다.'),
                );
            };
            document.head.appendChild(script);
        },
    );

    return youtubeIframeApiPromise;
}
