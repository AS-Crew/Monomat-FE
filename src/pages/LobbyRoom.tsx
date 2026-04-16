import { useParams } from 'react-router-dom';

/**
 * @description 실제 게임이 시작되기 전, 플레이어들이 모이는 '로비(방)' 컴포넌트입니다.
 * 6자리의 고유 초대 코드를 기반으로 특정 방을 식별합니다.
 */

export function LobbyRoom() {
    /**
     * [React Router: useParams 활용]
     * App.tsx에서 정의된 Route 경로가 "/lobby/:inviteCode"일 때,
     * URL에 입력된 실제 값(예: /lobby/XK32WL -> XK32WL)을 객체 형태로 가져옵니다.
     * * 기능명세서에 명시된 '6자리 고유 코드 기반 입장' 기능을 구현하는 핵심 훅입니다.
     */
    const { inviteCode } = useParams<{ inviteCode: string }>();

    return (
        // 레이아웃: 화면 중앙 정렬 및 게임 서비스 특유의 다크 테마 적용
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
            <h1 className="text-3xl font-bold text-green-400 mb-4">
                🎮 게임 대기실
            </h1>

            <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-2xl">
                <p className="text-gray-300">
                    현재 입장한 방의 초대 코드:
                    {/* font-mono: 코드의 가독성을 높이기 위해 고정폭 글꼴 사용 */}
                    <span className="ml-2 font-mono text-yellow-400 bg-gray-800 px-3 py-1 rounded-md border border-yellow-400/30">
                        {inviteCode}
                    </span>
                </p>

                {/* [아키텍처 참고]
                    실제 구현 시에는 이 inviteCode를 사용하여
                    1. 백엔드 API로 방 정보를 조회(TanStack Query)
                    2. WebSocket 채널(/topic/lobby/{inviteCode})에 접속하는 로직이 추가됩니다.
                */}
            </div>

            <p className="mt-8 text-sm text-gray-500">
                친구들에게 초대 코드를 공유하여 함께 게임을 즐겨보세요!
            </p>
        </div>
    );
}