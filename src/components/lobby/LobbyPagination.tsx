import { ChevronLeft, ChevronRight } from 'lucide-react';

import { LOBBY_PAGINATION_LABELS } from '../../constants/lobby';

interface LobbyPaginationProps {
    page: number;
    hasNext: boolean;
    onPageChange: (page: number) => void;
}

function createKnownPages(page: number, hasNext: boolean) {
    const lastKnownPage = hasNext ? page + 1 : page;

    return Array.from({ length: lastKnownPage + 1 }, (_, index) => index);
}

export function LobbyPagination({
    page,
    hasNext,
    onPageChange,
}: LobbyPaginationProps) {
    const pages = createKnownPages(page, hasNext);
    const canGoPrevious = page > 0;

    return (
        <nav
            className="mt-[30px] flex flex-wrap items-center gap-2"
            aria-label="로비 목록 페이지"
        >
            <button
                type="button"
                onClick={() => onPageChange(page - 1)}
                disabled={!canGoPrevious}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[color:var(--monomat-border-default)] bg-white text-[13px] text-[var(--monomat-text-muted)] transition hover:bg-[var(--monomat-page-bg)] disabled:cursor-not-allowed disabled:opacity-50"
                aria-label={LOBBY_PAGINATION_LABELS.PREVIOUS}
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
                        aria-label={LOBBY_PAGINATION_LABELS.PAGE(pageLabel)}
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
                disabled={!hasNext}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[color:var(--monomat-border-default)] bg-white text-[13px] text-[var(--monomat-text-muted)] transition hover:bg-[var(--monomat-page-bg)] disabled:cursor-not-allowed disabled:opacity-50"
                aria-label={LOBBY_PAGINATION_LABELS.NEXT}
            >
                <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
            </button>
        </nav>
    );
}
