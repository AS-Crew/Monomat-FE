import {
    type ChangeEvent,
    type MouseEvent,
    useEffect,
    useState,
} from 'react';
import {
    Check,
    ChevronDown,
    LoaderCircle,
    LockKeyhole,
    Music,
    Search,
    X,
} from 'lucide-react';

import {
    getMyMaps,
    getPublicMaps,
} from '../../api/mapApi';
import { ApiError } from '../../api/apiError';
import {
    DEFAULT_MAP_LIST_PAGE,
    MAP_ALL_CATEGORY_FILTER,
    MAP_CATEGORY_FILTERS,
    MAP_CATEGORY_QUERY_VALUE,
    MAP_SELECT_MODAL_PAGE_SIZE,
} from '../../constants/map';
import { useAuthStore } from '../../store/useAuthStore';
import {
    formatMapDescription,
    formatMapOwnerNickname,
} from '../../utils/mapFormat';
import { LobbyCategoryFilter } from './LobbyCategoryFilter';

import type {
    MapCategoryQueryValue,
    MapSummary,
} from '../../types/map';

interface MapSelectModalProps {
    isOpen: boolean;
    selectedMap: MapSummary | null;
    onConfirm: (map: MapSummary) => void;
    onClose: () => void;
}

const SEARCH_DEBOUNCE_MS = 300;
const MAP_LIST_SORT = 'NEWEST';
const PUBLIC_MAP_TAB = 'public';
const MY_MAP_TAB = 'my';

type MapSelectTab = typeof PUBLIC_MAP_TAB | typeof MY_MAP_TAB;
type MapCategoryFilter = (typeof MAP_CATEGORY_FILTERS)[number];

function toMapCategoryQueryValue(
    category: MapCategoryFilter,
): MapCategoryQueryValue | undefined {
    return category === MAP_ALL_CATEGORY_FILTER
        ? undefined
        : MAP_CATEGORY_QUERY_VALUE[category];
}

function getErrorMessage(error: unknown, fallbackMessage: string) {
    if (error instanceof Error && error.message) {
        return error.message;
    }

    return fallbackMessage;
}

function getMapListErrorMessage(error: unknown, isPublicMapTab: boolean) {
    if (
        !isPublicMapTab &&
        error instanceof ApiError &&
        error.status === 403
    ) {
        return '내 맵 목록을 불러오지 못했습니다. 다시 로그인한 뒤 시도해주세요.';
    }

    return getErrorMessage(error, '맵 목록을 불러오는 데 실패했습니다.');
}

