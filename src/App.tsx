import { useEffect } from 'react';
import { Home } from './pages/Home';
import { useAuthStore } from './store/useAuthStore';
// import { Lobbies } from './pages/Lobbies';

function App() {
    const initializeSession = useAuthStore((state) => state.initializeSession);
    const isGuest = useAuthStore((state) => state.isGuest);

    // 컴포넌트 마운트 시 정확히 1번만 세션 복구 로직 실행
    useEffect(() => {
        initializeSession();
    }, [initializeSession]);

    return (
        <div className="w-full min-h-screen bg-black text-white">
            {/* 세션(isGuest)이 있으면 로비 목록 등으로 보내고,
        없으면 닉네임 입력 화면(Home)을 보여주는 라우팅 처리 예시입니다.
      */}
            {isGuest ? (
                // <Lobbies />
                <div className="p-10">
                    <h2 className="text-2xl text-blue-400">환영합니다, 게임 로비 대기실입니다!</h2>
                    <button
                        onClick={() => useAuthStore.getState().clearSession()}
                        className="mt-4 px-4 py-2 bg-red-600 rounded"
                    >
                        로그아웃(세션 초기화)
                    </button>
                </div>
            ) : (
                <Home />
            )}
        </div>
    );
}

export default App;