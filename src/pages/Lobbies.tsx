import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { NavigationBar } from '../components/common/NavigationBar';
import { GlobalChat } from '../components/lobby/GlobalChat';
import { LobbyFooter } from '../components/lobby/LobbyFooter';
import { LobbyHeader } from '../components/lobby/LobbyHeader';
import { LobbyList } from '../components/lobby/LobbyList';
import { useLobbyList } from '../hooks/useLobbyList';
import { useSocketStore } from '../store/useSocketStore';
import { getOrCreateBrowserUserId } from '../utils/browserUserId';
import { sortLobbies, type LobbySortOption } from '../utils/lobbySort';

const CATEGORY_FILTERS = ['전체', 'K-POP', 'J-POP', 'POP', 'OST'] as const;

type LobbyCategoryFilter = (typeof CATEGORY_FILTERS)[number];

export function Lobbies() {
    const navigate = useNavigate();
    const { data: lobbies, isLoading, isError } = useLobbyList();

    const connectSocket = useSocketStore((state) => state.connect);

    const [searchKeyword, setSearchKeyword] = useState('');
    const [selectedCategory, setSelectedCategory] =
        useState<LobbyCategoryFilter>('전체');
    const [sortOption, setSortOption] =
        useState<LobbySortOption>('LATEST');

    useEffect(() => {
        const browserUserId = getOrCreateBrowserUserId();

        connectSocket(browserUserId);
    }, [connectSocket]);

    const filteredAndSortedLobbies = useMemo(() => {
        const safeLobbies = lobbies ?? [];
        const normalizedKeyword = searchKeyword.trim().toLowerCase();

        const filteredLobbies = safeLobbies.filter((lobby) => {
            const matchesKeyword = lobby.title
                .toLowerCase()
                .includes(normalizedKeyword);

            const matchesCategory =
                selectedCategory === '전체' ||
                lobby.category === selectedCategory;

            return matchesKeyword && matchesCategory;
        });

        return sortLobbies(filteredLobbies, sortOption);
    }, [lobbies, searchKeyword, selectedCategory, sortOption]);

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
        <div className="flex min-h-screen flex-col bg-[#F5F5F7]">
            <NavigationBar />

            <main className="flex flex-1 gap-5 px-9 py-6">
                <section className="min-w-0 flex-1">
                    <LobbyHeader
                        searchKeyword={searchKeyword}
                        onSearchKeywordChange={setSearchKeyword}
                        categories={CATEGORY_FILTERS}
                        selectedCategory={selectedCategory}
                        onSelectedCategoryChange={setSelectedCategory}
                        sortOption={sortOption}
                        onSortOptionChange={setSortOption}
                    />

                    <LobbyList
                        lobbies={filteredAndSortedLobbies}
                        onEnter={handleEnter}
                    />
                </section>

                <aside className="sticky top-6 h-[calc(100vh-8.5rem)] w-96 shrink-0 self-start">
                    <GlobalChat />
                </aside>
            </main>

            <LobbyFooter />
        </div>
    );
}