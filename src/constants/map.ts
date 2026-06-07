import { LOBBY_CATEGORY_FILTERS } from './lobby';

export const MAP_CATEGORY_FILTERS = LOBBY_CATEGORY_FILTERS;
export const MAP_ALL_CATEGORY_FILTER = MAP_CATEGORY_FILTERS[0];
export const MAP_CATEGORY_OPTIONS = MAP_CATEGORY_FILTERS.filter(
    (category) => category !== MAP_ALL_CATEGORY_FILTER,
);

export const MAP_SORT_LABELS = {
    NEWEST: '최신순',
    OLDEST: '오래된 순',
    MOST_SONGS: '곡 많은 순',
    TITLE_ASC: '제목순',
} as const;

export const DEFAULT_MAP_LIST_PAGE = 0;
export const DEFAULT_MAP_LIST_SIZE = 20;
export const DEFAULT_MAP_SORT_OPTION = 'NEWEST' as const;
export const MAP_SELECT_MODAL_PAGE_SIZE = 5;
export const MY_MAP_LIST_PAGE_SIZE = 10;

export const MAP_ROUTES = {
    MY_MAPS: '/maps/me',
    CREATE_MAP: '/maps/new',
    MANAGE_MAP_PATTERN: '/maps/:mapId/manage',
    MANAGE_MAP: (mapId: number) => `/maps/${mapId}/manage`,
} as const;

export const MAP_CREATE_POLICY = {
    TITLE_MAX_LENGTH: 50,
    DESCRIPTION_MAX_LENGTH: 120,
    YOUTUBE_URL_MAX_LENGTH: 500,
    HINT_MAX_LENGTH: 50,
    ANSWER_MAX_LENGTH: 255,
    MIN_ANSWER_COUNT: 1,
    MAX_ANSWER_COUNT: 5,
    MIN_SONG_COUNT: 1,
    MAX_SONG_COUNT: 200,
    MIN_START_TIME_SECONDS: 0,
    API_FALLBACK_PLAY_DURATION_SECONDS: 30,
    DEFAULT_CATEGORY: 'J-POP',
    DEFAULT_IS_PUBLIC: true,
} as const;

export const MAP_UPDATE_POLICY = {
    TITLE_MAX_LENGTH: 50,
    DESCRIPTION_MAX_LENGTH: 255,
} as const;

export const MAP_CREATE_PAGE_COPY = {
    BACK_TO_MAPS: '← 맵 목록으로',
    TITLE: '새 맵 만들기',
    DESCRIPTION: (songCount: number) =>
        `YouTube URL을 추가하고 정답을 등록하세요. 곡 ${songCount}개 등록됨.`,
    STATUS_TITLE: '제목',
    STATUS_SONG: '곡 1+',
    STATUS_RECOMMENDED_SONG: '곡 5+ 권장',
    GUIDE_TITLE: '맵 만들기 4단계',
    GUIDE_TIP:
        '팁 : 정답은 띄어쓰기/대소문자 무시, 다양한 표기를 등록할수록 정답 인정 폭이 넓어집니다.',
    MAP_INFO_TITLE: '맵 정보',
    MAP_TITLE_LABEL: '맵 이름',
    MAP_TITLE_PLACEHOLDER: '예 : J-POP 퀴즈 대결',
    DESCRIPTION_LABEL: '설명 (선택)',
    DESCRIPTION_PLACEHOLDER:
        '어떤 분위기/난이도/주제의 맵인지 짧게 적어주세요',
    CATEGORY_LABEL: '카테고리',
    VISIBILITY_LABEL: '공개 설정',
    PUBLIC: '공개',
    PRIVATE: '비공개',
    SONG_LIST_TITLE: '문제 목록',
    SONG_LIST_DESCRIPTION:
        'YouTube URL과 정답 (여러 개 가능)을 입력하고, 시작 시간을 초 단위로 지정합니다.',
    ADD_SONG: '+ 곡 추가',
    CANCEL: '취소',
    SUBMIT: '맵 만들기',
    SUBMITTING: '맵 만드는 중...',
    CREATE_ERROR: '맵 생성에 실패했습니다. 잠시 후 다시 시도해주세요.',
    PARTIAL_CREATE_ERROR:
        '맵은 생성되었지만 일부 곡 등록에 실패했습니다. 내 맵 관리에서 생성된 맵을 확인해주세요.',
} as const;

