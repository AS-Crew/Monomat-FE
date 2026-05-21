export const INVITE_CODE_POLICY = {
    LENGTH: 6,
    ALLOWED_PATTERN: /^[A-Z0-9]{6}$/,
    REMOVE_WHITESPACE_PATTERN: /\s/g,
} as const;

export const INVITE_CODE_MESSAGES = {
    EMPTY: '초대 코드를 입력해주세요.',
    INVALID_LENGTH: '초대 코드는 6자리여야 합니다.',
    INVALID_FORMAT: '초대 코드는 영문 대문자와 숫자만 입력할 수 있습니다.',
} as const;

export const CREATE_LOBBY_POLICY = {
    TITLE_MAX_LENGTH: 255,
    MIN_PLAYERS: 2,
    MAX_PLAYERS: 8,
    DEFAULT_MAX_PLAYERS: 4,
    MIN_ROUND_COUNT: 1,
    MAX_ROUND_COUNT: 20,
    MIN_TIME_LIMIT_SECONDS: 10,
    MAX_TIME_LIMIT_SECONDS: 120,
} as const;
