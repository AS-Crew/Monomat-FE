import { useNavigate } from 'react-router-dom';
import { LobbyCard } from '../components/lobby/LobbyCard';
import { useLobbyList } from '../hooks/useLobbyList';

export function Lobbies() {
    const navigate = useNavigate();
    const { data: lobbies, isLoading, isError } = useLobbyList();

    const handleEnter = (code: string) => {
        navigate(`/lobby/${code}`);
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#F5F5F7] text-gray-400">
                로비 목록을 불러오는 중...
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#F5F5F7] text-red-400">
                로비 목록을 불러오지 못했습니다.
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F5F5F7] px-6 py-6">
            {/* 상단 컨트롤 영역 */}
            <div className="mb-4 flex items-center gap-3">
                <input
                    type="text"
                    placeholder="로비 제목 검색"
                    className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 shadow-sm focus:border-blue-400 focus:outline-none"
                />
                <button className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-600 shadow-sm hover:bg-gray-50">
                    정렬: 최신순 ▼
                </button>
            </div>

            {/* 카테고리 필터 */}
            <div className="mb-5 flex gap-2">
                {['전체', 'K-POP', 'J-POP', 'POP', 'OST'].map((cat, i) => (
                    <button
                        key={cat}
                        className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                            i === 0
                                ? 'bg-blue-500 text-white'
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* 로비 리스트 그리드 */}
            <div className="grid grid-cols-2 gap-4">
                {lobbies && lobbies.length > 0 ? (
                    lobbies.map((lobby) => (
                        <LobbyCard
                            key={lobby.code}
                            lobby={lobby}
                            onEnter={handleEnter}
                        />
                    ))
                ) : (
                    <div className="col-span-2 flex h-40 items-center justify-center text-gray-400">
                        현재 열린 로비가 없습니다.
                    </div>
                )}
            </div>
        </div>
    );
}