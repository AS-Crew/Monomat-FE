// 닉네임 검증을 컴포넌트나 Hook에 직접 넣지 않는다.

import {
    AUTH_MESSAGES,
    GUEST_NICKNAME_POLICY,
} from '../constants/auth';

export function validateGuestNickname(nickname: string): string | null {
    const trimmedNickname = nickname.trim();

    if (!trimmedNickname) {
        return AUTH_MESSAGES.EMPTY_NICKNAME;
    }

    if (
        trimmedNickname.length < GUEST_NICKNAME_POLICY.MIN_LENGTH ||
        trimmedNickname.length > GUEST_NICKNAME_POLICY.MAX_LENGTH
    ) {
        return AUTH_MESSAGES.INVALID_NICKNAME_LENGTH;
    }

    if (GUEST_NICKNAME_POLICY.WHITESPACE_PATTERN.test(trimmedNickname)) {
        return AUTH_MESSAGES.INVALID_NICKNAME_WHITESPACE;
    }

    return null;
}