import {
    INVITE_CODE_MESSAGES,
    INVITE_CODE_POLICY,
} from '../constants/lobby';

/**
 * 사용자가 입력한 초대 코드를 BE 계약에 맞는 형태로 정규화한다.
 *
 * 처리 규칙:
 * - 앞뒤 공백 제거
 * - 중간 공백 제거
 * - 영문 소문자를 대문자로 변환
 */
export function normalizeInviteCode(value: string): string {
    return value
        .trim()
        .replace(INVITE_CODE_POLICY.REMOVE_WHITESPACE_PATTERN, '')
        .toUpperCase();
}

/**
 * 초대 코드가 BE 요청 DTO의 형식과 일치하는지 검증한다.
 *
 * BE 계약:
 * - 영문 대문자 + 숫자
 * - 정확히 6자리
 */
export function validateInviteCode(value: string): string | null {
    const normalizedInviteCode = normalizeInviteCode(value);

    if (!normalizedInviteCode) {
        return INVITE_CODE_MESSAGES.EMPTY;
    }

    if (normalizedInviteCode.length !== INVITE_CODE_POLICY.LENGTH) {
        return INVITE_CODE_MESSAGES.INVALID_LENGTH;
    }

    if (!INVITE_CODE_POLICY.ALLOWED_PATTERN.test(normalizedInviteCode)) {
        return INVITE_CODE_MESSAGES.INVALID_FORMAT;
    }

    return null;
}