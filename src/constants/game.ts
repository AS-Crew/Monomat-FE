export const GAME_ROUTES = {
    PLAY_PATTERN: '/game/:inviteCode',
    PLAY: (inviteCode: string) => `/game/${inviteCode}`,
} as const;

export const GAME_COPY = {
    LEAVE: '나가기',
    LEAVE_ARIA_LABEL: '게임에서 나가 로비 목록으로 이동',
    INVALID_ACCESS_TITLE: '잘못된 게임 접근입니다.',
    INVALID_ACCESS_DESCRIPTION:
        '초대 코드가 포함된 게임 주소로 다시 접속해주세요.',
    GO_TO_LOBBY_LIST: '로비 목록으로 이동',
    RANKING_TITLE: '🏆 실시간 순위',
    RANKING_EMPTY: '랭킹 정보가 아직 없습니다.',
    REMAINING_TIME: '남은 시간',
    ROUND_WAITING: '라운드 대기 중',
    NOW_PLAYING: '지금 재생 중',
    PLAYER_GUIDE: '제목을 맞춰보세요',
    PLAYER_PLACEHOLDER_ARIA_LABEL: '음악 플레이어 준비 영역',
    ANSWER_PLACEHOLDER: '정답 또는 메시지를 입력하세요',
    ANSWER_ACTION_ARIA_LABEL: '정답 또는 채팅 메시지 보내기',
    CHAT_TITLE: '게임 채팅',
    CHAT_EMPTY: '아직 채팅 메시지가 없습니다.',
} as const;

export const GAME_CHAT_POLICY = {
    MAX_MESSAGE_LENGTH: 500,
} as const;
