import { LOBBY_ROOM_COPY } from '../../constants/lobby';

interface LobbyReadySummaryProps {
    totalPlayerCount: number;
    readyTargetCount: number;
    readyCount: number;
    waitingCount: number;
    variant?: 'default' | 'compact' | 'inline';
}

function SummaryMetric({
    label,
    value,
    tone = 'default',
    variant = 'default',
}: {
    label: string;
    value: number;
    tone?: 'default' | 'ready' | 'waiting';
    variant?: 'default' | 'compact' | 'inline';
}) {
    const valueClassName = {
        default: 'text-[var(--monomat-text-strong)]',
        ready: 'text-emerald-600',
        waiting: 'text-amber-600',
    }[tone];

    if (variant === 'inline') {
        return (
            <div className="inline-flex h-7 min-w-0 items-center gap-1.5 rounded-full border border-[color:var(--monomat-border-default)] bg-white px-2.5">
                <dt className="text-[11px] font-semibold leading-none text-[var(--monomat-text-muted)]">
                    {label}
                </dt>
                <dd className={`text-xs font-extrabold leading-none ${valueClassName}`}>
                    {value}
                </dd>
            </div>
        );
    }

    const metricClassName =
        variant === 'compact'
            ? 'min-w-0 rounded-lg border border-[color:var(--monomat-border-default)] bg-white px-3 py-2'
            : 'min-w-0 rounded-lg border border-[color:var(--monomat-border-default)] bg-[var(--monomat-page-bg)] px-3 py-3';
    const valueTextClassName =
        variant === 'compact'
            ? 'mt-1 text-lg font-extrabold leading-none'
            : 'mt-2 text-xl font-extrabold leading-none';

    return (
        <div className={metricClassName}>
            <dt className="truncate text-[11px] font-semibold leading-none text-[var(--monomat-text-muted)]">
                {label}
            </dt>
            <dd className={`${valueTextClassName} ${valueClassName}`}>
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
    variant = 'default',
}: LobbyReadySummaryProps) {
    const isInline = variant === 'inline';
    const metricListClassName = isInline
        ? 'mt-2 flex flex-wrap gap-1.5'
        : variant === 'compact'
            ? 'mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4'
            : 'mt-3 grid grid-cols-2 gap-3';
    const titleClassName = isInline
        ? '!m-0 !text-sm !font-extrabold !leading-5 !text-[var(--monomat-text-strong)]'
        : '!m-0 !text-base !font-extrabold !leading-5 !text-[var(--monomat-text-strong)]';

    return (
        <section aria-labelledby="lobby-ready-summary-title">
            <div className="flex items-center justify-between gap-3">
                <h3
                    id="lobby-ready-summary-title"
                    className={titleClassName}
                >
                    {LOBBY_ROOM_COPY.READY_SUMMARY_TITLE}
                </h3>
                <span className="shrink-0 rounded-full bg-[var(--monomat-primary-light)] px-3 py-1 text-[11px] font-bold leading-none text-[var(--monomat-primary)]">
                    {readyCount}/{readyTargetCount}
                </span>
            </div>

            <dl className={metricListClassName}>
                <SummaryMetric
                    label={LOBBY_ROOM_COPY.READY_SUMMARY_TOTAL}
                    value={totalPlayerCount}
                    variant={variant}
                />
                <SummaryMetric
                    label={LOBBY_ROOM_COPY.READY_SUMMARY_TARGET}
                    value={readyTargetCount}
                    variant={variant}
                />
                <SummaryMetric
                    label={LOBBY_ROOM_COPY.READY_SUMMARY_READY}
                    value={readyCount}
                    tone="ready"
                    variant={variant}
                />
                <SummaryMetric
                    label={LOBBY_ROOM_COPY.READY_SUMMARY_WAITING}
                    value={waitingCount}
                    tone="waiting"
                    variant={variant}
                />
            </dl>

            {readyTargetCount === 0 && (
                <p
                    className={`break-keep text-xs font-semibold leading-5 text-[var(--monomat-text-muted)] ${
                        isInline
                            ? 'mt-2'
                            : 'mt-3 rounded-lg bg-[var(--monomat-page-bg)] px-3 py-2'
                    }`}
                >
                    {LOBBY_ROOM_COPY.READY_SUMMARY_EMPTY}
                </p>
            )}
        </section>
    );
}
