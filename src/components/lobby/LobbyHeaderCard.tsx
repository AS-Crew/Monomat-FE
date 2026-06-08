import { LOBBY_ROOM_COPY } from '../../constants/lobby';

interface LobbyHeaderCardProps {
    title: string;
    mapTitle: string | null;
    mapCategory: string | null;
    questionCount: number;
    canChangeMap?: boolean;
    isMapChangePending?: boolean;
    onMapChangeClick?: () => void;
}

export function LobbyHeaderCard({
    title,
    mapTitle,
    mapCategory,
    questionCount,
    canChangeMap = false,
    isMapChangePending = false,
    onMapChangeClick,
}: LobbyHeaderCardProps) {
    const hasSelectedMap = Boolean(mapTitle?.trim());
    const mapSummary = hasSelectedMap
        ? `${mapTitle}${mapCategory ? ` | ${mapCategory}` : ''} | ${questionCount}곡`
        : LOBBY_ROOM_COPY.MAP_EMPTY_DESCRIPTION;

    return (
        <section className="flex min-h-[107px] min-w-0 flex-col justify-center rounded-2xl bg-white px-[25px] py-5 text-left shadow-[0_4px_16px_rgba(0,0,0,0.16)]">
            <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                    <h1 className="!m-0 truncate !text-[28px] !font-extrabold !leading-[43px] !text-[var(--monomat-text-strong)]">
                        {title}
                    </h1>
                    <p className="mt-[9px] truncate text-base font-medium leading-none text-[var(--monomat-text-muted)]">
                        {mapSummary}
                    </p>
                </div>

                {canChangeMap && (
                    <button
                        type="button"
                        onClick={onMapChangeClick}
                        disabled={isMapChangePending}
                        className="h-[43px] w-[90px] shrink-0 rounded-lg border border-[var(--monomat-border-input)] bg-white text-[15px] font-bold text-black transition hover:bg-[var(--monomat-page-bg)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isMapChangePending ? '변경 중' : '맵 변경'}
                    </button>
                )}
            </div>
        </section>
    );
}
