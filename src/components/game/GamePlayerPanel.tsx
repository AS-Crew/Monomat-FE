import { Music2 } from 'lucide-react';

import { GAME_COPY } from '../../constants/game';

interface GamePlayerPanelProps {
    currentRound: number | null;
}

export function GamePlayerPanel({
    currentRound,
}: GamePlayerPanelProps) {
    return (
        <section className="flex h-[440px] flex-col items-center overflow-hidden rounded-2xl bg-white px-6 text-center shadow-[0_4px_16px_rgba(0,0,0,0.18)]">
            <div
                role="img"
                aria-label={GAME_COPY.PLAYER_PLACEHOLDER_ARIA_LABEL}
                className="mt-[57px] flex h-[200px] w-[200px] shrink-0 items-center justify-center rounded-full bg-[var(--monomat-primary)]"
            >
                <Music2
                    size={52}
                    strokeWidth={2.2}
                    className="text-white"
                    aria-hidden="true"
                />
            </div>

            <p className="mt-[58px] text-[15px] font-bold leading-[17px] text-[var(--monomat-text-muted)]">
                {GAME_COPY.NOW_PLAYING}
            </p>
            <h1 className="!m-0 mt-5 !text-xl !font-bold !leading-6 !text-[var(--monomat-text-strong)]">
                {GAME_COPY.PLAYER_GUIDE}
            </h1>
            <p className="mt-5 text-sm leading-[17px] text-[var(--monomat-text-muted)] tabular-nums">
                {currentRound == null
                    ? GAME_COPY.ROUND_WAITING
                    : `${currentRound}번째 문제`}
            </p>
        </section>
    );
}
