import { Music } from 'lucide-react';

import { LOBBY_ROOM_COPY } from '../../constants/lobby';

interface LobbyMapInfoCardProps {
    mapTitle: string | null;
    mapCategory: string | null;
    questionCount: number;
    timeLimitSeconds: number;
    maxPlayers: number;
}

function SettingMetric({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-lg border border-[color:var(--monomat-border-default)] bg-[var(--monomat-page-bg)] px-4 py-3">
            <dt className="text-xs font-semibold leading-none text-[var(--monomat-text-muted)]">
                {label}
            </dt>
            <dd className="mt-2 text-base font-extrabold leading-none text-[var(--monomat-text-strong)]">
                {value}
            </dd>
        </div>
    );
}

export function LobbyMapInfoCard({
    mapTitle,
    mapCategory,
    questionCount,
    timeLimitSeconds,
    maxPlayers,
}: LobbyMapInfoCardProps) {
    const hasSelectedMap = Boolean(mapTitle);

    return (
        <section className="rounded-lg bg-white p-5 text-left shadow-[0_4px_16px_rgba(0,0,0,0.08)] ring-1 ring-[color:var(--monomat-border-card)] lg:p-[25px]">
            <h2 className="!m-0 !text-xl !font-extrabold !leading-6 !text-[var(--monomat-text-strong)]">
                {LOBBY_ROOM_COPY.MAP_CARD_TITLE}
            </h2>

            <div className="mt-4 flex min-h-[76px] min-w-0 items-center rounded-lg border border-[color:var(--monomat-border-default)] bg-[var(--monomat-page-bg)] px-4 py-3">
                <span className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-lg bg-[var(--monomat-primary-light)] text-[var(--monomat-primary)]">
                    <Music size={22} strokeWidth={2.2} aria-hidden="true" />
                </span>

                <div className="ml-3 min-w-0">
                    <p className="truncate text-base font-extrabold leading-5 text-[var(--monomat-text-strong)]">
                        {mapTitle ?? LOBBY_ROOM_COPY.MAP_EMPTY_TITLE}
                    </p>
                    <p className="mt-1 truncate text-xs font-medium leading-4 text-[var(--monomat-text-muted)]">
                        {hasSelectedMap
                            ? (mapCategory ??
                                LOBBY_ROOM_COPY.MAP_CATEGORY_EMPTY)
                            : LOBBY_ROOM_COPY.MAP_EMPTY_DESCRIPTION}
                    </p>
                </div>
            </div>

            <h3 className="mt-5 text-base font-extrabold leading-5 text-[var(--monomat-text-strong)]">
                {LOBBY_ROOM_COPY.GAME_SETTING_TITLE}
            </h3>

            <dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <SettingMetric
                    label={LOBBY_ROOM_COPY.MAX_PLAYERS}
                    value={`${maxPlayers}명`}
                />
                <SettingMetric
                    label={LOBBY_ROOM_COPY.QUESTION_COUNT}
                    value={`${questionCount}라운드`}
                />
                <SettingMetric
                    label={LOBBY_ROOM_COPY.TIME_LIMIT}
                    value={`${timeLimitSeconds}초`}
                />
            </dl>
        </section>
    );
}
