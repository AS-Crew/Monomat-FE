// 애플리케이션의 라우팅 구조 정의 및 앱 전역 생명주기 훅 (세션 초기화, 소켓 연결) 실행

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { useSocket } from './hooks/useSocket';
import { useWindowSize } from './hooks/useWindowSize';

// 공통 컴포넌트
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { MobileGuard } from './components/common/MobileGuard';
import { AppLayout } from './components/common/AppLayout';

// 페이지 컴포넌트
import { Home } from './pages/Home';
import { Lobbies } from './pages/Lobbies';
import { LobbyRoom } from './pages/LobbyRoom';

/**
 * [애플리케이션 루트 컴포넌트]
 *
 * 이 컴포넌트의 책임:
 *   1. 앱 최초 진입 시 localStorage에서 게스트 세션을 복구 (initializeSession)
 *   2. 세션이 확인된 후 WebSocket 연결 시작 (useSocket)
 *   3. 모바일 환경 접속 시 PC 접속 안내 페이지 렌더링 (MobileGuard)
 *   4. URL 경로에 따라 적절한 페이지 컴포넌트를 렌더링 (Routes/Route)
 *
 * 이 컴포넌트가 하지 않는 것:
 *   - 인증 가드 로직 → ProtectedRoute가 담당
 *   - 소켓 연결/해제 세부 로직 → useSocket, useSocketStore가 담당
 *   - 창 크기 판단 로직 → useWindowSize가 담당
 *   - 전역 레이아웃 기준 → AppLayout이 담당
 */
function App() {
    const initializeSession = useAuthStore((state) => state.initializeSession);

    // isMobile만 구조분해 — width, height는 이 컴포넌트에서 필요 없다.
    // 모바일 판단 로직은 useWindowSize 훅이 담당하므로
    // App은 결과값(isMobile)만 받아서 "무엇을 렌더링할지"만 결정한다.
    const { isMobile } = useWindowSize();

    useEffect(() => {
        // 컴포넌트 최초 마운트 시 단 한 번만 실행한다.
        initializeSession();
    }, [initializeSession]);

    // WebSocket 연결 생명주기를 관리하는 훅
    // App 최상단에서 한 번만 호출하여 전역에서 소켓 상태를 공유한다.
    useSocket();

    // 모바일 접속 시 안내 페이지만 렌더링하고 라우터는 실행하지 않는다.
    // → 모바일에서 불필요한 라우팅, 소켓 연결 시도를 원천 차단한다.
    if (isMobile) {
        return <MobileGuard />;
    }

    return (
        // AppLayout: 전역 레이아웃 너비 기준(min/max)을 담당
        // App.tsx는 "AppLayout 안에 라우터를 넣는다"는 것만 알면 된다.
        <AppLayout>
            <BrowserRouter>
                <Routes>
                    {/* 홈: 닉네임 입력 후 게임 진입 */}
                    <Route path="/" element={<Home />} />

                    {/* 로비 목록: 세션이 없으면 홈으로 리다이렉트 */}
                    <Route
                        path="/lobbies"
                        element={
                            <ProtectedRoute>
                                <Lobbies />
                            </ProtectedRoute>
                        }
                    />

                    {/* 특정 로비 입장: 6자리 초대코드 기반, 세션이 없으면 홈으로 리다이렉트 */}
                    <Route
                        path="/lobby/:inviteCode"
                        element={
                            <ProtectedRoute>
                                <LobbyRoom />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </BrowserRouter>
        </AppLayout>
    );
}

export default App;