// 서버와 통신할 때 사용하는 주소(URL)를 관리한다.
// WebSocket 주소는 환경변수로 강제하고, REST API는 기본적으로 상대 경로를 사용한다.

const rawWsUrl = import.meta.env.VITE_WS_URL as string | undefined;
const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;

if (!rawWsUrl) {
    throw new Error(
        '[Endpoints] VITE_WS_URL 환경변수가 설정되지 않았습니다.\n' +
        '.env.development 또는 .env.production 파일을 확인해주세요.',
    );
}

/**
 * API base URL은 선택값이다.
 * - 값이 없으면 같은 origin의 /api 경로를 사용한다.
 * - 값이 있으면 마지막 slash를 제거하여 경로 조합 오류를 방지한다.
 */
const normalizeBaseUrl = (baseUrl?: string) => {
    if (!baseUrl) {
        return '';
    }

    return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
};

const createApiEndpoint = (path: string) => {
    return `${normalizeBaseUrl(rawApiBaseUrl)}${path}`;
};

export const WS_ENDPOINT = rawWsUrl;

export const API_ENDPOINTS = {
    AUTH: {
        GUEST: createApiEndpoint('/api/auth/guest'),
        LOGIN: createApiEndpoint('/api/auth/login'),
        REGISTER: createApiEndpoint('/api/auth/register'),
        REFRESH: createApiEndpoint('/api/auth/refresh'),
        LOGOUT: createApiEndpoint('/api/auth/logout'),
    },

    LOBBY: {
        CREATE: createApiEndpoint('/api/lobbies'),
        JOIN: createApiEndpoint('/api/lobbies/join'),
        LIST: createApiEndpoint('/api/lobbies'),
        DETAIL: (code: string) => createApiEndpoint(`/api/lobbies/${code}`),
        READY: (code: string) => createApiEndpoint(`/api/lobbies/${code}/ready`),
        START: (code: string) => createApiEndpoint(`/api/lobbies/${code}/start`),
    },
} as const;
