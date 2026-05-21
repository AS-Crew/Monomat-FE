import { refreshAuthSession } from './authApi';
import { ApiError } from './apiError';
import { AUTH_MESSAGES } from '../constants/auth';
import { useAuthStore } from '../store/useAuthStore';

import type {
    AuthSession,
    RefreshTokenResponse,
    UserType,
} from '../types/auth';

const AUTHORIZATION_HEADER = 'Authorization';

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

function isAuthSession(response: RefreshTokenResponse): response is AuthSession {
    return 'userId' in response;
}

function createSessionFromRefreshResponse(
    response: RefreshTokenResponse,
): AuthSession | null {
    if (isAuthSession(response)) {
        return response;
    }

    const state = useAuthStore.getState();

    if (!hasSessionIdentityFields(state)) {
        return null;
    }

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

async function refreshSession(): Promise<AuthSession> {
    const refreshToken = useAuthStore.getState().refreshToken;

    if (!refreshToken) {
        useAuthStore.getState().clearSession();
        throw new ApiError(401, AUTH_MESSAGES.SESSION_EXPIRED);
    }

    try {
        const refreshResponse = await refreshAuthSession({
            refreshToken,
        });
        const nextSession = createSessionFromRefreshResponse(refreshResponse);

        if (!nextSession) {
            throw new ApiError(401, AUTH_MESSAGES.INVALID_REFRESH_RESPONSE);
        }

        useAuthStore.getState().setSession(nextSession);

        return nextSession;
    } catch (error) {
        useAuthStore.getState().clearSession();
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

    return fetch(
        input,
        createRequestInit(input, init, retryAccessToken),
    );
}
