// 화면 문구와 기능 리스트를 컴포넌트에서 분리한다.

export const HOME_COPY = {
    SERVICE_NAME: 'Monomat',
    TITLE: '실시간 YouTube\n음악 퀴즈 게임',
    DESCRIPTION: '닉네임만 입력하면 바로 시작!\n회원가입 없이 게스트로 즉시 참가합니다.',
} as const;

export const HOME_FEATURES = [
    {
        icon: '🎵',
        label: 'YouTube 영상 재생 제어',
    },
    {
        icon: '⚡',
        label: '실시간 점수 동기화',
    },
    {
        icon: '👥',
        label: '최대 N인 동시 플레이',
    },
] as const;