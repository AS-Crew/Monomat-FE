const YOUTUBE_VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;
const YOUTUBE_HOSTS = new Set([
    'youtube.com',
    'www.youtube.com',
    'm.youtube.com',
]);
const YOUTUBE_IFRAME_API_SCRIPT_ID = 'youtube-iframe-api';
const YOUTUBE_IFRAME_API_URL = 'https://www.youtube.com/iframe_api';

export type YouTubeIframePlayer = YT.Player;

let youtubeIframeApiPromise: Promise<typeof YT> | null = null;

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
    if (typeof window === 'undefined' || typeof document === 'undefined') {
        return Promise.reject(
            new Error(
                'YouTube IFrame API는 브라우저 환경에서만 사용할 수 있습니다.',
            ),
        );
    }

    if (window.YT?.Player) {
        return Promise.resolve(window.YT);
    }

    if (youtubeIframeApiPromise) {
        return youtubeIframeApiPromise;
    }

    youtubeIframeApiPromise = new Promise<typeof YT>(
        (resolve, reject) => {
            const previousReadyHandler =
                window.onYouTubeIframeAPIReady;
            const rejectLoad = () => {
                const script = document.getElementById(
                    YOUTUBE_IFRAME_API_SCRIPT_ID,
                );

                script?.remove();
                youtubeIframeApiPromise = null;
                reject(
                    new Error(
                        'YouTube IFrame API를 불러오지 못했습니다.',
                    ),
                );
            };

            window.onYouTubeIframeAPIReady = () => {
                try {
                    previousReadyHandler?.();
                } catch (error) {
                    console.warn(
                        '기존 YouTube IFrame API ready callback 처리에 실패했습니다.',
                        error,
                    );
                }

                if (window.YT?.Player) {
                    resolve(window.YT);
                    return;
                }

                rejectLoad();
            };

            const existingScript = document.getElementById(
                YOUTUBE_IFRAME_API_SCRIPT_ID,
            );

            if (existingScript) {
                existingScript.addEventListener('error', rejectLoad, {
                    once: true,
                });
                return;
            }

            const script = document.createElement('script');
            script.id = YOUTUBE_IFRAME_API_SCRIPT_ID;
            script.src = YOUTUBE_IFRAME_API_URL;
            script.async = true;
            script.addEventListener('error', rejectLoad, {
                once: true,
            });
            document.head.appendChild(script);
        },
    );

    return youtubeIframeApiPromise;
}
