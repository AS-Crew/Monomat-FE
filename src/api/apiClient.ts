import { refreshAuthSession } from './authApi';
import { ApiError } from './apiError';
import { AUTH_ERROR_CODES, AUTH_MESSAGES } from '../constants/auth';
import { useAuthStore } from '../store/useAuthStore';

import type {
    AuthSession,
    RefreshSessionResponse,
    RefreshTokenResponse,
    UserType,
} from '../types/auth';

const AUTHORIZATION_HEADER = 'Authorization';
const AUTH_ENTRY_PATH = '/';

const AUTH_EXPIRED_ERROR_CODES = new Set<string>([
    AUTH_ERROR_CODES.INVALID_REFRESH_TOKEN,
    AUTH_ERROR_CODES.SESSION_EXPIRED,
    AUTH_ERROR_CODES.UNAUTHENTICATED,
    AUTH_ERROR_CODES.INVALID_AUTHORIZATION,
]);

let refreshPromise: Promise<AuthSession> | null = null;

interface SessionIdentityState {
    userId: number | null;
    nickname: string | null;
    userType: UserType | null;
    userIdentifier: string | null;
}

interface ValidSessionIdentityState {
    userId: number;
    nickname: string;
    userType: UserType;
    userIdentifier: string;
}

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

function shouldRedirectToAuthEntry(error: unknown) {
    if (!(error instanceof ApiError)) {
        return true;
    }

    return (
        error.status === 401 ||
        (error.code != null && AUTH_EXPIRED_ERROR_CODES.has(error.code))
    );
}

function hasSessionIdentityFields(
    state: SessionIdentityState,
): state is ValidSessionIdentityState {
    return (
        state.userId != null &&
        !!state.nickname &&
        !!state.userType &&
        !!state.userIdentifier
    );
}

function isRefreshSessionResponse(
    response: RefreshTokenResponse,
): response is RefreshSessionResponse {
    return 'userId' in response;
}

function createSessionFromRefreshResponse(
    response: RefreshTokenResponse,
): AuthSession | null {
    const state = useAuthStore.getState();

    if (isRefreshSessionResponse(response)) {
        if (!state.nickname) {
            return null;
        }

        return {
            userId: response.userId,
            nickname: state.nickname,
            userType: response.userType,
            userIdentifier: response.userIdentifier,
            accessToken: response.accessToken,
            accessTokenExpiresAt: response.accessTokenExpiresAt,
            refreshToken: response.refreshToken,
            refreshTokenExpiresAt: response.refreshTokenExpiresAt,
        };
    }

    if (hasSessionIdentityFields(state)) {
        return {
            userId: state.userId,
            nickname: state.nickname,
            userType: state.userType,
            userIdentifier: state.userIdentifier,
            accessToken: response.accessToken,
            accessTokenExpiresAt: response.accessTokenExpiresAt,
            refreshToken: response.refreshToken,
            refreshTokenExpiresAt: response.refreshTokenExpiresAt,
        };
    }

    return null;
}

async function refreshSession(): Promise<AuthSession> {
    const refreshToken = useAuthStore.getState().refreshToken;

    if (!refreshToken) {
        useAuthStore.getState().clearSession();
        redirectToAuthEntry();
        throw new ApiError(
            401,
            AUTH_MESSAGES.LOGIN_EXPIRED,
            AUTH_ERROR_CODES.SESSION_EXPIRED,
        );
    }

    try {
        const refreshResponse = await refreshAuthSession({
            refreshToken,
        });
        const nextSession = createSessionFromRefreshResponse(refreshResponse);

        if (!nextSession) {
            throw new ApiError(
                401,
                AUTH_MESSAGES.INVALID_REFRESH_RESPONSE,
                AUTH_ERROR_CODES.SESSION_EXPIRED,
            );
        }

        useAuthStore.getState().setSession(nextSession);

        return nextSession;
    } catch (error) {
        useAuthStore.getState().clearSession();
        if (shouldRedirectToAuthEntry(error)) {
            redirectToAuthEntry();
        }
        throw error;
    }
}

function getRefreshPromise() {
    if (!refreshPromise) {
        refreshPromise = refreshSession().finally(() => {
            refreshPromise = null;
        });
    }

    return refreshPromise;
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

    const currentAccessToken = useAuthStore.getState().accessToken;
    const retryAccessToken =
        currentAccessToken && currentAccessToken !== requestAccessToken
            ? currentAccessToken
            : (await getRefreshPromise()).accessToken;

    const retryResponse = await fetch(
        input,
        createRequestInit(input, init, retryAccessToken),
    );

    if (retryResponse.status === 401) {
        useAuthStore.getState().clearSession();
        redirectToAuthEntry();
    }

    return retryResponse;
}
