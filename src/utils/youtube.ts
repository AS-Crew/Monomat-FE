const YOUTUBE_VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;
const YOUTUBE_HOSTS = new Set([
    'youtube.com',
    'www.youtube.com',
    'm.youtube.com',
]);
const YOUTUBE_IFRAME_API_SCRIPT_ID = 'youtube-iframe-api';
const YOUTUBE_IFRAME_API_URL = 'https://www.youtube.com/iframe_api';
const YOUTUBE_IFRAME_API_LOAD_TIMEOUT_MS = 10_000;

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
            let isSettled = false;
            let script: HTMLScriptElement | null = null;

            const finish = () => {
                window.clearTimeout(timeoutId);

                if (
                    window.onYouTubeIframeAPIReady === readyHandler
                ) {
                    window.onYouTubeIframeAPIReady =
                        previousReadyHandler;
                }

                script?.removeEventListener('error', handleScriptError);
            };
            const resolveLoad = () => {
                if (isSettled || !window.YT?.Player) {
                    return;
                }

                isSettled = true;
                finish();
                resolve(window.YT);
            };
            const rejectLoad = (error: Error) => {
                if (isSettled) {
                    return;
                }

                isSettled = true;
                finish();
                const script = document.getElementById(
                    YOUTUBE_IFRAME_API_SCRIPT_ID,
                );

                script?.remove();
                youtubeIframeApiPromise = null;
                reject(error);
            };
            const handleScriptError = () => {
                rejectLoad(
                    new Error(
                        'YouTube IFrame API를 불러오지 못했습니다.',
                    ),
                );
            };
            const readyHandler = () => {
                try {
                    previousReadyHandler?.();
                } catch (error) {
                    console.warn(
                        '기존 YouTube IFrame API ready callback 처리에 실패했습니다.',
                        error,
                    );
                }

                if (window.YT?.Player) {
                    resolveLoad();
                    return;
                }

                rejectLoad(
                    new Error(
                        'YouTube IFrame API를 초기화하지 못했습니다.',
                    ),
                );
            };
            const timeoutId = window.setTimeout(() => {
                rejectLoad(
                    new Error(
                        'YouTube IFrame API 로드 시간이 초과되었습니다.',
                    ),
                );
            }, YOUTUBE_IFRAME_API_LOAD_TIMEOUT_MS);

            window.onYouTubeIframeAPIReady = readyHandler;

            const existingScript = document.getElementById(
                YOUTUBE_IFRAME_API_SCRIPT_ID,
            );
            script =
                existingScript instanceof HTMLScriptElement
                    ? existingScript
                    : null;

            if (script) {
                script.addEventListener('error', handleScriptError, {
                    once: true,
                });
                return;
            }

            script = document.createElement('script');
            script.id = YOUTUBE_IFRAME_API_SCRIPT_ID;
            script.src = YOUTUBE_IFRAME_API_URL;
            script.async = true;
            script.addEventListener('error', handleScriptError, {
                once: true,
            });
            document.head.appendChild(script);
        },
    );

    return youtubeIframeApiPromise;
}
