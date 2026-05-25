import { LOBBY_EMPTY_STATE_COPY } from '../../constants/lobby';

export function LobbyEmptyState() {
    return (
        <div className="flex h-[354px] flex-col items-center justify-center rounded-xl border border-[color:var(--monomat-border-default)] bg-white text-center shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
            <p className="text-base font-bold text-[var(--monomat-text-strong)]">
                {LOBBY_EMPTY_STATE_COPY.TITLE}
            </p>
            <p className="mt-2 text-sm text-[var(--monomat-text-muted)]">
                {LOBBY_EMPTY_STATE_COPY.DESCRIPTION}
            </p>
        </div>
    );
}
