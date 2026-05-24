// API 호출은 Hook에서 직접 fetch() 하지 않고 별도 모듈로 분리한다.

import { API_ENDPOINTS } from '../constants/endpoints';
import { AUTH_MESSAGES } from '../constants/auth';
import { createApiError, ApiError } from './apiError';
import {
    guestSessionSchema,
    loginResponseSchema,
    refreshTokenResponseSchema,
    registerResponseSchema,
} from '../schemas/authSchema';

import type {
    GuestLoginRequest,
    GuestLoginResponse,
    LoginRequest,
    LoginResponse,
    RefreshTokenRequest,
    RefreshTokenResponse,
    RegisterRequest,
    RegisterResponse,
} from '../types/auth';

const JSON_CONTENT_TYPE = 'application/json';

export async function loginAsGuest(
    request: GuestLoginRequest,
): Promise<GuestLoginResponse> {
    const response = await fetch(API_ENDPOINTS.AUTH.GUEST, {
        method: 'POST',
        headers: {
            'Content-Type': JSON_CONTENT_TYPE,
        },
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        throw await createApiError(
            response,
            AUTH_MESSAGES.GUEST_LOGIN_FAILED,
        );
    }

    const payload = await response.json() as unknown;
    const parsed = guestSessionSchema.safeParse(payload);

    if (!parsed.success) {
        console.error(
            '[authApi] 게스트 로그인 응답 검증 실패:',
            parsed.error,
        );

        throw new Error(AUTH_MESSAGES.INVALID_GUEST_LOGIN_RESPONSE);
    }

    return parsed.data;
}

export async function login(
    request: LoginRequest,
): Promise<LoginResponse> {
    const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        headers: {
            'Content-Type': JSON_CONTENT_TYPE,
        },
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        throw await createApiError(
            response,
            AUTH_MESSAGES.LOGIN_FAILED,
        );
    }

    const payload = await response.json() as unknown;
    const parsed = loginResponseSchema.safeParse(payload);

    if (!parsed.success) {
        console.error(
            '[authApi] 로그인 응답 검증 실패:',
            parsed.error,
        );

        throw new ApiError(500, AUTH_MESSAGES.INVALID_LOGIN_RESPONSE);
    }

    return parsed.data;
}

export async function register(
    request: RegisterRequest,
): Promise<RegisterResponse> {
    const response = await fetch(API_ENDPOINTS.AUTH.REGISTER, {
        method: 'POST',
        headers: {
            'Content-Type': JSON_CONTENT_TYPE,
        },
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        throw await createApiError(
            response,
            AUTH_MESSAGES.REGISTER_FAILED,
        );
    }

    let payload: unknown;

    try {
        payload = await response.json() as unknown;
    } catch (error) {
        console.error(
            '[authApi] 회원가입 응답 JSON 파싱 실패:',
            error,
        );

        throw new ApiError(500, AUTH_MESSAGES.INVALID_REGISTER_RESPONSE);
    }

    const parsed = registerResponseSchema.safeParse(payload);

    if (!parsed.success) {
        console.error(
            '[authApi] 회원가입 응답 검증 실패:',
            parsed.error,
        );

        throw new ApiError(500, AUTH_MESSAGES.INVALID_REGISTER_RESPONSE);
    }

    return parsed.data;
}

export async function refreshAuthSession(
    request: RefreshTokenRequest,
): Promise<RefreshTokenResponse> {
    const response = await fetch(API_ENDPOINTS.AUTH.REFRESH, {
        method: 'POST',
        headers: {
            'Content-Type': JSON_CONTENT_TYPE,
        },
        body: JSON.stringify(request),
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
            '[authApi] 토큰 갱신 응답 검증 실패:',
            parsed.error,
        );

        throw new ApiError(500, AUTH_MESSAGES.INVALID_REFRESH_RESPONSE);
    }

    return parsed.data;
}
