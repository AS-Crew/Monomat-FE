import { API_ENDPOINTS } from '../constants/endpoints';
import { AUTH_ERROR_CODES, AUTH_MESSAGES } from '../constants/auth';
import { ApiError, createApiError } from '../api/apiError';
import { refreshTokenResponseSchema } from '../schemas/authSchema';
import { useAuthStore } from '../store/useAuthStore';

import type {
    AuthSession,
    RefreshSessionResponse,
    RefreshTokenResponse,
    UserType,
} from '../types/auth';

const JSON_CONTENT_TYPE = 'application/json';
const AUTH_ENTRY_PATH = '/';

const AUTH_REFRESHABLE_ERROR_CODES = new Set<string>([
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
        (error.code != null && AUTH_REFRESHABLE_ERROR_CODES.has(error.code))
    );
}

async function requestRefreshSession(
    refreshToken: string,
): Promise<RefreshTokenResponse> {
    const response = await fetch(API_ENDPOINTS.AUTH.REFRESH, {
        method: 'POST',
        headers: {
            'Content-Type': JSON_CONTENT_TYPE,
        },
        body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
        throw await createApiError(
            response,
            AUTH_MESSAGES.SESSION_REFRESH_FAILED,
        );
    }

    const payload = await response.json() as unknown;
    const parsed = refreshTokenResponseSchema.safeParse(payload);

    if (!parsed.success) {
        console.error(
            '[authSessionRefresh] 토큰 갱신 응답 검증 실패:',
            parsed.error,
        );

        throw new ApiError(500, AUTH_MESSAGES.INVALID_REFRESH_RESPONSE);
    }

    return parsed.data;
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
        const refreshResponse = await requestRefreshSession(refreshToken);
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

export function refreshAuthSessionSingleFlight(): Promise<AuthSession> {
    if (!refreshPromise) {
        refreshPromise = refreshSession().finally(() => {
            refreshPromise = null;
        });
    }

    return refreshPromise;
}

export function resetAuthSessionRefreshForTest() {
    refreshPromise = null;
}

