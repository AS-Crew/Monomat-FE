import { AUTH_ERROR_CODES } from '../constants/auth';
import { refreshAuthSessionSingleFlight } from '../services/authSessionRefresh';
import { useAuthStore } from '../store/useAuthStore';

const AUTHORIZATION_HEADER = 'Authorization';
const AUTH_ENTRY_PATH = '/';

const AUTH_REFRESHABLE_ERROR_CODES = new Set<string>([
    AUTH_ERROR_CODES.INVALID_REFRESH_TOKEN,
    AUTH_ERROR_CODES.SESSION_EXPIRED,
    AUTH_ERROR_CODES.UNAUTHENTICATED,
    AUTH_ERROR_CODES.INVALID_AUTHORIZATION,
]);

function createHeaders(
    input: RequestInfo | URL,
    initHeaders: HeadersInit | undefined,
    accessToken: string | null,
) {
    const headers = new Headers(
        input instanceof Request ? input.headers : undefined,
    );
    const customHeaders = new Headers(initHeaders);

    customHeaders.forEach((value, key) => {
        headers.set(key, value);
    });

    if (accessToken) {
        headers.set(AUTHORIZATION_HEADER, `Bearer ${accessToken}`);
    }

    return headers;
}

function createRequestInit(
    input: RequestInfo | URL,
    init: RequestInit | undefined,
    accessToken: string | null,
): RequestInit {
    return {
        ...init,
        headers: createHeaders(input, init?.headers, accessToken),
    };
}

function redirectToAuthEntry() {
    if (
        typeof window !== 'undefined' &&
        window.location.pathname !== AUTH_ENTRY_PATH
    ) {
        window.location.replace(AUTH_ENTRY_PATH);
    }
}

async function resolveErrorCode(response: Response): Promise<string | null> {
    try {
        const payload = await response.clone().json() as unknown;

        if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
            return null;
        }

        const code = (payload as Record<string, unknown>).code;

        return typeof code === 'string' && code.trim()
            ? code
            : null;
    } catch {
        return null;
    }
}

async function shouldRefreshForUnauthorizedResponse(
    response: Response,
): Promise<boolean> {
    const code = await resolveErrorCode(response);

    if (!code) {
        return true;
    }

    return AUTH_REFRESHABLE_ERROR_CODES.has(code);
}

export async function fetchWithAuth(
    input: RequestInfo | URL,
    init?: RequestInit,
): Promise<Response> {
    const requestAccessToken = useAuthStore.getState().accessToken;
    const response = await fetch(
        input,
        createRequestInit(input, init, requestAccessToken),
    );

    if (response.status !== 401) {
        return response;
    }

    if (!(await shouldRefreshForUnauthorizedResponse(response))) {
        return response;
    }

    const currentAccessToken = useAuthStore.getState().accessToken;
    const retryAccessToken =
        currentAccessToken && currentAccessToken !== requestAccessToken
            ? currentAccessToken
            : (await refreshAuthSessionSingleFlight()).accessToken;

    const retryResponse = await fetch(
        input,
        createRequestInit(input, init, retryAccessToken),
    );

    if (
        retryResponse.status === 401 &&
        await shouldRefreshForUnauthorizedResponse(retryResponse)
    ) {
        useAuthStore.getState().clearSession();
        redirectToAuthEntry();
    }

    return retryResponse;
}
