import { LOBBY_ROOM_COPY } from '../../constants/lobby';
import { getAvatarColor } from '../../utils/avatarColor';

import type { LobbyPlayerResponse } from '../../types/lobby';

interface LobbyPlayersCardProps {
    players: LobbyPlayerResponse[];
    currentPlayers: number;
    maxPlayers: number;
    currentUserIdentifier: string | null;
}

function maskUserIdentifier(userIdentifier: string) {
    if (userIdentifier.length <= 10) {
        return userIdentifier;
    }

    return `${userIdentifier.slice(0, 4)}...${userIdentifier.slice(-4)}`;
}

function getPlayerDisplayName(player: LobbyPlayerResponse) {
    const nickname = player.nickname?.trim();

    if (nickname) {
        return nickname;
    }

    return maskUserIdentifier(player.userIdentifier);
}

function getAvatarLabel(displayName: string) {
    return displayName.trim().charAt(0).toUpperCase() || '?';
}

function PlayerReadyBadge({ player }: { player: LobbyPlayerResponse }) {
    if (player.host) {
        return (
            <span className="inline-flex h-[18px] items-center gap-1 text-[10px] font-semibold leading-none text-[var(--monomat-primary)]">
                <span className="h-2 w-2 rounded-full bg-[var(--monomat-primary)]" />
                {LOBBY_ROOM_COPY.HOST_BADGE}
            </span>
        );
    }

    return (
        <span
            className={`inline-flex h-[18px] items-center gap-1 text-[10px] font-semibold leading-none ${
                player.ready
                    ? 'text-emerald-600'
                    : 'text-[var(--monomat-text-muted)]'
            }`}
        >
            <span
                className={`h-2 w-2 rounded-full ${
                    player.ready
                        ? 'bg-emerald-500'
                        : 'bg-[var(--monomat-border-input)]'
                }`}
            />
            {player.ready ? LOBBY_ROOM_COPY.READY : LOBBY_ROOM_COPY.WAITING}
        </span>
    );
}

function PlayerSlot({
    player,
    currentUserIdentifier,
}: {
    player: LobbyPlayerResponse;
    currentUserIdentifier: string | null;
}) {
    const displayName = getPlayerDisplayName(player);
    const avatarColor = getAvatarColor(player.userIdentifier);

    return (
        <li className="flex min-h-[110px] min-w-0 flex-col items-center justify-center rounded-lg border border-[color:var(--monomat-border-default)] bg-white px-3 py-4 text-center">
            <span
                className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full text-base font-extrabold leading-none text-white"
                style={{ backgroundColor: avatarColor }}
            >
                {getAvatarLabel(displayName)}
            </span>

            <p className="mt-3 w-full truncate text-sm font-extrabold leading-4 text-[var(--monomat-text-strong)]">
                {displayName}
            </p>

            <div className="mt-2 flex h-[18px] items-center justify-center gap-2">
                {player.userIdentifier === currentUserIdentifier && (
                    <span className="inline-flex h-[18px] items-center rounded-full bg-[var(--monomat-page-bg)] px-2 text-[10px] font-semibold leading-none text-[var(--monomat-text-muted)]">
                        {LOBBY_ROOM_COPY.ME}
                    </span>
                )}
                <PlayerReadyBadge player={player} />
            </div>
        </li>
    );
}

function EmptySlot() {
    return (
        <li className="flex min-h-[110px] flex-col items-center justify-center rounded-lg border border-dashed border-[color:var(--monomat-border-input)] bg-[var(--monomat-page-bg)] px-3 py-4 text-center">
            <span className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full border border-[color:var(--monomat-border-input)] bg-white" />
            <p className="mt-3 text-sm font-semibold leading-4 text-[var(--monomat-text-muted)]">
                {LOBBY_ROOM_COPY.EMPTY_SLOT}
            </p>
        </li>
    );
}

export function LobbyPlayersCard({
    players,
    currentPlayers,
    maxPlayers,
    currentUserIdentifier,
}: LobbyPlayersCardProps) {
    const emptySlotCount = Math.max(maxPlayers - players.length, 0);

    return (
        <section className="rounded-lg bg-white p-5 text-left shadow-[0_4px_16px_rgba(0,0,0,0.08)] ring-1 ring-[color:var(--monomat-border-card)] lg:p-[25px]">
            <div className="flex items-center justify-between gap-4">
                <h2 className="!m-0 !text-xl !font-extrabold !leading-6 !text-[var(--monomat-text-strong)]">
                    {LOBBY_ROOM_COPY.PLAYERS_TITLE}
                </h2>
                <span className="shrink-0 text-sm font-semibold leading-none text-[var(--monomat-text-muted)]">
                    {currentPlayers}/{maxPlayers}
                </span>
            </div>

            {players.length > 0 ? (
                <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                    {players.map((player) => (
                        <PlayerSlot
                            key={player.userIdentifier}
                            player={player}
                            currentUserIdentifier={currentUserIdentifier}
                        />
                    ))}
                    {Array.from({ length: emptySlotCount }).map((_, index) => (
                        <EmptySlot key={`empty-${index}`} />
                    ))}
                </ul>
            ) : (
                <div className="mt-4 flex min-h-[230px] items-center justify-center rounded-lg border border-dashed border-[color:var(--monomat-border-input)] bg-[var(--monomat-page-bg)] px-4 text-center text-sm font-semibold text-[var(--monomat-text-muted)]">
                    {LOBBY_ROOM_COPY.PLAYERS_EMPTY}
                </div>
            )}
        </section>
    );
}