export const MAP_CREATE_SONG_COPY = {
    TITLE: '새 곡',
    YOUTUBE_PREVIEW: 'YouTube 미리보기',
    YOUTUBE_PREVIEW_PLACEHOLDER: '미리보기 준비 중',
    YOUTUBE_PREVIEW_PLAY_ARIA_LABEL: (index: number) =>
        `${index + 1}번 곡 YouTube 미리보기 재생`,
    YOUTUBE_PREVIEW_IFRAME_TITLE: (index: number) =>
        `${index + 1}번 곡 YouTube 미리보기`,
    YOUTUBE_URL_LABEL: 'YouTube URL',
    YOUTUBE_URL_PLACEHOLDER: 'https://www.youtube.com/watch?v=',
    HINT_LABEL: '힌트',
    HINT_PLACEHOLDER: '초성이나 문장으로 힌트를 작성해주세요',
    START_TIME_LABEL: '시작 시간 (초)',
    START_TIME_PLACEHOLDER: '0',
    ANSWER_LABEL: (index: number) => `정답 후보 (${index + 1})`,
    ANSWER_PLACEHOLDER: '예 : 짝사랑',
    ANSWER_DESCRIPTION:
        '여러 표기를 등록하면 그중 하나만 맞춰도 정답 처리됩니다.',
    NORMALIZED_ANSWER_DUPLICATE:
        '앞선 후보와 같아 중복으로 저장되지 않습니다.',
    ADD_ANSWER: '+ 후보 추가',
    MOVE_SONG_UP_ARIA_LABEL: (index: number) =>
        `${index + 1}번 곡 위로 이동`,
    MOVE_SONG_DOWN_ARIA_LABEL: (index: number) =>
        `${index + 1}번 곡 아래로 이동`,
    DELETE_SONG_ARIA_LABEL: (index: number) => `${index + 1}번 곡 삭제`,
    DELETE_ANSWER_ARIA_LABEL: (index: number) =>
        `${index + 1}번 정답 후보 삭제`,
} as const;

export const MAP_CREATE_GUIDE_STEPS = [
    {
        title: '기본 정보',
        description:
            '맵 제목과 카테고리를 정하고, 공개 여부를 선택합니다.',
    },
    {
        title: 'YouTube URL',
        description:
            '곡마다 영상 URL을 입력합니다. 등록 시 서버에서 유효성을 확인합니다.',
    },
    {
        title: '정답 등록',
        description:
            '별칭, 영문, 한글, 약칭 등 정답 후보를 여러 개 등록할 수 있습니다.',
    },
    {
        title: '재생 시간',
        description:
            '하이라이트 부분의 시작 시간을 초 단위로 지정합니다.',
    },
] as const;

export const MY_MAPS_PAGE_COPY = {
    BACK_TO_LOBBIES: '← 로비 목록으로',
    TITLE: '맵 관리',
    DESCRIPTION: '직접 만든 맵을 관리하고, 새 맵을 생성하세요',
    CREATE_MAP: '+ 새 맵 만들기',
    SEARCH_PLACEHOLDER: '맵 제목으로 검색하세요',
    SORT_ARIA_LABEL: '내 맵 정렬',
    MAP_TITLE: '맵 제목',
    CATEGORY: '카테고리',
    SONG_COUNT: '곡 수',
    PLAY_COUNT: '플레이',
    STATUS: '상태',
    ACTION: '동작',
    EDIT_ARIA_LABEL: '맵 수정',
    DELETE_ARIA_LABEL: '맵 삭제',
    DELETE_BUTTON_ARIA_LABEL: (title: string) => `${title} 삭제`,
    DESCRIPTION_TOGGLE_ARIA_LABEL: (title: string) => `${title} 설명 보기`,
    SONG_UNIT: '곡',
} as const;

