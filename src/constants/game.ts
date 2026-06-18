import type {
    GameChatPreviewMessage,
    GameRankingEntry,
} from '../types/game';

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
    REMAINING_TIME: '남은 시간',
    NOW_PLAYING: '지금 재생 중',
    PLAYER_GUIDE: '제목을 맞춰보세요',
    PLAYER_PLACEHOLDER_ARIA_LABEL: '음악 플레이어 준비 영역',
    ANSWER_PLACEHOLDER: '정답을 입력하세요',
    ANSWER_ACTION_ARIA_LABEL: '정답 제출 기능은 준비 중입니다.',
    CHAT_TITLE: '게임 채팅',
    CHAT_PLACEHOLDER: '메시지를 입력하세요',
    CHAT_ACTION_ARIA_LABEL: '게임 채팅 전송 기능은 준비 중입니다.',
} as const;

export const GAME_PREVIEW = {
    remainingSeconds: 13,
    timeProgressPercent: 50,
    currentRound: 3,
    totalRounds: 10,
} as const;

export const GAME_RANKING_PREVIEW: readonly GameRankingEntry[] = [
    { rank: 1, nickname: '나', score: 320, isCurrentUser: true },
    { rank: 2, nickname: '유키', score: 300 },
    { rank: 3, nickname: '벨', score: 240 },
    { rank: 4, nickname: 'Nut', score: 230 },
    { rank: 5, nickname: '민지', score: 180 },
    { rank: 6, nickname: '제이', score: 150 },
    { rank: 7, nickname: '도현', score: 140 },
    { rank: 8, nickname: '하루', score: 90 },
] as const;

export const GAME_CHAT_PREVIEW: readonly GameChatPreviewMessage[] = [
    {
        nickname: '노래왕',
        time: '20:43',
        content: '이번 노래는 알 것 같아요!',
    },
    {
        nickname: '심야괴담회X서프라이즈',
        time: '20:45',
        content:
            '게임 채팅 UI 확인용 메시지입니다. 내용이 길어지면 말줄임표 없이 다음 줄로 자연스럽게 표시됩니다.',
    },
    {
        nickname: '유키',
        time: '20:46',
        content: '다음 문제도 파이팅!',
    },
] as const;