function MapSelectModalSkeleton() {
    return (
        <div className="space-y-3 py-1">
            {Array.from({ length: MAP_SELECT_MODAL_PAGE_SIZE }, (_, index) => (
                <div
                    key={index}
                    className="flex h-14 animate-pulse items-center gap-3 rounded-lg px-[5px]"
                >
                    <div className="h-[38px] w-[38px] rounded-lg bg-[var(--monomat-primary-light)]" />
                    <div className="min-w-0 flex-1">
                        <div className="h-4 w-44 rounded bg-[var(--monomat-page-bg)]" />
                        <div className="mt-2 h-3 w-36 rounded bg-[var(--monomat-page-bg)]" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function MapSelectModal({
    isOpen,
    selectedMap,
    onConfirm,
    onClose,
}: MapSelectModalProps) {
    const userType = useAuthStore((state) => state.userType);
    const [keyword, setKeyword] = useState('');
    const [debouncedKeyword, setDebouncedKeyword] = useState('');
    const [activeTab, setActiveTab] =
        useState<MapSelectTab>(PUBLIC_MAP_TAB);
    const [selectedCategory, setSelectedCategory] =
        useState<MapCategoryFilter>(MAP_ALL_CATEGORY_FILTER);
    const [maps, setMaps] = useState<MapSummary[]>([]);
    const [page, setPage] = useState(DEFAULT_MAP_LIST_PAGE);
    const [hasNext, setHasNext] = useState(false);
    const [tempSelectedMap, setTempSelectedMap] =
        useState<MapSummary | null>(selectedMap);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const canUseMyMapTab = userType === 'REGISTERED';
    const isPublicMapTab = activeTab === PUBLIC_MAP_TAB;
    const category = toMapCategoryQueryValue(selectedCategory);
    const emptyMessage = isPublicMapTab
        ? '조건에 맞는 공개 맵이 없습니다.'
        : '아직 만든 맵이 없습니다.';

    useEffect(() => {
        if (!isOpen) {
            setSelectedCategory(MAP_ALL_CATEGORY_FILTER);
            return;
        }

        setActiveTab(PUBLIC_MAP_TAB);
        setTempSelectedMap(selectedMap);
    }, [isOpen, selectedMap]);

    useEffect(() => {
        if (activeTab === MY_MAP_TAB && !canUseMyMapTab) {
            setActiveTab(PUBLIC_MAP_TAB);
            setTempSelectedMap(null);
        }
    }, [activeTab, canUseMyMapTab]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            setDebouncedKeyword(keyword.trim());
        }, SEARCH_DEBOUNCE_MS);

        return () => window.clearTimeout(timeoutId);
    }, [isOpen, keyword]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        let isCurrent = true;

        async function fetchMaps() {
            try {
                setIsLoading(true);
                setErrorMessage(null);

                const response = isPublicMapTab
                    ? await getPublicMaps({
                        page: DEFAULT_MAP_LIST_PAGE,
                        size: MAP_SELECT_MODAL_PAGE_SIZE,
                        keyword: debouncedKeyword,
                        category,
                        sort: MAP_LIST_SORT,
                    })
                    : await getMyMaps({
                        page: DEFAULT_MAP_LIST_PAGE,
                        size: MAP_SELECT_MODAL_PAGE_SIZE,
                    });

                if (!isCurrent) {
                    return;
                }

                setMaps(response.content);
                setPage(response.page);
                setHasNext(response.hasNext);
            } catch (error) {
                if (!isCurrent) {
                    return;
                }

                setMaps([]);
                setHasNext(false);
                setErrorMessage(getMapListErrorMessage(error, isPublicMapTab));
            } finally {
                if (isCurrent) {
                    setIsLoading(false);
                }
            }
        }

        fetchMaps();

        return () => {
            isCurrent = false;
        };
    }, [isOpen, isPublicMapTab, debouncedKeyword, category]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    if (!isOpen) {
        return null;
    }

    const handleContentMouseDown = (event: MouseEvent<HTMLDivElement>) => {
        event.stopPropagation();
    };

    const handleKeywordChange = (event: ChangeEvent<HTMLInputElement>) => {
        setKeyword(event.target.value);
        setPage(DEFAULT_MAP_LIST_PAGE);
        setHasNext(false);
    };

    const handleCategoryChange = (nextCategory: MapCategoryFilter) => {
        if (selectedCategory === nextCategory) {
            return;
        }

        setSelectedCategory(nextCategory);
        setPage(DEFAULT_MAP_LIST_PAGE);
        setHasNext(false);
        setMaps([]);
        setErrorMessage(null);
    };

    const handleTabChange = (nextTab: MapSelectTab) => {
        if (activeTab === nextTab) {
            return;
        }

        if (nextTab === MY_MAP_TAB && !canUseMyMapTab) {
            return;
        }

        setActiveTab(nextTab);
        setPage(DEFAULT_MAP_LIST_PAGE);
        setHasNext(false);
        setMaps([]);
        setTempSelectedMap(null);
        setErrorMessage(null);
    };

    const handleLoadMore = async () => {
        if (isLoadingMore || isLoading || !hasNext) {
            return;
        }

        const nextPage = page + 1;

        try {
            setIsLoadingMore(true);
            setErrorMessage(null);

            const response = isPublicMapTab
                ? await getPublicMaps({
                    page: nextPage,
                    size: MAP_SELECT_MODAL_PAGE_SIZE,
                    keyword: debouncedKeyword,
                    category,
                    sort: MAP_LIST_SORT,
                })
                : await getMyMaps({
                    page: nextPage,
                    size: MAP_SELECT_MODAL_PAGE_SIZE,
                });

            setMaps((currentMaps) => [...currentMaps, ...response.content]);
            setPage(response.page);
            setHasNext(response.hasNext);
        } catch (error) {
            setErrorMessage(
                getErrorMessage(error, '추가 맵을 불러오는 데 실패했습니다.'),
            );
        } finally {
            setIsLoadingMore(false);
        }
    };

    const handleConfirm = () => {
        if (!tempSelectedMap) {
            return;
        }

        onConfirm(tempSelectedMap);
        onClose();
    };

    return (
        <div
            role="presentation"
            onMouseDown={onClose}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-8"
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="map-select-modal-title"
                onMouseDown={handleContentMouseDown}
                className="flex max-h-[calc(100vh-64px)] w-full max-w-[500px] flex-col overflow-hidden rounded-[14px] bg-white shadow-[0_18px_48px_rgba(15,23,42,0.22)]"
            >
                <header className="px-[25px] pb-0 pt-9">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <h2
                                id="map-select-modal-title"
                                className="!m-0 !text-[24px] !font-extrabold !leading-[33px] !text-black"
                            >
                                맵 선택
                            </h2>
                            <p className="mt-1 text-xs font-medium leading-[15px] text-[var(--monomat-text-muted)]">
                                로비에서 사용할 문제 리스트를 고르세요.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--monomat-text-muted)] transition hover:bg-[var(--monomat-page-bg)] hover:text-black"
                            aria-label="맵 선택 모달 닫기"
                        >
                            <X size={22} strokeWidth={1.8} />
                        </button>
                    </div>

                    <div className="mt-2 h-4 border-t border-[var(--monomat-border-input)]" />

                    <div className="flex h-8 items-center gap-2">
                        <button
                            type="button"
                            onClick={() => handleTabChange(PUBLIC_MAP_TAB)}
                            className={`h-8 rounded-2xl px-9 text-sm font-bold leading-none transition ${
                                isPublicMapTab
                                    ? 'bg-[var(--monomat-primary)] text-white'
                                    : 'border border-[var(--monomat-border-input)] bg-white text-[var(--monomat-text-muted)] hover:bg-[var(--monomat-page-bg)]'
                            }`}
                            aria-pressed={isPublicMapTab}
                        >
                            전체 공개 맵
                        </button>

                        <button
                            type="button"
                            onClick={() => handleTabChange(MY_MAP_TAB)}
                            disabled={!canUseMyMapTab}
                            title={
                                canUseMyMapTab
                                    ? undefined
                                    : '내 맵은 정식 회원만 사용할 수 있습니다.'
                            }
                            className={`h-8 rounded-2xl px-5 text-sm font-bold leading-none transition ${
                                !isPublicMapTab
                                    ? 'bg-[var(--monomat-primary)] text-white'
                                    : 'border border-[var(--monomat-border-input)] bg-white text-[var(--monomat-text-muted)] hover:bg-[var(--monomat-page-bg)]'
                            } disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-white`}
                            aria-pressed={!isPublicMapTab}
                        >
                            내 맵
                        </button>
                    </div>

                    {isPublicMapTab && (
                        <LobbyCategoryFilter
                            categories={MAP_CATEGORY_FILTERS}
                            selectedCategory={selectedCategory}
                            onChange={handleCategoryChange}
                            className="mt-3"
                        />
                    )}

                    <label
                        className={`mt-[9px] flex h-11 items-center rounded-lg border border-[var(--monomat-border-input)] bg-[var(--monomat-page-bg)] px-[11px] focus-within:border-[var(--monomat-primary)] ${
                            isPublicMapTab ? '' : 'opacity-70'
                        }`}
                    >
                        <Search
                            size={24}
                            strokeWidth={1.8}
                            className="shrink-0 text-[#2B3F6C]"
                            aria-hidden="true"
                        />
                        <input
                            type="search"
                            value={isPublicMapTab ? keyword : ''}
                            onChange={handleKeywordChange}
                            disabled={!isPublicMapTab}
                            placeholder={
                                isPublicMapTab
                                    ? '맵 제목으로 검색하세요'
                                    : '내 맵 검색은 추후 제공 예정입니다.'
                            }
                            className="ml-3 h-full min-w-0 flex-1 bg-transparent text-sm font-medium text-[var(--monomat-text-strong)] outline-none placeholder:text-[var(--monomat-border-input)] disabled:cursor-not-allowed"
                        />
                    </label>

                    <div className="mt-2 h-4 border-t border-[var(--monomat-border-input)]" />
                </header>

                <div className="min-h-0 flex-1 overflow-y-auto px-[20px] pb-4">
                    {isLoading ? (
                        <MapSelectModalSkeleton />
                    ) : errorMessage ? (
                        <div
                            role="alert"
                            className="mx-[5px] rounded-lg bg-red-50 px-4 py-5 text-center text-sm font-semibold leading-5 text-red-600 ring-1 ring-red-100"
                        >
                            {errorMessage}
                        </div>
                    ) : maps.length === 0 ? (
                        <div className="mx-[5px] rounded-lg border border-dashed border-[var(--monomat-border-input)] px-4 py-8 text-center text-sm font-medium text-[var(--monomat-text-muted)]">
                            {emptyMessage}
                        </div>
                    ) : (
                        <div className="space-y-0">
                            {maps.map((map) => {
                                const isSelected =
                                    tempSelectedMap?.mapId === map.mapId;

                                return (
                                    <div
                                        key={map.mapId}
                                        className={`rounded-lg transition ${
                                            isSelected
                                                ? 'bg-[var(--monomat-primary-light)] ring-1 ring-inset ring-[var(--monomat-primary)]'
                                                : 'hover:bg-[var(--monomat-page-bg)]'
                                        }`}
                                    >
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setTempSelectedMap(map)
                                            }
                                            aria-pressed={isSelected}
                                            className="group flex min-h-14 w-full items-start rounded-lg px-[5px] py-[9px] text-left"
                                        >
                                            <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-lg bg-[var(--monomat-primary-light)] text-[#2B3F6C]">
                                                <Music
                                                    size={23}
                                                    strokeWidth={1.7}
                                                />
                                            </span>

                                            <span className="ml-3 min-w-0 flex-1">
                                                <span className="flex min-w-0 items-center gap-1.5">
                                                    <span className="min-w-0 whitespace-normal break-keep text-[15px] font-bold leading-[18px] text-black [overflow-wrap:anywhere]">
                                                        {map.title}
                                                    </span>
                                                    {!map.isPublic && (
                                                        <LockKeyhole
                                                            size={14}
                                                            strokeWidth={1.7}
                                                            className="shrink-0 text-[#2B3F6C]"
                                                            aria-label="비공개 맵"
                                                        />
                                                    )}
                                                </span>
                                                <span className="mt-1 block truncate text-[11px] font-medium leading-[11px] text-[var(--monomat-text-muted)]">
                                                    {map.category} | 곡{' '}
                                                    {map.numOfSong}개 |{' '}
                                                    {formatMapOwnerNickname(
                                                        map.ownerNickname,
                                                    )}
                                                </span>
                                            </span>

                                            <span className="ml-3 flex h-8 w-8 shrink-0 items-center justify-center text-black">
                                                {isSelected ? (
                                                    <Check
                                                        size={20}
                                                        strokeWidth={2.2}
                                                        className="text-[var(--monomat-primary)]"
                                                    />
                                                ) : (
                                                    <ChevronDown
                                                        size={23}
                                                        strokeWidth={1.7}
                                                        className="translate-y-1 text-black transition group-hover:translate-y-0"
                                                    />
                                                )}
                                            </span>
                                        </button>

                                        {isSelected && (
                                            <div className="mb-4 ml-[5px] mr-[5px] whitespace-pre-line break-keep border-t border-[color:var(--monomat-border-default)] px-[50px] pb-2 pt-[10px] text-xs font-medium leading-5 text-[var(--monomat-text-muted)] [overflow-wrap:anywhere]">
                                                {formatMapDescription(
                                                    map.description,
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {!isLoading && hasNext && !errorMessage && (
                        <button
                            type="button"
                            onClick={handleLoadMore}
                            disabled={isLoadingMore}
                            className="mx-auto mt-3 flex h-9 min-w-[112px] items-center justify-center rounded-lg border border-[var(--monomat-border-input)] bg-white px-4 text-sm font-bold text-black transition hover:bg-[var(--monomat-page-bg)] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isLoadingMore ? (
                                <LoaderCircle
                                    size={18}
                                    className="animate-spin"
                                    aria-label="추가 맵 불러오는 중"
                                />
                            ) : (
                                '더보기'
                            )}
                        </button>
                    )}
                </div>

                <footer className="flex h-[74px] shrink-0 items-center justify-end gap-3 border-t border-[var(--monomat-border-default)] px-[25px]">
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-10 w-20 rounded-lg border border-[var(--monomat-border-input)] bg-white text-[15px] font-bold text-black transition hover:bg-[var(--monomat-page-bg)]"
                    >
                        취소
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={!tempSelectedMap}
                        className="h-10 w-[110px] rounded-lg bg-[var(--monomat-primary)] text-[15px] font-bold text-white transition hover:bg-[var(--monomat-primary-hover)] disabled:cursor-not-allowed disabled:bg-[var(--monomat-primary-disabled)]"
                    >
                        선택 완료
                    </button>
                </footer>
            </div>
        </div>
    );
}
