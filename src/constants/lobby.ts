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

export const LOBBY_CATEGORY_FILTERS = [
    '전체',
    'K-POP',
    'J-POP',
    'POP',
    'OST',
] as const;

export const LOBBY_ALL_CATEGORY_FILTER = LOBBY_CATEGORY_FILTERS[0];

export const LOBBY_SORT_LABELS = {
    LATEST: '최신순',
    MOST_PLAYERS: '인원 많은 순',
    MOST_EMPTY_SLOTS: '빈 자리 많은 순',
} as const;

export const DEFAULT_LOBBY_LIST_PAGE = 0;
export const DEFAULT_LOBBY_LIST_SIZE = 20;

export const LOBBY_NAVIGATION_LABELS = {
    LOGO_ARIA_LABEL: '로비 목록으로 이동',
    ACCOUNT_ARIA_LABEL: '내 계정 열기',
    CREATE_MAP: '맵 만들기',
    CREATE_MAP_PENDING_TITLE: '맵 만들기 기능은 추후 제공 예정입니다.',
    INVITE_CODE: '초대 코드',
    INVITE_CODE_JOIN: '입장',
    CREATE_LOBBY: '로비 만들기',
} as const;

export const LOBBY_ROUTES = {
    LIST: '/lobbies',
    ROOM: (inviteCode: string) => `/lobby/${inviteCode}`,
    CREATE_MAP: null as string | null,
} as const;

export const LOBBY_STATUS_META = {
    WAITING: {
        label: '대기중',
        badgeClassName: 'bg-[#E5F7ED] text-[#33A659]',
        progressClassName: 'bg-[var(--monomat-primary)]',
    },
    PLAYING: {
        label: '진행중',
        badgeClassName: 'bg-[#FFF0E0] text-[#F28C1A]',
        progressClassName: 'bg-[#F28C1A]',
    },
    UNKNOWN: {
        label: '상태확인중',
        badgeClassName:
            'bg-[var(--monomat-page-bg)] text-[var(--monomat-text-muted)]',
        progressClassName: 'bg-[var(--monomat-border-input)]',
    },
} as const;

export const LOBBY_CARD_LABELS = {
    ENTER: '입장',
    ENTER_UNAVAILABLE: '입장불가',
    PLAYER_UNIT: '명',
} as const;

export const LOBBY_LIST_ERROR_COPY = {
    TITLE: '로비 목록을 불러오지 못했습니다.',
    DESCRIPTION: '잠시 후 다시 시도해주세요.',
    RETRY: '다시 불러오기',
} as const;

export const LOBBY_EMPTY_STATE_COPY = {
    TITLE: '현재 조건에 맞는 로비가 없습니다.',
    DESCRIPTION: '검색어나 카테고리 조건을 변경해보세요.',
} as const;

export const LOBBY_SEARCH_COPY = {
    PLACEHOLDER: '로비 제목을 검색하세요.',
} as const;

export const GLOBAL_CHAT_COPY = {
    TITLE: '전체 채팅',
    EMPTY: '아직 채팅이 없습니다.',
    INPUT_PLACEHOLDER: '메시지 입력',
    CONNECTING_PLACEHOLDER: '연결 중...',
    CONNECTED: '연결됨',
    RECONNECTING: '재연결 중...',
    DISCONNECTED: '연결 끊김',
    SEND_ARIA_LABEL: '메시지 전송',
    COOLDOWN_PREFIX: '연속 전송 방지를 위해',
    COOLDOWN_SUFFIX: '초 후 다시 보낼 수 있습니다.',
} as const;
