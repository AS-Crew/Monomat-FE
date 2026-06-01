import type { LobbyListItem } from '../../types/lobby';
import { LOBBY_LIST_ERROR_COPY } from '../../constants/lobby';
import { LobbyCard } from './LobbyCard';
import { LobbyEmptyState } from './LobbyEmptyState';
import { LobbyPagination } from './LobbyPagination';

interface LobbyListProps {
    lobbies: LobbyListItem[];
    isLoading?: boolean;
    isError?: boolean;
    page: number;
    hasNext: boolean;
    onRetry?: () => void;
    onEnter: (code: string) => void;
    onPageChange: (page: number) => void;
}

function LobbyCardSkeleton() {
    return (
        <div className="min-h-[170px] rounded-xl bg-white p-[15px] shadow-[0_4px_16px_rgba(0,0,0,0.10)]">
            <div className="flex gap-1.5">
                <div className="h-[22px] w-[60px] animate-pulse rounded-full bg-[var(--monomat-page-bg)]" />
                <div className="h-[22px] w-[47px] animate-pulse rounded-full bg-[var(--monomat-page-bg)]" />
            </div>
            <div className="mt-[34px] h-4 w-56 animate-pulse rounded bg-[var(--monomat-page-bg)]" />
            <div className="mt-5 flex items-center justify-between">
                <div className="h-3 w-20 animate-pulse rounded bg-[var(--monomat-page-bg)]" />
                <div className="h-3 w-10 animate-pulse rounded bg-[var(--monomat-page-bg)]" />
            </div>
            <div className="mt-3 h-[5px] animate-pulse rounded-full bg-[var(--monomat-page-bg)]" />
            <div className="ml-auto mt-3 h-7 w-[76px] animate-pulse rounded-lg bg-[var(--monomat-page-bg)]" />
        </div>
    );
}

function LobbyErrorState({ onRetry }: { onRetry?: () => void }) {
    return (
        <div className="flex min-h-[354px] flex-col items-center justify-center rounded-xl border border-[color:var(--monomat-border-default)] bg-white px-6 text-center shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
            <p className="text-base font-bold text-[var(--monomat-text-strong)]">
                {LOBBY_LIST_ERROR_COPY.TITLE}
            </p>
            <p className="mt-2 text-sm text-[var(--monomat-text-muted)]">
                {LOBBY_LIST_ERROR_COPY.DESCRIPTION}
            </p>
            {onRetry && (
                <button
                    type="button"
                    onClick={onRetry}
                    className="mt-5 h-9 rounded-lg bg-[var(--monomat-primary)] px-5 text-sm font-bold text-white transition hover:bg-[var(--monomat-primary-hover)]"
                >
                    {LOBBY_LIST_ERROR_COPY.RETRY}
                </button>
            )}
        </div>
    );
}

export function LobbyList({
    lobbies,
    isLoading = false,
    isError = false,
    page,
    hasNext,
    onRetry,
    onEnter,
    onPageChange,
}: LobbyListProps) {
    if (isLoading) {
        return (
            <>
                <div className="grid grid-cols-1 gap-[18px] lg:grid-cols-2">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <LobbyCardSkeleton key={index} />
                    ))}
                </div>
                <LobbyPagination
                    page={page}
                    hasNext={false}
                    onPageChange={onPageChange}
                />
            </>
        );
    }

    if (isError) {
        return <LobbyErrorState onRetry={onRetry} />;
    }

    if (lobbies.length === 0) {
        return (
            <>
                <LobbyEmptyState />
                <LobbyPagination
                    page={page}
                    hasNext={hasNext}
                    onPageChange={onPageChange}
                />
            </>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 gap-[18px] lg:grid-cols-2">
                {lobbies.map((lobby) => (
                    <LobbyCard
                        key={lobby.code}
                        lobby={lobby}
                        onEnter={onEnter}
                    />
                ))}
            </div>
            <LobbyPagination
                page={page}
                hasNext={hasNext}
                onPageChange={onPageChange}
            />
        </>
    );
}
