import { MOBILE_GUARD_MESSAGE } from '../../constants/layout';

/**
 * 모바일 환경 접속 시 PC 접속을 안내하는 컴포넌트 (Graceful Degradation)
 * - 깨진 레이아웃 대신 깔끔한 안내 페이지를 렌더링한다.
 * - 표시할 문구는 layout.ts의 MOBILE_GUARD_MESSAGE 상수를 따른다.
 * - App.tsx에서 useWindowSize 훅의 isMobile 값에 따라 조건부 렌더링된다.
 */
export function MobileGuard() {
    return (
        // 전체 화면 중앙 정렬 — 홈 화면과 동일한 다크 테마 유지
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white px-6 text-center">

            {/* PC 접속 유도 이모지 */}
            <span className="text-6xl mb-6">💻</span>

            {/* 서비스명 — 상수에서 가져와 하드코딩 방지 */}
            <h1 className="text-3xl font-black mb-4 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                {MOBILE_GUARD_MESSAGE.TITLE}
            </h1>

            {/* 안내 문구 — 상수에서 가져와 하드코딩 방지 */}
            <p className="text-gray-300 text-lg mb-2">
                {MOBILE_GUARD_MESSAGE.DESCRIPTION}
            </p>
            <p className="text-gray-500 text-sm">
                {MOBILE_GUARD_MESSAGE.GUIDE}
            </p>
        </div>

        );
}