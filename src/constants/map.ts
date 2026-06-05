import { LOBBY_CATEGORY_FILTERS } from './lobby';

export const MAP_CATEGORY_FILTERS = LOBBY_CATEGORY_FILTERS;
export const MAP_ALL_CATEGORY_FILTER = MAP_CATEGORY_FILTERS[0];

export const MAP_SORT_LABELS = {
    NEWEST: '최신순',
    OLDEST: '오래된 순',
    MOST_SONGS: '곡 많은 순',
    TITLE_ASC: '제목순',
} as const;

export const DEFAULT_MAP_LIST_PAGE = 0;
export const DEFAULT_MAP_LIST_SIZE = 20;
export const MAP_SELECT_MODAL_PAGE_SIZE = 5;
export const MY_MAP_LIST_PAGE_SIZE = 10;
export const MY_MAP_SEARCH_PAGE_SIZE = 100;

export const MAP_ROUTES = {
    MY_MAPS: '/maps/me',
    CREATE_MAP: '/maps/new',
} as const;

export const MY_MAPS_PAGE_COPY = {
    BACK_TO_LOBBIES: '← 로비 목록으로',
    TITLE: '맵 관리',
    DESCRIPTION: '직접 만든 맵을 관리하고, 새 맵을 생성하세요',
    CREATE_MAP: '+ 새 맵 만들기',
    CREATE_MAP_PENDING: '맵 생성 기능은 추후 제공 예정입니다.',
    SEARCH_PLACEHOLDER: '맵 제목이나 카테고리로 검색하세요',
    MAP_TITLE: '맵 제목',
    CATEGORY: '카테고리',
    SONG_COUNT: '곡 수',
    PLAY_COUNT: '플레이',
    STATUS: '상태',
    ACTION: '동작',
    EDIT_ARIA_LABEL: '맵 수정',
    DELETE_ARIA_LABEL: '맵 삭제',
    DESCRIPTION_TOGGLE_ARIA_LABEL: (title: string) => `${title} 설명 보기`,
    SONG_UNIT: '곡',
} as const;

export const MY_MAPS_ERROR_COPY = {
    TITLE: '내 맵 목록을 불러오지 못했습니다.',
    DESCRIPTION: '잠시 후 다시 시도해주세요.',
    FORBIDDEN_DESCRIPTION: '내 맵 목록은 정식 회원만 확인할 수 있습니다.',
    RETRY: '다시 불러오기',
} as const;

export const MY_MAPS_EMPTY_STATE_COPY = {
    TITLE: '아직 만든 맵이 없습니다.',
    DESCRIPTION: '새 맵 만들기는 후속 기능으로 제공될 예정입니다.',
    SEARCH_TITLE: '검색 결과가 없습니다.',
    SEARCH_DESCRIPTION: '다른 맵 제목이나 카테고리로 검색해보세요.',
} as const;

export const MAP_PUBLIC_STATUS_META = {
    PUBLIC: {
        label: '공개',
        badgeClassName: 'border-[var(--monomat-border-input)] bg-white text-[var(--monomat-text-muted)]',
    },
    PENDING: {
        label: '공개 대기',
        badgeClassName: 'border-[var(--monomat-border-input)] bg-white text-[var(--monomat-text-muted)]',
    },
    PRIVATE: {
        label: '비공개',
        badgeClassName: 'border-[var(--monomat-border-input)] bg-white text-[var(--monomat-text-muted)]',
    },
} as const;
