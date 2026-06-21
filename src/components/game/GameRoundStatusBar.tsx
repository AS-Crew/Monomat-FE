import { GAME_COPY } from '../../constants/game';

interface GameRoundStatusBarProps {
    remainingSeconds: number | null;
    progressPercent: number | null;
}

export function GameRoundStatusBar({
    remainingSeconds,
    progressPercent,
}: GameRoundStatusBarProps) {
    const normalizedProgress =
        progressPercent == null
            ? 0
            : Math.min(Math.max(progressPercent, 0), 100);

    return (
        <section className="h-20 rounded-2xl bg-white px-[27px] pt-[19px] shadow-[0_4px_16px_rgba(0,0,0,0.18)]">
            <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[var(--monomat-text-muted)]">
                    {GAME_COPY.REMAINING_TIME}
                </span>
                <span className="text-base font-bold leading-none text-[var(--monomat-primary)] tabular-nums">
                    {remainingSeconds == null
                        ? GAME_COPY.ROUND_WAITING
                        : `${remainingSeconds}s`}
                </span>
            </div>

            <div className="mt-[9px] h-2 overflow-hidden rounded-full bg-[#F1F2F5]">
                <div
                    className="h-full rounded-full bg-[var(--monomat-primary)] transition-[width] duration-300 ease-linear"
                    style={{ width: `${normalizedProgress}%` }}
                />
            </div>
        </section>
    );
}
