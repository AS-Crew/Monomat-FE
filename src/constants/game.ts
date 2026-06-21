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
    PLAYER_PLACEHOLDER_ARIA_LABEL: '블라인드 음악 퀴즈 재생 영역',
    PLAYER_PREPARING: '음원 준비 중',
    PLAYER_WAITING: '라운드 재생 대기 중',
    PLAYER_BUFFERING: '버퍼링 중',
    PLAYER_PLAYING: '지금 재생 중',
    PLAYER_ERROR: '음원을 재생할 수 없습니다.',
    PLAYER_EMBED_ERROR:
        '음원이 비공개이거나 재생할 수 없습니다.',
    PLAYER_UNAVAILABLE_ERROR:
        '음원이 삭제되었거나 비공개 상태입니다.',
    PLAYER_BLIND_LABEL: 'BLIND MUSIC QUIZ',
    PLAYER_LISTEN_GUIDE: '소리만 듣고 제목을 맞혀보세요',
    PLAYER_START_SOUND: '소리 시작',
    PLAYER_START_SOUND_GUIDE:
        '소리가 들리지 않으면 눌러서 재생을 시작하세요',
    GAME_INPUT_PLACEHOLDER: '정답 또는 메시지를 입력하세요',
    GAME_INPUT_ACTION_ARIA_LABEL: '정답 또는 채팅 메시지 보내기',
    GAME_INPUT_WAITING: '라운드 정보를 기다리는 중입니다.',
    GAME_INPUT_CONNECTING: '게임 서버에 연결 중입니다.',
    GAME_INPUT_TOO_LONG: '입력은 최대 500자까지 가능합니다.',
    GAME_INPUT_CORRECT: '정답입니다.',
    GAME_INPUT_FUZZY_CORRECT:
        '정답입니다. 오타가 있었지만 정답으로 인정됐습니다.',
    CHAT_TITLE: '게임 채팅',
    CHAT_EMPTY: '아직 채팅 메시지가 없습니다.',
    CHAT_SYSTEM_SENDER: '시스템',
    CHAT_UNKNOWN_SENDER: '알 수 없음',
} as const;

export const GAME_INPUT_POLICY = {
    MAX_MESSAGE_LENGTH: 500,
} as const;
