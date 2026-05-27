// 애플리케이션의 라우팅 구조 정의 및 앱 전역 생명주기 훅 (세션 초기화, 소켓 연결) 실행

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { useSocket } from './hooks/useSocket';

// 공통 컴포넌트
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { AppLayout } from './components/common/AppLayout';
import { ViewportGuard } from './components/common/ViewportGuard';

// 페이지 컴포넌트
import { Home } from './pages/Home';
import { Lobbies } from './pages/Lobbies';
import { LobbyRoom } from './pages/LobbyRoom';

/**
 * [애플리케이션 루트 컴포넌트]
 *
 * 이 컴포넌트의 책임:
 *   1. 지원 viewport인지 확인한 뒤 기존 앱을 마운트 (ViewportGuard)
 *   2. guard 통과 후 localStorage에서 게스트 세션을 복구 (initializeSession)
 *   3. 세션이 확인된 후 WebSocket 연결 시작 (useSocket)
 *   4. URL 경로에 따라 적절한 페이지 컴포넌트를 렌더링 (Routes/Route)
 *
 * 이 컴포넌트가 하지 않는 것:
 *   - 인증 가드 로직 → ProtectedRoute가 담당
 *   - 소켓 연결/해제 세부 로직 → useSocket, useSocketStore가 담당
 *   - 전역 레이아웃 기준 → AppLayout이 담당
 */
function App() {
    return (
        <ViewportGuard>
            <AppRoutes />
        </ViewportGuard>
    );
}

function AppRoutes() {
    const initializeSession = useAuthStore((state) => state.initializeSession);

    useEffect(() => {
        // 컴포넌트 최초 마운트 시 단 한 번만 실행한다.
        initializeSession();
    }, [initializeSession]);

    // WebSocket 연결 생명주기를 관리하는 훅
    // App 최상단에서 한 번만 호출하여 전역에서 소켓 상태를 공유한다.
    useSocket();

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />

                <Route
                    path="/lobbies"
                    element={
                        <AppLayout>
                            <ProtectedRoute>
                                <Lobbies />
                            </ProtectedRoute>
                        </AppLayout>
                    }
                />

                <Route
                    path="/lobby/:inviteCode"
                    element={
                        <AppLayout>
                            <ProtectedRoute>
                                <LobbyRoom />
                            </ProtectedRoute>
                        </AppLayout>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
