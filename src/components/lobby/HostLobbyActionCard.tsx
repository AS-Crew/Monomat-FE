import { Gamepad2 } from 'lucide-react';

import { LOBBY_ROOM_COPY } from '../../constants/lobby';

interface HostLobbyActionCardProps {
    canStart: boolean;
    isStarting: boolean;
    startGuideMessage: string;
    onStartClick: () => void;
}

export function HostLobbyActionCard({
    canStart,
    isStarting,
    startGuideMessage,
    onStartClick,
}: HostLobbyActionCardProps) {
    const isStartButtonDisabled = !canStart || isStarting;

    return (
        <section aria-label={LOBBY_ROOM_COPY.HOST_ACTION_TITLE}>
            <p className="sr-only">{startGuideMessage}</p>
            <button
                type="button"
                onClick={onStartClick}
                disabled={isStartButtonDisabled}
                className="flex h-[45px] w-full items-center justify-center gap-2 rounded-lg bg-[var(--monomat-primary)] text-base font-bold leading-none text-white transition hover:bg-[var(--monomat-primary-hover)] disabled:cursor-not-allowed disabled:bg-[#D3D3D7]"
            >
                <Gamepad2 size={20} strokeWidth={2.3} aria-hidden="true" />
                {isStarting
                    ? LOBBY_ROOM_COPY.START_PENDING
                    : LOBBY_ROOM_COPY.START_GAME}
            </button>
        </section>
    );
}
