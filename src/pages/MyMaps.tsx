import {
    type ChangeEvent,
    useState,
} from 'react';
import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    Clock,
    Cloud,
    Pencil,
    LockKeyhole,
    Music,
    Search,
    Trash2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { ApiError } from '../api/apiError';
import { NavigationBar } from '../components/common/NavigationBar';
import { LobbyFooter } from '../components/lobby/LobbyFooter';
import {
    DEFAULT_MAP_LIST_PAGE,
    MAP_PUBLIC_STATUS_META,
    MAP_ROUTES,
    MY_MAP_LIST_PAGE_SIZE,
    MY_MAP_SEARCH_PAGE_SIZE,
    MY_MAPS_EMPTY_STATE_COPY,
    MY_MAPS_ERROR_COPY,
    MY_MAPS_PAGE_COPY,
} from '../constants/map';
import { LOBBY_ROUTES } from '../constants/lobby';
import { useMyMaps } from '../hooks/useMyMaps';
import {
    formatMapDescription,
    formatMapPlayCount,
} from '../utils/mapFormat';

import type { MapSummary } from '../types/map';

const numberFormatter = new Intl.NumberFormat('ko-KR');

function getMapPublicStatusMeta(map: MapSummary) {
    if (map.isPublic) {
        return {
            ...MAP_PUBLIC_STATUS_META.PUBLIC,
            Icon: Cloud,
        };
    }

    if (map.pendingPublic) {
        return {
            ...MAP_PUBLIC_STATUS_META.PENDING,
            Icon: Clock,
        };
    }

    return {
        ...MAP_PUBLIC_STATUS_META.PRIVATE,
        Icon: LockKeyhole,
    };
}

function getErrorDescription(error: unknown) {
    if (error instanceof ApiError && error.status === 403) {
        return MY_MAPS_ERROR_COPY.FORBIDDEN_DESCRIPTION;
    }

    if (error instanceof Error && error.message) {
        return error.message;
    }

    return MY_MAPS_ERROR_COPY.DESCRIPTION;
}

function matchesMyMapSearch(map: MapSummary, keyword: string) {
    const normalizedKeyword = keyword.trim().toLowerCase();

    if (!normalizedKeyword) {
        return true;
    }

    const statusLabel = getMapPublicStatusMeta(map).label;
    const searchableText = [
        map.title,
        map.category,
        formatMapDescription(map.description),
        statusLabel,
        `${map.numOfSong}${MY_MAPS_PAGE_COPY.SONG_UNIT}`,
    ]
        .join(' ')
        .toLowerCase();

    return searchableText.includes(normalizedKeyword);
}

function MyMapStatusBadge({ map }: { map: MapSummary }) {
    const { label, badgeClassName, Icon } = getMapPublicStatusMeta(map);

    return (
        <span className={`inline-flex h-[22px] items-center justify-center gap-1 rounded-full border px-2 text-xs font-medium leading-none ${badgeClassName}`}>
            <Icon size={12} strokeWidth={2} aria-hidden="true" />
            {label}
        </span>
    );
}

function MyMapCategoryBadge({ category }: { category: MapSummary['category'] }) {
    return (
        <span className="inline-flex h-[24px] min-w-[52px] items-center justify-center rounded-full bg-[var(--monomat-primary-light)] px-2.5 text-[11px] font-semibold leading-none text-[var(--monomat-primary)]">
            {category}
        </span>
    );
}

