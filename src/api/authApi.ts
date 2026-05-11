// API 호출은 Hook에서 직접 fetch() 하지 않고 별도 모듈로 분리한다.

import { API_ENDPOINTS } from '../constants/endpoints';
import { AUTH_MESSAGES } from '../constants/auth';
import { guestSessionSchema } from '../schemas/authSchema';

import type {
    GuestLoginRequest,
    GuestLoginResponse,
} from '../types/auth';

const JSON_CONTENT_TYPE = 'application/json';

async function parseErrorMessage(response: Response): Promise<string> {
    try {
        const payload = await response.json() as {
            message?: string;
            error?: string;
        };

        return payload.message ?? payload.error ?? AUTH_MESSAGES.GUEST_LOGIN_FAILED;
    } catch {
        return AUTH_MESSAGES.GUEST_LOGIN_FAILED;
    }
}

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
        throw new Error(await parseErrorMessage(response));
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