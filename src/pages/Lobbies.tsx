import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { NavigationBar } from '../components/common/NavigationBar';
import { GlobalChat } from '../components/lobby/GlobalChat';
import { LobbyCard } from '../components/lobby/LobbyCard';
import { useLobbyList } from '../hooks/useLobbyList';
import { useSocketStore } from '../store/useSocketStore';
import type { Lobby } from '../types/lobby';
import { getOrCreateBrowserUserId } from '../utils/browserUserId';

type SortOption = 'LATEST' | 'MOST_PLAYERS' | 'MOST_EMPTY_SLOTS';

const SORT_LABELS: Record<SortOption, string> = {
    LATEST: '최신순',
    MOST_PLAYERS: '인원 많은 순',
    MOST_EMPTY_SLOTS: '빈 자리 많은 순',
};

const CATEGORY_FILTERS = ['전체', 'K-POP', 'J-POP', 'POP', 'OST'] as const;

function getCurrentPlayers(lobby: Lobby): number {
    return 'currentPlayers' in lobby && typeof lobby.currentPlayers === 'number'
        ? lobby.currentPlayers
        : 1;
}

function sortLobbies(lobbies: Lobby[], sortOption: SortOption): Lobby[] {
    const copiedLobbies = [...lobbies];

    switch (sortOption) {
        case 'MOST_PLAYERS':
            return copiedLobbies.sort(
                (left, right) => getCurrentPlayers(right) - getCurrentPlayers(left),
            );

        case 'MOST_EMPTY_SLOTS':
            return copiedLobbies.sort(
                (left, right) =>
                    right.maxPlayers -
                    getCurrentPlayers(right) -
                    (left.maxPlayers - getCurrentPlayers(left)),
            );

        case 'LATEST':
        default:
            return copiedLobbies;
    }
}

function LobbyFooter() {
    return (
        <footer className="flex h-10 shrink-0 items-center justify-between border-t border-gray-200 bg-white px-10 text-sm text-gray-500">
            <span>© 2026 Monomat. 실시간 멀티플레이 퀴즈.</span>

            <div className="flex items-center gap-6">
                <button type="button" className="hover:text-gray-700">
                    문제 신고
                </button>
                <button type="button" className="hover:text-gray-700">
                    이용약관
                </button>
                <button type="button" className="hover:text-gray-700">
                    개인정보처리방침
                </button>
            </div>
        </footer>
    );
}

interface SortDropdownProps {
    value: SortOption;
    onChange: (value: SortOption) => void;
}

function SortDropdown({ value, onChange }: SortDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (nextValue: SortOption) => {
        onChange(nextValue);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="min-w-36 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-600 shadow-sm hover:bg-gray-50"
            >
                {SORT_LABELS[value]} ▼
            </button>

            {isOpen && (
                <div className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                    {(Object.keys(SORT_LABELS) as SortOption[]).map((option) => (
                        <button
                            key={option}
                            type="button"
                            onClick={() => handleSelect(option)}
                            className={`block w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 ${
                                value === option
                                    ? 'font-semibold text-blue-500'
                                    : 'text-gray-600'
                            }`}
                        >
                            {SORT_LABELS[option]}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export function Lobbies() {
    const navigate = useNavigate();
    const { data: lobbies, isLoading, isError } = useLobbyList();

    const connectSocket = useSocketStore((state) => state.connect);

    const [searchKeyword, setSearchKeyword] = useState('');
    const [selectedCategory, setSelectedCategory] =
        useState<(typeof CATEGORY_FILTERS)[number]>('전체');
    const [sortOption, setSortOption] = useState<SortOption>('LATEST');

    useEffect(() => {
        const browserUserId = getOrCreateBrowserUserId();

        connectSocket(browserUserId);
    }, [connectSocket]);

    const filteredAndSortedLobbies = useMemo(() => {
        const safeLobbies = lobbies ?? [];

        const filteredLobbies = safeLobbies.filter((lobby) => {
            const matchesKeyword = lobby.title
                .toLowerCase()
                .includes(searchKeyword.trim().toLowerCase());

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
                    <div className="mb-4 flex items-center gap-3">
                        <input
                            type="text"
                            value={searchKeyword}
                            onChange={(event) =>
                                setSearchKeyword(event.target.value)
                            }
                            placeholder="로비 제목 검색"
                            className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 shadow-sm focus:border-blue-400 focus:outline-none"
                        />

                        <SortDropdown
                            value={sortOption}
                            onChange={setSortOption}
                        />
                    </div>

                    <div className="mb-5 flex gap-2">
                        {CATEGORY_FILTERS.map((category) => (
                            <button
                                key={category}
                                type="button"
                                onClick={() => setSelectedCategory(category)}
                                className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                                    selectedCategory === category
                                        ? 'bg-blue-500 text-white'
                                        : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {filteredAndSortedLobbies.length > 0 ? (
                            filteredAndSortedLobbies.map((lobby) => (
                                <LobbyCard
                                    key={lobby.code}
                                    lobby={lobby}
                                    onEnter={handleEnter}
                                />
                            ))
                        ) : (
                            <div className="col-span-2 flex h-40 items-center justify-center text-gray-400">
                                현재 조건에 맞는 로비가 없습니다.
                            </div>
                        )}
                    </div>
                </section>

                <aside className="sticky top-6 h-[calc(100vh-8.5rem)] w-96 shrink-0 self-start">
                    <GlobalChat />
                </aside>
            </main>

            <LobbyFooter />
        </div>
    );
}