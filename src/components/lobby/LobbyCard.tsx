import {
    LOBBY_CARD_LABELS,
    LOBBY_STATUS_META,
} from '../../constants/lobby';
import type { LobbyCategory, LobbyListItem } from '../../types/lobby';
import { Flag, UserRound } from 'lucide-react';

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
        <span className={`inline-flex h-[22px] w-[60px] shrink-0 items-center justify-center rounded-full text-[11px] font-semibold leading-none ${meta.badgeClassName}`}>
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
        <span className="inline-flex h-[22px] min-w-[50px] shrink-0 items-center justify-center rounded-full bg-[var(--monomat-primary-light)] px-2 text-[11px] font-semibold leading-none text-[var(--monomat-primary)]">
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
        <div className="h-[5px] w-full rounded-full bg-[var(--monomat-page-bg)]">
            <div
                className={`h-[5px] rounded-full ${progressClassName}`}
                style={{ width: `${percent}%` }}
            />
        </div>
    );
}

export function LobbyCard({ lobby, onEnter }: LobbyCardProps) {
    const { code, title, status, maxPlayers, mapCategory } = lobby;

    const { currentPlayers } = lobby;
    const isFull = currentPlayers >= maxPlayers;
    const isEnterDisabled = isFull || status === 'PLAYING';

    return (
        <article className="flex min-h-[170px] min-w-0 flex-col rounded-xl bg-white p-[15px] text-left shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
            <div className="flex min-w-0 items-center gap-1.5">
                <StatusBadge status={status} />
                <CategoryBadge category={mapCategory} />
            </div>

            <div className="mt-[34px] min-w-0">
                <p className="truncate text-base font-extrabold leading-[19px] text-black">
                    {title}
                </p>
            </div>

            <div className="mt-1.5 flex min-w-0 items-center justify-between gap-3">
                <p className="flex min-w-0 items-center gap-1 truncate text-xs font-medium leading-[14px] text-[var(--monomat-text-muted)]">
                    <UserRound size={13} strokeWidth={2} aria-hidden="true" />
                    <span className="min-w-0 truncate">
                        {LOBBY_CARD_LABELS.UNKNOWN_HOST}
                    </span>
                </p>

                <p className="shrink-0 text-[10px] font-medium leading-[14px] text-[var(--monomat-text-muted)]">
                    {currentPlayers}/{maxPlayers}
                    {LOBBY_CARD_LABELS.PLAYER_UNIT}
                </p>
            </div>

            <div className="mt-2">
                <ProgressBar
                    current={currentPlayers}
                    max={maxPlayers}
                    status={status}
                />
            </div>

            <div className="mt-auto flex items-center justify-end gap-3 pt-3">
                <Flag
                    className="text-[#CCD1D9]"
                    size={14}
                    strokeWidth={2}
                    aria-hidden="true"
                />

                <button
                    type="button"
                    onClick={() => onEnter(code)}
                    disabled={isEnterDisabled}
                    className={`h-7 w-[76px] shrink-0 rounded-lg text-xs font-bold leading-none text-white transition ${
                        isEnterDisabled
                            ? 'cursor-not-allowed bg-[var(--monomat-border-input)]'
                            : 'bg-[var(--monomat-primary)] hover:bg-[var(--monomat-primary-hover)]'
                    }`}
                >
                    {isEnterDisabled
                        ? LOBBY_CARD_LABELS.ENTER_UNAVAILABLE
                        : LOBBY_CARD_LABELS.ENTER}
                </button>
            </div>
        </article>
    );
}
