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

export const REGISTER_POLICY = {
    LOGIN_ID_MAX_LENGTH: 50,
    PASSWORD_MAX_LENGTH: 100,
    NICKNAME_MAX_LENGTH: 8,
} as const;

export const AUTH_MESSAGES = {
    EMPTY_NICKNAME: '닉네임을 입력해주세요.',
    INVALID_NICKNAME_LENGTH: `닉네임은 ${GUEST_NICKNAME_POLICY.MIN_LENGTH}~${GUEST_NICKNAME_POLICY.MAX_LENGTH}자 이내로 입력해주세요.`,
    INVALID_NICKNAME_WHITESPACE: '공백이 포함된 닉네임은 사용할 수 없습니다.',
    GUEST_LOGIN_FAILED: '게스트 입장에 실패했습니다. 잠시 후 다시 시도해주세요.',
    INVALID_GUEST_LOGIN_RESPONSE: '서버 응답 형식이 올바르지 않습니다.',
    EMPTY_LOGIN_ID: '아이디를 입력해주세요.',
    EMPTY_PASSWORD: '비밀번호를 입력해주세요.',
    EMPTY_PASSWORD_CONFIRM: '비밀번호 확인을 입력해주세요.',
    PASSWORD_CONFIRM_MISMATCH: '비밀번호가 일치하지 않습니다.',
    LOGIN_FAILED: '로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.',
    INVALID_LOGIN_RESPONSE: '로그인 응답 형식이 올바르지 않습니다.',
    REGISTER_FAILED: '회원가입에 실패했습니다. 잠시 후 다시 시도해주세요.',
    REGISTER_SUCCESS: '회원가입이 완료되었습니다. 로그인해 주세요.',
    INVALID_REGISTER_RESPONSE: '회원가입 응답 형식이 올바르지 않습니다.',
    SESSION_EXPIRED: '인증 세션이 만료되었습니다. 다시 입장해주세요.',
    SESSION_REFRESH_FAILED: '인증 세션 갱신에 실패했습니다.',
    INVALID_REFRESH_RESPONSE: '토큰 갱신 응답 형식이 올바르지 않습니다.',
    SESSION_RESTORE_FAILED: '저장된 인증 세션을 복구하지 못했습니다.',
} as const;

export const AUTH_LABELS = {
    MEMBER_LOGIN: '회원 로그인',
    GUEST_LOGIN: '게스트 입장',
    WELCOME: 'Monomat에 오신 것을 환영합니다',
    LOGIN_ID: '아이디',
    LOGIN_ID_PLACEHOLDER: '로그인 ID를 입력하세요',
    REGISTER_LOGIN_ID_PLACEHOLDER: '영문/숫자 4자 이상 입력해주세요',
    PASSWORD: '비밀번호',
    PASSWORD_PLACEHOLDER: '비밀번호를 입력하세요',
    REGISTER_PASSWORD_PLACEHOLDER: '8자 이상 입력해주세요',
    PASSWORD_CONFIRM: '비밀번호 확인',
    PASSWORD_CONFIRM_PLACEHOLDER: '비밀번호를 확인해주세요',
    AUTO_LOGIN: '자동 로그인',
    LOGIN: '로그인',
    LOGIN_SUBMITTING: '로그인 중...',
    QUICK_GUEST_START: '게스트로 빠르게 시작',
    NICKNAME: '닉네임',
    NICKNAME_PLACEHOLDER: '게임에서 사용할 닉네임을 입력하세요',
    REGISTER_NICKNAME_PLACEHOLDER: '게임에서 사용할 닉네임을 입력해주세요',
    SUBMIT: '게임 참가하기',
    SUBMITTING: '입장 중...',
    OR: '또는',
    SIGNUP_HINT: '계정이 없으신가요?',
    SIGNUP: '회원가입',
    SIGNUP_DESCRIPTION: '회원가입하고 나만의 맵을 만들어보세요.',
    SIGNUP_BUTTON: '가입하기',
    SIGNUP_SUBMITTING: '가입 중...',
    ALREADY_HAVE_ACCOUNT: '이미 계정이 있으신가요?',
} as const;

export const GUEST_NICKNAME_GUIDE = [
    `${GUEST_NICKNAME_POLICY.MIN_LENGTH}~${GUEST_NICKNAME_POLICY.MAX_LENGTH}자 이내로 입력해주세요`,
    '중복된 닉네임은 사용할 수 없습니다',
    '금칙어가 포함된 닉네임은 사용 불가합니다',
] as const;
