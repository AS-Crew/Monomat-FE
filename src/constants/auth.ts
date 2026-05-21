// 닉네임 정책, 에러 메시지, 버튼 문구를 한 곳에서 관리한다.

export const GUEST_NICKNAME_POLICY = {
    MIN_LENGTH: 2,
    MAX_LENGTH: 12,
    /**
     * 공백 문자가 포함된 닉네임은 허용하지 않는다.
     * 예: "홍 길동", "guest user"
     */
    WHITESPACE_PATTERN: /\s/,
} as const;

export const AUTH_MESSAGES = {
    EMPTY_NICKNAME: '닉네임을 입력해주세요.',
    INVALID_NICKNAME_LENGTH: `닉네임은 ${GUEST_NICKNAME_POLICY.MIN_LENGTH}~${GUEST_NICKNAME_POLICY.MAX_LENGTH}자 이내로 입력해주세요.`,
    INVALID_NICKNAME_WHITESPACE: '공백이 포함된 닉네임은 사용할 수 없습니다.',
    GUEST_LOGIN_FAILED: '게스트 입장에 실패했습니다. 잠시 후 다시 시도해주세요.',
    INVALID_GUEST_LOGIN_RESPONSE: '서버 응답 형식이 올바르지 않습니다.',
    SESSION_EXPIRED: '인증 세션이 만료되었습니다. 다시 입장해주세요.',
    SESSION_REFRESH_FAILED: '인증 세션 갱신에 실패했습니다.',
    INVALID_REFRESH_RESPONSE: '토큰 갱신 응답 형식이 올바르지 않습니다.',
    SESSION_RESTORE_FAILED: '저장된 게스트 세션을 복구하지 못했습니다.',
} as const;

export const AUTH_LABELS = {
    MEMBER_LOGIN: '회원 로그인',
    GUEST_LOGIN: '게스트 입장',
    NICKNAME: '닉네임',
    NICKNAME_PLACEHOLDER: '게임에서 사용할 닉네임을 입력하세요',
    SUBMIT: '게임 참가하기',
    SUBMITTING: '입장 중...',
    CREATE_MAP_HINT: '맵을 만들려면?',
} as const;

export const GUEST_NICKNAME_GUIDE = [
    `${GUEST_NICKNAME_POLICY.MIN_LENGTH}~${GUEST_NICKNAME_POLICY.MAX_LENGTH}자 이내로 입력해주세요`,
    '정식 회원의 닉네임은 사용할 수 없습니다',
    '공백이 포함된 닉네임은 사용 불가합니다',
] as const;
