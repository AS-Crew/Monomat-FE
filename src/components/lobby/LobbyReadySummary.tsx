import { LOBBY_ROOM_COPY } from '../../constants/lobby';

interface LobbyReadySummaryProps {
    totalPlayerCount: number;
    readyTargetCount: number;
    readyCount: number;
    waitingCount: number;
}

function SummaryMetric({
    label,
    value,
    tone = 'default',
}: {
    label: string;
    value: number;
    tone?: 'default' | 'ready' | 'waiting';
}) {
    const valueClassName = {
        default: 'text-[var(--monomat-text-strong)]',
        ready: 'text-emerald-600',
        waiting: 'text-amber-600',
    }[tone];

    return (
        <div className="min-w-0 rounded-lg border border-[color:var(--monomat-border-default)] bg-[var(--monomat-page-bg)] px-3 py-3">
            <dt className="truncate text-[11px] font-semibold leading-none text-[var(--monomat-text-muted)]">
                {label}
            </dt>
            <dd className={`mt-2 text-xl font-extrabold leading-none ${valueClassName}`}>
                {value}
            </dd>
        </div>
    );
}

export function LobbyReadySummary({
    totalPlayerCount,
    readyTargetCount,
    readyCount,
    waitingCount,
}: LobbyReadySummaryProps) {
    return (
        <section aria-labelledby="lobby-ready-summary-title">
            <div className="flex items-center justify-between gap-3">
                <h3
                    id="lobby-ready-summary-title"
                    className="!m-0 !text-base !font-extrabold !leading-5 !text-[var(--monomat-text-strong)]"
                >
                    {LOBBY_ROOM_COPY.READY_SUMMARY_TITLE}
                </h3>
                <span className="shrink-0 rounded-full bg-[var(--monomat-primary-light)] px-3 py-1 text-[11px] font-bold leading-none text-[var(--monomat-primary)]">
                    {readyCount}/{readyTargetCount}
                </span>
            </div>

            <dl className="mt-3 grid grid-cols-2 gap-3">
                <SummaryMetric
                    label={LOBBY_ROOM_COPY.READY_SUMMARY_TOTAL}
                    value={totalPlayerCount}
                />
                <SummaryMetric
                    label={LOBBY_ROOM_COPY.READY_SUMMARY_TARGET}
                    value={readyTargetCount}
                />
                <SummaryMetric
                    label={LOBBY_ROOM_COPY.READY_SUMMARY_READY}
                    value={readyCount}
                    tone="ready"
                />
                <SummaryMetric
                    label={LOBBY_ROOM_COPY.READY_SUMMARY_WAITING}
                    value={waitingCount}
                    tone="waiting"
                />
            </dl>

            {readyTargetCount === 0 && (
                <p className="mt-3 break-keep rounded-lg bg-[var(--monomat-page-bg)] px-3 py-2 text-xs font-semibold leading-5 text-[var(--monomat-text-muted)]">
                    {LOBBY_ROOM_COPY.READY_SUMMARY_EMPTY}
                </p>
            )}
        </section>
    );
}
