import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { Home } from './pages/Home';
import { Lobbies } from './pages/Lobbies';
import { LobbyRoom } from './pages/LobbyRoom'; // 개별 게임 방

/**
 * [아키텍처 패턴: Route Guard (라우트 가드)]
 * @description 권한이 없는 사용자(초기 방문자)가 로그인 없이 특정 URL로 직접 접근하는 것을 막는 래퍼(Wrapper) 컴포넌트입니다.
 */

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    // Zustand 스토어에서 현재 사용자의 세션(게스트 또는 정식 회원) 존재 여부를 확인합니다.
    const isGuest = useAuthStore((state) => state.isGuest);

    // [보안 및 UX 처리]
    // 세션이 있다면(isGuest === true), 요청한 화면(children)을 그대로 보여줍니다.
    // 세션이 없다면, <Navigate>를 통해 즉시 "/" (홈 화면)으로 강제 이동(리다이렉트) 시킵니다.
    // 'replace' 속성: 브라우저 뒤로 가기 기록에 이 경로를 남기지 않아, 뒤로 가기를 눌렀을 때 무한 루프에 빠지는 것을 방지합니다.
    return isGuest ? <>{children}</> : <Navigate to="/" replace />;
}

function App() {
    // 앱 진입 시 localStorage의 UUID를 읽어와 세션을 복구하는 로직
    const initializeSession = useAuthStore((state) => state.initializeSession);

    // 컴포넌트 마운트 시 정확히 1번만 실행됨
    useEffect(() => {
        initializeSession();
    }, [initializeSession]);

    return (
        <div className="w-full min-h-screen bg-black text-white">
            {/* [SPA 라우팅의 핵심]
                BrowserRouter: 브라우저의 주소창 URL과 React 앱을 동기화합니다. 페이지 새로고침 없이 화면을 전환할 수 있게 해줍니다.
            */}
            <BrowserRouter>
                <Routes>
                    {/* 1. 공개 경로 (Public Route)
                        기본 진입점: 세션이 없는 사용자가 닉네임을 입력하는 화면
                    */}
                    <Route path="/" element={<Home />} />

                    {/* 2. 보호된 경로 (Protected Route)
                        세션이 있어야만 접근 가능한 로비 목록 화면
                    */}
                    <Route
                        path="/lobbies"
                        element={<ProtectedRoute><Lobbies /></ProtectedRoute>}
                    />

                    {/* 3. 딥링크를 지원하는 보호된 경로 (Dynamic Route)
                        기능명세서의 "초대 코드 발급 및 딥링크 지원" 요구사항을 충족하는 핵심 라우트입니다.
                        예: 클립보드에 복사된 "https://domain.com/lobby/A1B2C3" 링크를 타고 들어올 때,
                        A1B2C3가 inviteCode 파라미터로 매핑됩니다.
                    */}
                    <Route
                        path="/lobby/:inviteCode"
                        element={<ProtectedRoute><LobbyRoom /></ProtectedRoute>}
                    />
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;