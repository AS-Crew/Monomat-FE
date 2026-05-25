import {
    LOBBY_CARD_LABELS,
    LOBBY_STATUS_META,
} from '../../constants/lobby';
import type { LobbyCategory, LobbyListItem } from '../../types/lobby';

interface LobbyCardProps {
    lobby: LobbyListItem;
    onEnter: (code: string) => void;
}

function StatusBadge({ status }: { status: LobbyListItem['status'] }) {
    const meta =
        status === 'WAITING'
            ? LOBBY_STATUS_META.WAITING
            : status === 'PLAYING'
                ? LOBBY_STATUS_META.PLAYING
                : LOBBY_STATUS_META.UNKNOWN;

    return (
        <span
            className={`inline-flex h-[22px] w-[60px] items-center justify-center rounded-full text-[11px] font-semibold leading-none ${meta.badgeClassName}`}
        >
            ● {meta.label}
        </span>
    );
}

function CategoryBadge({
                           category,
                       }: {
    category: LobbyCategory | null | undefined;
}) {
    if (!category) {
        return null;
    }

    return (
        <span className="inline-flex h-[22px] min-w-[47px] items-center justify-center rounded-full bg-[var(--monomat-primary-light)] px-2 text-[11px] font-semibold leading-none text-[var(--monomat-primary)]">
            {category}
        </span>
    );
}

function ProgressBar({
    current,
    max,
    status,
}: {
    current: number;
    max: number;
    status: LobbyListItem['status'];
}) {
    const safeMax = Math.max(max, 1);
    const percent = Math.min(Math.round((current / safeMax) * 100), 100);
    const isFull = current >= max;

    const progressClassName = isFull
        ? LOBBY_STATUS_META.UNKNOWN.progressClassName
        : status === 'PLAYING'
            ? LOBBY_STATUS_META.PLAYING.progressClassName
            : LOBBY_STATUS_META.WAITING.progressClassName;

    return (
        <div className="h-[5px] w-[397px] rounded-full bg-[var(--monomat-page-bg)]">
            <div
                className={`h-[5px] rounded-full ${progressClassName}`}
                style={{ width: `${percent}%` }}
            />
        </div>
    );
}

export function LobbyCard({ lobby, onEnter }: LobbyCardProps) {
    const { code, hostId, title, status, maxPlayers, mapCategory } = lobby;

    const { currentPlayers } = lobby;
    const isFull = currentPlayers >= maxPlayers;
    const isEnterDisabled = isFull || status === 'PLAYING';

    return (
        <article className="relative h-[168px] overflow-hidden rounded-xl bg-white text-left shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
            <div className="absolute left-[14px] top-[14px] flex h-[22px] items-center gap-1.5">
                <StatusBadge status={status} />
                <CategoryBadge category={mapCategory} />
            </div>

            <p className="absolute left-[14px] top-[70px] h-[14px] w-[328px] truncate text-sm font-bold leading-none text-[var(--monomat-text-strong)]">
                {title}
            </p>

            <p className="absolute left-[14px] top-[96px] max-w-[220px] truncate text-[13px] font-medium leading-4 text-[var(--monomat-text-muted)]">
                👤 {hostId}
            </p>

            <p className="absolute right-5 top-[101px] text-xs font-medium leading-[14px] text-[var(--monomat-text-muted)]">
                {currentPlayers}/{maxPlayers}
                {LOBBY_CARD_LABELS.PLAYER_UNIT}
            </p>

            <div className="absolute left-[14px] top-[118px]">
                <ProgressBar
                    current={currentPlayers}
                    max={maxPlayers}
                    status={status}
                />
            </div>

            <span className="absolute left-[316px] top-[135px] text-sm leading-[17px] text-[#CCD1D9]">
                ⚑
            </span>

            <button
                type="button"
                onClick={() => onEnter(code)}
                disabled={isEnterDisabled}
                className={`absolute left-[335px] top-[130px] h-7 w-[76px] rounded-lg text-xs font-bold leading-none text-white transition ${
                    isEnterDisabled
                        ? 'cursor-not-allowed bg-[var(--monomat-border-input)]'
                        : 'bg-[var(--monomat-primary)] hover:bg-[var(--monomat-primary-hover)]'
                }`}
            >
                {isEnterDisabled
                    ? LOBBY_CARD_LABELS.ENTER_UNAVAILABLE
                    : LOBBY_CARD_LABELS.ENTER}
            </button>
        </article>
    );
}
