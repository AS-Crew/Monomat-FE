import { CircleCheck, Info, Gamepad2 } from 'lucide-react';

import { LOBBY_ROOM_COPY } from '../../constants/lobby';
import { LobbyReadySummary } from './LobbyReadySummary';

interface HostLobbyActionCardProps {
    canStart: boolean;
    isStarting: boolean;
    startGuideMessage: string;
    totalPlayerCount: number;
    readyTargetCount: number;
    readyCount: number;
    waitingCount: number;
    onStartClick: () => void;
}

export function HostLobbyActionCard({
    canStart,
    isStarting,
    startGuideMessage,
    totalPlayerCount,
    readyTargetCount,
    readyCount,
    waitingCount,
    onStartClick,
}: HostLobbyActionCardProps) {
    const isStartButtonDisabled = !canStart || isStarting;
    const GuideIcon = canStart ? CircleCheck : Info;

    return (
        <section
            aria-labelledby="host-lobby-action-title"
            className="space-y-2"
        >
            <div
                className={`rounded-lg px-4 py-3 ring-1 ${
                    canStart
                        ? 'bg-[var(--monomat-primary-light)] text-[var(--monomat-primary)] ring-blue-100'
                        : 'bg-white text-[var(--monomat-text-muted)] ring-[color:var(--monomat-border-card)]'
                }`}
            >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 lg:max-w-[360px]">
                        <div className="flex items-center gap-2">
                            <GuideIcon
                                size={18}
                                strokeWidth={2.3}
                                aria-hidden="true"
                            />
                            <h3
                                id="host-lobby-action-title"
                                className={`!m-0 !text-sm !font-extrabold !leading-5 ${
                                    canStart
                                        ? '!text-[var(--monomat-primary)]'
                                        : '!text-[var(--monomat-text-strong)]'
                                }`}
                            >
                                {LOBBY_ROOM_COPY.HOST_ACTION_TITLE}
                            </h3>
                        </div>
                        <p
                            id="host-start-guide"
                            className="mt-1.5 break-keep text-xs font-bold leading-5"
                        >
                            {startGuideMessage}
                        </p>
                    </div>

                    <div className="min-w-0 lg:w-[470px]">
                        <LobbyReadySummary
                            totalPlayerCount={totalPlayerCount}
                            readyTargetCount={readyTargetCount}
                            readyCount={readyCount}
                            waitingCount={waitingCount}
                            variant="inline"
                        />
                    </div>
                </div>
            </div>

            <button
                type="button"
                onClick={onStartClick}
                disabled={isStartButtonDisabled}
                aria-describedby="host-start-guide"
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
