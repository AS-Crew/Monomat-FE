import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { NavigationBar } from '../components/common/NavigationBar';
import { GlobalChat } from '../components/lobby/GlobalChat';
import { LobbyFooter } from '../components/lobby/LobbyFooter';
import { LobbyHeader } from '../components/lobby/LobbyHeader';
import { LobbyList } from '../components/lobby/LobbyList';
import {
    DEFAULT_LOBBY_LIST_PAGE,
    DEFAULT_LOBBY_LIST_SIZE,
    LOBBY_ALL_CATEGORY_FILTER,
    LOBBY_CATEGORY_FILTERS,
    LOBBY_ROUTES,
} from '../constants/lobby';
import { useLobbyList } from '../hooks/useLobbyList';
import {
    SORT_QUERY_MAP,
    type LobbyCategory,
    type LobbySortOption,
} from '../types/lobby';

type LobbyCategoryFilter = (typeof LOBBY_CATEGORY_FILTERS)[number];

function toMapCategory(
    category: LobbyCategoryFilter,
): LobbyCategory | undefined {
    return category === LOBBY_ALL_CATEGORY_FILTER ? undefined : category;
}

export function Lobbies() {
    const navigate = useNavigate();

    const [searchKeyword, setSearchKeyword] = useState('');
    const [selectedCategory, setSelectedCategory] =
        useState<LobbyCategoryFilter>(LOBBY_ALL_CATEGORY_FILTER);
    const [sortOption, setSortOption] =
        useState<LobbySortOption>('LATEST');

    const lobbyListQueryParams = useMemo(() => {
        const mapCategory = toMapCategory(selectedCategory);

        return {
            keyword: searchKeyword.trim(),
            ...(mapCategory ? { mapCategory } : {}),
            sort: SORT_QUERY_MAP[sortOption],
            page: DEFAULT_LOBBY_LIST_PAGE,
            size: DEFAULT_LOBBY_LIST_SIZE,
        };
    }, [searchKeyword, selectedCategory, sortOption]);

    const {
        data,
        isLoading,
        isError,
        refetch,
    } = useLobbyList(lobbyListQueryParams);
    const lobbies = data?.items ?? [];

    const handleEnter = (code: string) => {
        navigate(LOBBY_ROUTES.ROOM(code));
    };

    return (
        <div className="flex min-h-screen min-w-[1440px] flex-col bg-[var(--monomat-page-bg)] text-left">
            <NavigationBar />

            <main className="mx-auto grid w-[1440px] flex-1 grid-cols-[894px_451px] gap-[27px] px-[35px] pb-[25px] pt-6">
                <section className="min-w-0">
                    <LobbyHeader
                        searchKeyword={searchKeyword}
                        onSearchKeywordChange={setSearchKeyword}
                        categories={LOBBY_CATEGORY_FILTERS}
                        selectedCategory={selectedCategory}
                        onSelectedCategoryChange={setSelectedCategory}
                        sortOption={sortOption}
                        onSortOptionChange={setSortOption}
                    />

                    <LobbyList
                        lobbies={lobbies}
                        isLoading={isLoading}
                        isError={isError}
                        onRetry={() => void refetch()}
                        onEnter={handleEnter}
                    />
                </section>

                <aside className="h-[733px] w-[451px] shrink-0">
                    <GlobalChat />
                </aside>
            </main>

            <LobbyFooter />
        </div>
    );
}
