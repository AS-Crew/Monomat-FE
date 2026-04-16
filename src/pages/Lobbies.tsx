export function Lobbies() {
    /**
     * [아키텍처 예정 사항: 상태 관리 및 데이터 페칭]
     * 이곳에는 앞으로 TanStack Query를 활용하여 서버(Spring Boot)에서
     * 활성화된 로비 목록을 주기적으로, 혹은 실시간으로 가져오는 로직이 추가될 예정입니다.
     * * 서버 성능 최적화: 백엔드에서는 MySQL을 거치지 않고,
     * Redis에서 is_private=false 조건으로 필터링하여 공개 로비만 초고속으로 응답을 내려줍니다.
     */

    return (
        // 전체 화면을 채우고 요소들을 중앙에 배치하는 레이아웃입니다.
        <div className="flex flex-col items-center min-h-screen bg-black text-white p-6">
            <h1 className="text-3xl font-bold text-blue-400 mb-6 w-full max-w-5xl text-left">
                🌐 로비 목록
            </h1>

            {/* 로비 리스트 렌더링 영역 */}
            <div className="w-full max-w-5xl bg-gray-900 border border-gray-800 rounded-xl p-6 min-h-[500px] flex flex-col items-center justify-center shadow-lg">
                <p className="text-gray-400">
                    현재 활성화된 게임 방 리스트가 여기에 표시됩니다.
                    {/* 추후 여기에 배열의 map() 함수를 사용하여
                        로비 카드(방 제목, 현재 인원/최대 인원, 방장 닉네임 등) 리스트를 렌더링할 예정입니다.
                    */}
                </p>
            </div>

            {/* [아키텍처 참고: 전체 채팅 영역]
                기능명세서에 따라, 로비 리스트 화면 하단에는 고정 배치되는 '전체 채널 채팅 UI'가 들어갈 자리입니다.
                로그인 여부와 무관하게 게스트/회원 모두 참여할 수 있으며,
                별도의 WebSocket 채널(/topic/global)을 통해 통신하게 됩니다.
            */}
        </div>
    );
}