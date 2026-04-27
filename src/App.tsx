// 애플리케이션의 라우팅 구조 정의 및 앱 전역 생명주기 훅 (세션 초기화, 소켓 연결) 실행

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { useSocket } from './hooks/useSocket';

// 인라인에서 독립 파일로 분리된 라우트 가드 컴포넌트
import { ProtectedRoute } from './components/common/ProtectedRoute';

import { Home } from './pages/Home';
import { Lobbies } from './pages/Lobbies';
import { LobbyRoom } from './pages/LobbyRoom';

/**
 * [애플리케이션 루트 컴포넌트]
 *
 * 이 컴포넌트의 책임:
 *   1. 앱 최초 진입 시 localStorage에서 게스트 세션을 복구 (initializeSession)
 *   2. 세션이 확인된 후 WebSocket 연결 시작 (useSocket)
 *   3. URL 경로에 따라 적절한 페이지 컴포넌트를 렌더링 (Routes/Route)
 *
 * 이 컴포넌트가 하지 않는 것:
 *   - 인증 가드 로직 → ProtectedRoute가 담당
 *   - 소켓 연결/해제 세부 로직 → useSocket, useSocketStore가 담당
 */

function App() {
    // 앱 시작 시 localStorage에서 세션 데이터를 읽어 Zustand에 복원한다.
    // useEffect dependency로 전달하기 위해 함수 참조를 가져온다.
    const initializeSession = useAuthStore((state) => state.initializeSession);

    useEffect(() => {
        // 컴포넌트 최초 마운트 시 단 한 번만 실행한다.
        // initializeSession은 Zustand 액션이므로 참조가 변하지 않아
        // dependency 배열에 넣어도 무한 루프가 발생하지 않는다.
        initializeSession();
    }, [initializeSession]);

    // WebSocket 연결 생명주기를 관리하는 훅
    // 내부적으로 uuid가 생기는 순간 연결하고, 사라지는 순간 해제한다.
    // App 최상단에서 한 번만 호출하여 전역에서 소켓 상태를 공유한다.
    useSocket();

    return (
        <div className="w-full min-h-screen bg-black text-white">
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
        </div>
    );
}

export default App;