function MyMapIcon() {
    return (
        <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-lg bg-[#C9DBFF] text-[#2B3F6C]">
            <Music size={20} strokeWidth={2} aria-hidden="true" />
        </span>
    );
}

function MyMapRow({ map }: { map: MapSummary }) {
    const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
    const description = formatMapDescription(map.description);
    const songCount = numberFormatter.format(map.numOfSong);
    const playCount = formatMapPlayCount(map.playCount);
    const DescriptionIcon = isDescriptionOpen ? ChevronUp : ChevronDown;

    return (
        <article className="grid min-h-[112px] grid-cols-1 gap-3 border-t border-[color:var(--monomat-border-input)] bg-[#FEFEFF] px-4 py-4 text-left md:min-h-[60px] md:grid-cols-[430px_110px_110px_110px_140px] md:items-stretch md:gap-0 md:px-0 md:py-0">
            <button
                type="button"
                onClick={() => setIsDescriptionOpen((current) => !current)}
                aria-expanded={isDescriptionOpen}
                aria-label={MY_MAPS_PAGE_COPY.DESCRIPTION_TOGGLE_ARIA_LABEL(
                    map.title,
                )}
                className="flex min-w-0 items-start gap-3 text-left md:min-h-[60px] md:items-center md:bg-white md:pl-[30px] md:pr-[14px]"
            >
                <MyMapIcon />

                <div className="min-w-0 flex-1">
                    <h2 className="!m-0 break-words !text-sm !font-bold !leading-[18px] !text-black">
                        {map.title}
                    </h2>
                    <p className="mt-1 text-xs font-normal leading-4 text-[var(--monomat-text-muted)]">
                        {songCount}
                        {MY_MAPS_PAGE_COPY.SONG_UNIT}
                    </p>
                </div>

                <DescriptionIcon
                    className="mt-1 shrink-0 text-[var(--monomat-text-muted)] md:mt-0"
                    size={18}
                    strokeWidth={2}
                    aria-hidden="true"
                />
            </button>

            <div className="flex items-center justify-between gap-2 md:min-h-[60px] md:justify-center md:bg-white">
                <span className="text-xs font-bold text-[var(--monomat-text-muted)] md:hidden">
                    {MY_MAPS_PAGE_COPY.CATEGORY}
                </span>
                <MyMapCategoryBadge category={map.category} />
            </div>

            <div className="flex items-center justify-between gap-2 md:min-h-[60px] md:justify-center md:bg-white">
                <span className="text-xs font-bold text-[var(--monomat-text-muted)] md:hidden">
                    {MY_MAPS_PAGE_COPY.STATUS}
                </span>
                <MyMapStatusBadge map={map} />
            </div>

            <div className="flex items-center justify-between gap-2 md:min-h-[60px] md:justify-center md:bg-white">
                <span className="text-xs font-bold text-[var(--monomat-text-muted)] md:hidden">
                    {MY_MAPS_PAGE_COPY.PLAY_COUNT}
                </span>
                <span className="text-sm font-medium text-black">
                    {playCount}
                </span>
            </div>

            <div className="flex items-center justify-between gap-2 md:min-h-[60px] md:justify-center md:bg-white">
                <span className="text-xs font-bold text-[var(--monomat-text-muted)] md:hidden">
                    {MY_MAPS_PAGE_COPY.ACTION}
                </span>
                <div className="flex items-center gap-[10px]">
                    <button
                        type="button"
                        className="flex h-[30px] w-[30px] items-center justify-center rounded-lg border border-[color:var(--monomat-border-input)] bg-white text-[#2B3F6C] transition hover:bg-[var(--monomat-page-bg)]"
                        aria-label={MY_MAPS_PAGE_COPY.EDIT_ARIA_LABEL}
                        title={MY_MAPS_PAGE_COPY.EDIT_ARIA_LABEL}
                    >
                        <Pencil size={17} strokeWidth={2} aria-hidden="true" />
                    </button>
                    <button
                        type="button"
                        className="flex h-[30px] w-[30px] items-center justify-center rounded-lg border border-[color:var(--monomat-border-input)] bg-white text-[#2B3F6C] transition hover:bg-[var(--monomat-page-bg)]"
                        aria-label={MY_MAPS_PAGE_COPY.DELETE_ARIA_LABEL}
                        title={MY_MAPS_PAGE_COPY.DELETE_ARIA_LABEL}
                    >
                        <Trash2 size={17} strokeWidth={2} aria-hidden="true" />
                    </button>
                </div>
            </div>

            {isDescriptionOpen && (
                <div className="min-w-0 whitespace-pre-wrap break-keep rounded-lg border border-[color:var(--monomat-border-input)] bg-[rgba(241,242,245,0.6)] px-4 py-3 text-xs font-medium leading-5 text-[var(--monomat-text-muted)] [overflow-wrap:anywhere] md:col-span-5 md:mx-[30px] md:mb-3 md:rounded-lg">
                    {description}
                </div>
            )}
        </article>
    );
}

function MyMapsTableHeader() {
    return (
        <div className="hidden h-[50px] grid-cols-[430px_110px_110px_110px_140px] items-center rounded-t-lg bg-[var(--monomat-page-bg)] text-center text-sm font-bold text-[var(--monomat-text-muted)] md:grid">
            <span>{MY_MAPS_PAGE_COPY.MAP_TITLE}</span>
            <span>{MY_MAPS_PAGE_COPY.CATEGORY}</span>
            <span>{MY_MAPS_PAGE_COPY.STATUS}</span>
            <span>{MY_MAPS_PAGE_COPY.PLAY_COUNT}</span>
            <span>{MY_MAPS_PAGE_COPY.ACTION}</span>
        </div>
    );
}

function MyMapRowSkeleton() {
    return (
        <div className="grid min-h-[112px] grid-cols-1 gap-3 border-t border-[color:var(--monomat-border-input)] bg-[#FEFEFF] px-4 py-4 md:min-h-[60px] md:grid-cols-[430px_110px_110px_110px_140px] md:items-stretch md:gap-0 md:px-0 md:py-0">
            <div className="flex items-center gap-3 md:min-h-[60px] md:bg-white md:pl-[30px] md:pr-[14px]">
                <div className="h-[38px] w-[38px] animate-pulse rounded-lg bg-[var(--monomat-primary-light)]" />
                <div className="min-w-0 flex-1">
                    <div className="h-4 w-48 max-w-full animate-pulse rounded bg-[var(--monomat-page-bg)]" />
                    <div className="mt-2 h-3 w-64 max-w-full animate-pulse rounded bg-[var(--monomat-page-bg)]" />
                </div>
            </div>
            <div className="hidden min-h-[60px] justify-center bg-white md:flex md:items-center">
                <div className="h-[22px] w-[54px] animate-pulse rounded-full bg-[var(--monomat-page-bg)]" />
            </div>
            <div className="hidden min-h-[60px] justify-center bg-white md:flex md:items-center">
                <div className="h-[22px] w-[72px] animate-pulse rounded-full bg-[var(--monomat-page-bg)]" />
            </div>
            <div className="hidden min-h-[60px] justify-center bg-white md:flex md:items-center">
                <div className="h-4 w-10 animate-pulse rounded bg-[var(--monomat-page-bg)]" />
            </div>
            <div className="hidden min-h-[60px] justify-center gap-[10px] bg-white md:flex md:items-center">
                <div className="h-[30px] w-[30px] animate-pulse rounded-lg bg-[var(--monomat-page-bg)]" />
                <div className="h-[30px] w-[30px] animate-pulse rounded-lg bg-[var(--monomat-page-bg)]" />
            </div>
        </div>
    );
}

function MyMapsErrorState({
    error,
    onRetry,
}: {
    error: unknown;
    onRetry: () => void;
}) {
    return (
        <div className="flex min-h-[240px] flex-col items-center justify-center bg-white px-6 text-center">
            <p className="text-base font-bold text-[var(--monomat-text-strong)]">
                {MY_MAPS_ERROR_COPY.TITLE}
            </p>
            <p className="mt-2 max-w-[480px] text-sm text-[var(--monomat-text-muted)]">
                {getErrorDescription(error)}
            </p>
            <button
                type="button"
                onClick={onRetry}
                className="mt-5 h-9 rounded-lg bg-[var(--monomat-primary)] px-5 text-sm font-bold text-white transition hover:bg-[var(--monomat-primary-hover)]"
            >
                {MY_MAPS_ERROR_COPY.RETRY}
            </button>
        </div>
    );
}

function MyMapsEmptyState({ isSearching }: { isSearching: boolean }) {
    const title = isSearching
        ? MY_MAPS_EMPTY_STATE_COPY.SEARCH_TITLE
        : MY_MAPS_EMPTY_STATE_COPY.TITLE;
    const description = isSearching
        ? MY_MAPS_EMPTY_STATE_COPY.SEARCH_DESCRIPTION
        : MY_MAPS_EMPTY_STATE_COPY.DESCRIPTION;

    return (
        <div className="flex min-h-[240px] flex-col items-center justify-center bg-white px-6 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#C9DBFF] text-[#2B3F6C]">
                <Music size={23} strokeWidth={2} aria-hidden="true" />
            </div>
            <p className="mt-4 text-base font-bold text-[var(--monomat-text-strong)]">
                {title}
            </p>
            <p className="mt-2 text-sm text-[var(--monomat-text-muted)]">
                {description}
            </p>
        </div>
    );
}

function MyMapsPagination({
    page,
    totalPages,
    hasNext,
    onPageChange,
}: {
    page: number;
    totalPages: number;
    hasNext: boolean;
    onPageChange: (page: number) => void;
}) {
    const safeTotalPages = Math.max(totalPages, 1);
    const pages = Array.from(
        { length: safeTotalPages },
        (_, index) => index,
    );
    const canGoPrevious = page > 0;
    const canGoNext = hasNext && page + 1 < safeTotalPages;

    return (
        <nav
            className="mt-6 flex flex-wrap items-center gap-2"
            aria-label="내 맵 목록 페이지"
        >
            <button
                type="button"
                onClick={() => onPageChange(page - 1)}
                disabled={!canGoPrevious}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[color:var(--monomat-border-default)] bg-white text-[13px] text-[var(--monomat-text-muted)] transition hover:bg-[var(--monomat-page-bg)] disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="이전 페이지"
            >
                <ChevronLeft size={16} strokeWidth={2} aria-hidden="true" />
            </button>

            {pages.map((knownPage) => {
                const isActive = knownPage === page;
                const pageLabel = knownPage + 1;

                return (
                    <button
                        key={knownPage}
                        type="button"
                        onClick={() => onPageChange(knownPage)}
                        aria-current={isActive ? 'page' : undefined}
                        aria-label={`${pageLabel}페이지`}
                        className={`flex h-9 w-9 items-center justify-center rounded-lg text-[13px] leading-none transition ${
                            isActive
                                ? 'bg-[var(--monomat-primary)] text-white'
                                : 'border border-[color:var(--monomat-border-default)] bg-white text-[var(--monomat-text-muted)] hover:bg-[var(--monomat-page-bg)]'
                        }`}
                    >
                        {pageLabel}
                    </button>
                );
            })}

            <button
                type="button"
                onClick={() => onPageChange(page + 1)}
                disabled={!canGoNext}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[color:var(--monomat-border-default)] bg-white text-[13px] text-[var(--monomat-text-muted)] transition hover:bg-[var(--monomat-page-bg)] disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="다음 페이지"
            >
                <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
            </button>
        </nav>
    );
}

export function MyMaps() {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(DEFAULT_MAP_LIST_PAGE);
    const [searchKeyword, setSearchKeyword] = useState('');
    const trimmedSearchKeyword = searchKeyword.trim();
    const isSearching = trimmedSearchKeyword.length > 0;

    const pagedMyMapsQuery = useMyMaps({
        page: currentPage,
        size: MY_MAP_LIST_PAGE_SIZE,
        enabled: !isSearching,
    });
    const searchedMyMapsQuery = useMyMaps({
        page: DEFAULT_MAP_LIST_PAGE,
        size: MY_MAP_SEARCH_PAGE_SIZE,
        enabled: isSearching,
    });

    const activeQuery = isSearching ? searchedMyMapsQuery : pagedMyMapsQuery;
    const rawMaps = activeQuery.data?.content ?? [];
    const maps = isSearching
        ? rawMaps.filter((map) => matchesMyMapSearch(map, trimmedSearchKeyword))
        : rawMaps;
    const page = activeQuery.data?.page ?? currentPage;
    const totalPages = activeQuery.data?.totalPages ?? 0;
    const hasNext = activeQuery.data?.hasNext ?? false;

    const handleSearchKeywordChange = (event: ChangeEvent<HTMLInputElement>) => {
        setSearchKeyword(event.target.value);
        setCurrentPage(DEFAULT_MAP_LIST_PAGE);
    };

    const handleCreateMapClick = () => {
        window.alert(MY_MAPS_PAGE_COPY.CREATE_MAP_PENDING);
    };

    return (
        <div className="flex min-h-screen flex-col bg-[var(--monomat-page-bg)] text-left">
            <NavigationBar />

            <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 pb-10 pt-6 sm:px-6 lg:px-8 xl:px-10 xl:pt-[30px]">
                <section className="mx-auto w-full max-w-[900px]">
                    <button
                        type="button"
                        onClick={() => navigate(LOBBY_ROUTES.LIST)}
                        className="text-sm font-semibold leading-5 text-[var(--monomat-text-muted)] transition hover:text-[var(--monomat-text-strong)]"
                    >
                        {MY_MAPS_PAGE_COPY.BACK_TO_LOBBIES}
                    </button>

                    <div className="mt-[18px]">
                        <div className="min-w-0">
                            <h1 className="!m-0 !text-[36px] !font-extrabold !leading-[43px] !text-[var(--monomat-text-strong)]">
                                {MY_MAPS_PAGE_COPY.TITLE}
                            </h1>
                            <p className="mt-2 text-sm font-medium leading-5 text-[var(--monomat-text-muted)]">
                                {MY_MAPS_PAGE_COPY.DESCRIPTION}
                            </p>
                        </div>
                    </div>

                    <div className="mt-[22px] flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
                        <label
                            className="flex h-11 min-w-0 flex-1 items-center rounded-lg border border-[color:var(--monomat-border-input)] bg-white px-[14px] text-sm text-[var(--monomat-border-input)] focus-within:border-[var(--monomat-primary)]"
                        >
                            <Search
                                className="mr-[14px] shrink-0 text-[#2B3F6C]"
                                size={22}
                                strokeWidth={1.8}
                                aria-hidden="true"
                            />
                            <input
                                type="search"
                                value={searchKeyword}
                                onChange={handleSearchKeywordChange}
                                placeholder={MY_MAPS_PAGE_COPY.SEARCH_PLACEHOLDER}
                                className="min-w-0 flex-1 bg-transparent text-sm text-[var(--monomat-text-strong)] outline-none placeholder:text-[var(--monomat-border-input)]"
                            />
                        </label>
                        <button
                            type="button"
                            onClick={handleCreateMapClick}
                            data-create-map-route={MAP_ROUTES.CREATE_MAP}
                            className="h-11 w-full shrink-0 whitespace-nowrap rounded-lg bg-[var(--monomat-primary)] px-0 text-base font-bold leading-none text-white transition hover:bg-[var(--monomat-primary-hover)] sm:w-[130px]"
                        >
                            {MY_MAPS_PAGE_COPY.CREATE_MAP}
                        </button>
                    </div>

                    <div className="mt-[22px] overflow-hidden rounded-lg border border-[color:var(--monomat-border-input)] bg-white">
                        <MyMapsTableHeader />

                        {activeQuery.isLoading && (
                            <>
                                {Array.from({ length: 4 }).map((_, index) => (
                                    <MyMapRowSkeleton key={index} />
                                ))}
                            </>
                        )}

                        {!activeQuery.isLoading && activeQuery.isError && (
                            <MyMapsErrorState
                                error={activeQuery.error}
                                onRetry={() => void activeQuery.refetch()}
                            />
                        )}

                        {!activeQuery.isLoading &&
                            !activeQuery.isError &&
                            maps.length === 0 && (
                            <MyMapsEmptyState isSearching={isSearching} />
                        )}

                        {!activeQuery.isLoading &&
                            !activeQuery.isError &&
                            maps.length > 0 && (
                            <>
                                {maps.map((map) => (
                                    <MyMapRow key={map.mapId} map={map} />
                                ))}
                            </>
                        )}
                    </div>

                    {!isSearching &&
                        !activeQuery.isLoading &&
                        !activeQuery.isError &&
                        maps.length > 0 && (
                        <MyMapsPagination
                            page={page}
                            totalPages={totalPages}
                            hasNext={hasNext}
                            onPageChange={setCurrentPage}
                        />
                    )}
                </section>
            </main>

            <LobbyFooter />
        </div>
    );
}
