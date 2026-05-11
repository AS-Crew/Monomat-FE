import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { NavigationBar } from '../components/common/NavigationBar';
import { GlobalChat } from '../components/lobby/GlobalChat';
import { LobbyFooter } from '../components/lobby/LobbyFooter';
import { LobbyHeader } from '../components/lobby/LobbyHeader';
import { LobbyList } from '../components/lobby/LobbyList';
import { useLobbyList } from '../hooks/useLobbyList';
import { sortLobbies, type LobbySortOption } from '../utils/lobbySort';

const CATEGORY_FILTERS = ['전체', 'K-POP', 'J-POP', 'POP', 'OST'] as const;

type LobbyCategoryFilter = (typeof CATEGORY_FILTERS)[number];

export function Lobbies() {
    const navigate = useNavigate();
    const { data: lobbies, isLoading, isError } = useLobbyList();

    const [searchKeyword, setSearchKeyword] = useState('');
    const [selectedCategory, setSelectedCategory] =
        useState<LobbyCategoryFilter>('전체');
    const [sortOption, setSortOption] =
        useState<LobbySortOption>('LATEST');

    const filteredAndSortedLobbies = useMemo(() => {
        const safeLobbies = lobbies ?? [];
        const normalizedKeyword = searchKeyword.trim().toLowerCase();

        const filteredLobbies = safeLobbies.filter((lobby) => {
            /*
             * BE 응답이 일시적으로 비어 있거나, 기존 mock 데이터가 남아 있는 경우에도
             * 로비 목록 화면 전체가 죽지 않도록 title을 안전하게 정규화한다.
             */
            const lobbyTitle = lobby.title ?? '';

            const matchesKeyword = lobbyTitle
                .toLowerCase()
                .includes(normalizedKeyword);

            /*
             * 로비 카테고리는 로비 자체의 속성이 아니라 선택된 맵의 카테고리이므로
             * BE 응답 필드명인 mapCategory를 기준으로 필터링한다.
             */
            const matchesCategory =
                selectedCategory === '전체' ||
                lobby.mapCategory === selectedCategory;

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