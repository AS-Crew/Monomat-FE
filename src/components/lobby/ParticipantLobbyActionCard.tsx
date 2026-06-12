import { CircleCheck, Clock3, Gamepad2, Info } from 'lucide-react';

import { LOBBY_ROOM_COPY } from '../../constants/lobby';

interface ParticipantLobbyActionCardProps {
    hostNickname: string;
    isReady: boolean;
    isWaitingLobby: boolean;
    hasCurrentPlayer: boolean;
    isUpdating: boolean;
    onReadyClick: () => void;
}

export function ParticipantLobbyActionCard({
    hostNickname,
    isReady,
    isWaitingLobby,
    hasCurrentPlayer,
    isUpdating,
    onReadyClick,
}: ParticipantLobbyActionCardProps) {
    const isButtonDisabled =
        !isWaitingLobby || !hasCurrentPlayer || isUpdating;
    const StatusIcon = isReady ? CircleCheck : Clock3;
    const guideMessage = !isWaitingLobby
        ? LOBBY_ROOM_COPY.PARTICIPANT_NOT_WAITING
        : !hasCurrentPlayer
            ? LOBBY_ROOM_COPY.READY_WAIT_PLAYER
            : isReady
                ? LOBBY_ROOM_COPY.PARTICIPANT_READY_GUIDE
                : LOBBY_ROOM_COPY.PARTICIPANT_WAITING_GUIDE;

    return (
        <section
            aria-labelledby="participant-lobby-action-title"
            className="space-y-2"
        >
            <div
                className={`rounded-lg px-4 py-3 ring-1 ${
                    isReady
                        ? 'bg-[#E5F7ED] ring-emerald-100'
                        : 'bg-white ring-[color:var(--monomat-border-card)]'
                }`}
            >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <StatusIcon
                                size={18}
                                strokeWidth={2.3}
                                className={
                                    isReady
                                        ? 'text-[#00A259]'
                                        : 'text-[var(--monomat-text-muted)]'
                                }
                                aria-hidden="true"
                            />
                            <h3
                                id="participant-lobby-action-title"
                                className="!m-0 !text-sm !font-extrabold !leading-5 !text-[var(--monomat-text-strong)]"
                            >
                                {LOBBY_ROOM_COPY.PARTICIPANT_ACTION_TITLE}
                            </h3>
                            <span
                                className={`inline-flex h-6 items-center rounded-full px-2.5 text-[11px] font-bold leading-none ${
                                    isReady
                                        ? 'bg-white text-[#00A259]'
                                        : 'bg-[var(--monomat-page-bg)] text-[var(--monomat-text-muted)]'
                                }`}
                            >
                                {isReady
                                    ? LOBBY_ROOM_COPY.READY
                                    : LOBBY_ROOM_COPY.WAITING}
                            </span>
                        </div>

                        <p className="mt-1.5 break-keep text-xs font-bold leading-5 text-[var(--monomat-text-muted)]">
                            {guideMessage}
                        </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-2 text-xs font-semibold text-[var(--monomat-text-muted)]">
                        <Info size={15} strokeWidth={2.2} aria-hidden="true" />
                        <span>
                            {LOBBY_ROOM_COPY.PARTICIPANT_HOST_PREFIX}{' '}
                            <strong className="font-extrabold text-[var(--monomat-text-strong)]">
                                {hostNickname}
                            </strong>
                        </span>
                    </div>
                </div>
            </div>

            <button
                type="button"
                onClick={onReadyClick}
                disabled={isButtonDisabled}
                aria-describedby="participant-lobby-action-title"
                className={`flex h-[45px] w-full items-center justify-center gap-2 rounded-lg text-base font-bold leading-none text-white transition disabled:cursor-not-allowed disabled:bg-[#D3D3D7] ${
                    isReady
                        ? 'bg-[var(--monomat-text-strong)] hover:bg-black'
                        : 'bg-[#00A259] hover:bg-[#008F4E]'
                }`}
            >
                <Gamepad2 size={20} strokeWidth={2.3} aria-hidden="true" />
                {isUpdating
                    ? LOBBY_ROOM_COPY.READY_PENDING
                    : isReady
                        ? LOBBY_ROOM_COPY.CANCEL_READY
                        : LOBBY_ROOM_COPY.SUBMIT_READY}
            </button>
        </section>
    );
}
