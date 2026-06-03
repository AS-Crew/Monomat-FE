import { API_ENDPOINTS } from '../constants/endpoints';
import { fetchWithAuth } from './apiClient';
import { ApiError, createApiError } from './apiError';
import { myUserInfoResponseSchema } from '../schemas/userSchema';

import type {
    ChangePasswordRequest,
    MyUserInfoResponse,
    UpdateNicknameRequest,
} from '../types/user';

const JSON_CONTENT_TYPE = 'application/json';

const DEFAULT_UPDATE_NICKNAME_ERROR_MESSAGE = '닉네임 변경에 실패했습니다.';
const DEFAULT_CHANGE_PASSWORD_ERROR_MESSAGE = '비밀번호 변경에 실패했습니다.';
const INVALID_USER_INFO_RESPONSE_MESSAGE =
    '사용자 정보 응답 형식이 올바르지 않습니다.';

export async function updateMyNickname(
    request: UpdateNicknameRequest,
): Promise<MyUserInfoResponse> {
    const response = await fetchWithAuth(API_ENDPOINTS.USER.NICKNAME, {
        method: 'PATCH',
        headers: {
            'Content-Type': JSON_CONTENT_TYPE,
        },
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        throw await createApiError(
            response,
            DEFAULT_UPDATE_NICKNAME_ERROR_MESSAGE,
        );
    }

    let payload: unknown;

    try {
        payload = await response.json() as unknown;
    } catch (error) {
        console.error(
            '[userApi] 닉네임 변경 응답 JSON 파싱 실패:',
            error,
        );

        throw new ApiError(500, INVALID_USER_INFO_RESPONSE_MESSAGE);
    }

    const parsed = myUserInfoResponseSchema.safeParse(payload);

    if (!parsed.success) {
        console.error(
            '[userApi] 닉네임 변경 응답 검증 실패:',
            parsed.error,
        );

        throw new ApiError(500, INVALID_USER_INFO_RESPONSE_MESSAGE);
    }

    return parsed.data;
}

export async function changeMyPassword(
    request: ChangePasswordRequest,
): Promise<void> {
    const response = await fetchWithAuth(API_ENDPOINTS.USER.PASSWORD, {
        method: 'PATCH',
        headers: {
            'Content-Type': JSON_CONTENT_TYPE,
        },
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        throw await createApiError(
            response,
            DEFAULT_CHANGE_PASSWORD_ERROR_MESSAGE,
        );
    }
}
