import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { useSocket } from './hooks/useSocket'; // 추가
import { Home } from './pages/Home';
import { Lobbies } from './pages/Lobbies';
import { LobbyRoom } from './pages/LobbyRoom';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const isGuest = useAuthStore((state) => state.isGuest);
    return isGuest ? <>{children}</> : <Navigate to="/" replace />;
}

function App() {
    const initializeSession = useAuthStore((state) => state.initializeSession);

    useEffect(() => {
        initializeSession();
    }, [initializeSession]);

    // useSocket 훅 한 줄로 소켓 연결/해제 생명주기를 관리합니다.
    // 내부적으로 uuid가 생기는 순간 연결하고, 사라지는 순간 해제합니다.
    useSocket();

    return (
        <div className="w-full min-h-screen bg-black text-white">
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route
                        path="/lobbies"
                        element={<ProtectedRoute><Lobbies /></ProtectedRoute>}
                    />
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