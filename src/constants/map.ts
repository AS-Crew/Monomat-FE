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
