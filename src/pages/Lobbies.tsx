import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { NavigationBar } from '../components/common/NavigationBar';
import { GlobalChat } from '../components/lobby/GlobalChat';
import { LobbyFooter } from '../components/lobby/LobbyFooter';
import { LobbyHeader } from '../components/lobby/LobbyHeader';
import { LobbyList } from '../components/lobby/LobbyList';
import { useLobbyList } from '../hooks/useLobbyList';
import {
    SORT_QUERY_MAP,
    type LobbyCategory,
    type LobbySortOption,
} from '../types/lobby';

const CATEGORY_FILTERS = ['전체', 'K-POP', 'J-POP', 'POP', 'OST'] as const;
const DEFAULT_LOBBY_LIST_PAGE = 0;
const DEFAULT_LOBBY_LIST_SIZE = 20;

type LobbyCategoryFilter = (typeof CATEGORY_FILTERS)[number];

function toMapCategory(
    category: LobbyCategoryFilter,
): LobbyCategory | undefined {
    return category === '전체' ? undefined : category;
}

export function Lobbies() {
    const navigate = useNavigate();

    const [searchKeyword, setSearchKeyword] = useState('');
    const [selectedCategory, setSelectedCategory] =
        useState<LobbyCategoryFilter>('전체');
    const [sortOption, setSortOption] =
        useState<LobbySortOption>('LATEST');

    const lobbyListQueryParams = useMemo(() => ({
        keyword: searchKeyword.trim(),
        mapCategory: toMapCategory(selectedCategory),
        sort: SORT_QUERY_MAP[sortOption],
        page: DEFAULT_LOBBY_LIST_PAGE,
        size: DEFAULT_LOBBY_LIST_SIZE,
    }), [searchKeyword, selectedCategory, sortOption]);

    const { data, isLoading, isError } = useLobbyList(lobbyListQueryParams);
    const lobbies = data?.items ?? [];

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
                        lobbies={lobbies}
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
