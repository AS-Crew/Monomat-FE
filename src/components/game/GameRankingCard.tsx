import { GAME_COPY } from '../../constants/game';

import type { GameRankingEntry } from '../../types/game';

interface GameRankingCardProps {
    entries: readonly GameRankingEntry[];
}

export function GameRankingCard({ entries }: GameRankingCardProps) {
    return (
        <section className="h-[440px] overflow-hidden rounded-2xl bg-white px-[13px] py-[18px] text-left">
            <h2 className="!m-0 !text-base !font-bold !leading-[23px] !text-[var(--monomat-text-strong)]">
                {GAME_COPY.RANKING_TITLE}
            </h2>

            {entries.length === 0 ? (
                <p className="mt-8 text-center text-sm font-medium text-[var(--monomat-text-muted)]">
                    {GAME_COPY.RANKING_EMPTY}
                </p>
            ) : (
                <ol className="mt-2 space-y-[7px]">
                    {entries.map((entry) => (
                        <li
                            key={`${entry.rank}-${entry.nickname}`}
                            className={`grid h-[40px] grid-cols-[20px_minmax(0,1fr)_48px] items-center gap-[3px] rounded-xl px-[7px] ${
                                entry.isCurrentUser
                                    ? 'bg-[#EBEDFF]'
                                    : 'bg-[#F1F2F5]'
                            }`}
                        >
                            <span
                                className={`text-center text-xs font-semibold ${
                                    entry.isCurrentUser
                                        ? 'text-[#FF9400]'
                                        : 'text-[#7B808D]'
                                }`}
                            >
                                {entry.rank}
                            </span>
                            <span
                                className={`truncate text-base font-semibold ${
                                    entry.isCurrentUser
                                        ? 'text-[#5542BC]'
                                        : 'text-[#303540]'
                                }`}
                            >
                                {entry.nickname}
                            </span>
                            <span
                                className={`text-right text-sm font-semibold tabular-nums ${
                                    entry.isCurrentUser
                                        ? 'text-[#4D38B7]'
                                        : 'text-black'
                                }`}
                            >
                                {entry.score}
                            </span>
                        </li>
                    ))}
                </ol>
            )}
        </section>
    );
}