export const MAP_DELETE_CONFIRM_MODAL_COPY = {
    TITLE: '이 맵을 삭제할까요?',
    DESCRIPTION: '삭제하면 포함된 모든 곡이 함께 삭제되며 복구하기 어렵습니다.',
    TARGET_LABEL: '삭제 대상',
    CANCEL: '취소',
    CONFIRM: '삭제',
    DELETING: '삭제 중...',
    CLOSE_ARIA_LABEL: '삭제 확인 모달 닫기',
    ERROR_FALLBACK: '맵 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.',
} as const;

export const MY_MAPS_ERROR_COPY = {
    TITLE: '내 맵 목록을 불러오지 못했습니다.',
    DESCRIPTION: '잠시 후 다시 시도해주세요.',
    FORBIDDEN_DESCRIPTION: '내 맵 목록은 정식 회원만 확인할 수 있습니다.',
    RETRY: '다시 불러오기',
} as const;

export const MY_MAPS_EMPTY_STATE_COPY = {
    TITLE: '아직 만든 맵이 없습니다.',
    DESCRIPTION: '새 맵 만들기 버튼으로 첫 맵을 만들어보세요.',
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

export const MAP_MANAGE_PAGE_COPY = {
    BACK_TO_MAPS: '← 맵 목록으로',
    SUMMARY_LOADING: '맵 정보를 불러오는 중입니다.',
    SUMMARY_ERROR_TITLE: '맵 정보를 불러오지 못했습니다.',
    ITEMS_LOADING: '곡 목록을 불러오는 중입니다.',
    ITEMS_ERROR_TITLE: '곡 목록을 불러오지 못했습니다.',
    INVALID_MAP_ID_TITLE: '올바르지 않은 맵 주소입니다.',
    INVALID_MAP_ID_DESCRIPTION:
        '맵 번호를 확인하거나 내 맵 목록으로 돌아가주세요.',
    RETRY: '다시 불러오기',
    SONG_LIST_TITLE: '곡 목록',
    EMPTY_SONG_LIST: '등록된 곡이 없습니다.',
    CREATE_LOBBY: '이 맵으로 로비 만들기',
    EDIT: '수정',
    DELETE: '삭제',
    SAVE: '저장',
    SAVING: '저장 중...',
    CANCEL: '취소',
    TITLE_LABEL: '맵 제목',
    DESCRIPTION_LABEL: '맵 설명',
    CATEGORY_LABEL: '카테고리',
    VISIBILITY_LABEL: '공개 설정',
    PUBLIC: '공개',
    PRIVATE: '비공개',
    UPDATE_ERROR: '맵 정보를 수정하지 못했습니다.',
    DESCRIPTION_FALLBACK: '맵 설명이 없습니다.',
    UPDATED_PREFIX: '업데이트',
    PLAY_SUFFIX: '플레이',
    SONG_UNIT: '곡',
    SONG_TITLE_FALLBACK: '곡 제목 정보 없음',
    SONG_DESCRIPTION_FALLBACK: '곡 설명이 없습니다.',
    THUMBNAIL_FALLBACK: '미리보기 없음',
    SONG_ROW_ARIA_LABEL: (title: string) => `${title} 상세 정보 보기`,
    DELETE_ARIA_LABEL: (title: string) => `${title} 삭제`,
    EDIT_SONG_LIST_DESCRIPTION:
        '곡을 추가하거나 내용을 수정하고, 화살표로 재생 순서를 변경하세요.',
    EDIT_ADD_SONG: '+ 곡 추가',
    EDIT_EMPTY_SONG_ERROR: '곡을 1개 이상 등록해주세요.',
    EDIT_INVALID_SONG_ERROR:
        '모든 곡의 YouTube URL, 힌트, 시작 시간, 정답 후보를 확인해주세요.',
} as const;

export const MAP_ITEM_DETAIL_MODAL_COPY = {
    CLOSE: '닫기',
    CLOSE_ARIA_LABEL: '곡 상세 모달 닫기',
    PLAY_FROM: (startTime: string) => `${startTime}부터 재생`,
    ANSWERS_LABEL: '정답 후보',
    EMPTY_ANSWERS: '등록된 정답 후보가 없습니다.',
    PREVIEW_FALLBACK: 'YouTube 미리보기를 표시할 수 없습니다.',
    IFRAME_TITLE: (title: string) => `${title} YouTube 미리보기`,
} as const;
