import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { useSocketStore } from './store/useSocketStore'; // 추가
import { Home } from './pages/Home';
import { Lobbies } from './pages/Lobbies';
import { LobbyRoom } from './pages/LobbyRoom';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const isGuest = useAuthStore((state) => state.isGuest);
    return isGuest ? <>{children}</> : <Navigate to="/" replace />;
}

function App() {
    const initializeSession = useAuthStore((state) => state.initializeSession);
    const uuid = useAuthStore((state) => state.uuid);           // 추가
    const connect = useSocketStore((state) => state.connect);   // 추가

    useEffect(() => {
        initializeSession();
    }, [initializeSession]);

    // uuid가 생기는 순간(로그인 완료) 소켓 연결을 시작합니다.
    useEffect(() => {
        if (uuid) {
            connect(uuid);
        }
    }, [uuid, connect]); // 추가

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