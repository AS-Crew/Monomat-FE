import { MessageCircle } from 'lucide-react';

import { LOBBY_ROOM_COPY } from '../../constants/lobby';

type LobbyConnectionStatus = 'connected' | 'connecting' | 'disconnected';

interface LobbyChatPlaceholderProps {
    connectionStatus: LobbyConnectionStatus;
}

const CONNECTION_LABEL = {
    connected: '접속 중',
    connecting: '연결 중',
    disconnected: '연결 끊김',
} as const;

const CONNECTION_DOT_CLASS_NAME = {
    connected: 'bg-[#00B368]',
    connecting: 'bg-amber-400',
    disconnected: 'bg-[var(--monomat-danger)]',
} as const;

export function LobbyChatPlaceholder({
    connectionStatus,
}: LobbyChatPlaceholderProps) {
    return (
        <section className="flex min-h-[420px] flex-col overflow-hidden rounded-2xl border border-[color:var(--monomat-border-default)] bg-white text-left shadow-[0_4px_8px_rgba(0,0,0,0.10)] xl:h-[690px]">
            <header className="flex h-[55px] shrink-0 items-center justify-between border-b border-[color:var(--monomat-border-default)] px-5">
                <h2 className="!m-0 !text-base !font-semibold !leading-none !text-black">
                    {LOBBY_ROOM_COPY.CHAT_PLACEHOLDER_TITLE}
                </h2>
                <span className="inline-flex items-center gap-1.5 text-sm font-normal leading-none text-[#B9B9B9]">
                    <span
                        className={`h-[9px] w-[9px] rounded-full ${CONNECTION_DOT_CLASS_NAME[connectionStatus]}`}
                    />
                    {CONNECTION_LABEL[connectionStatus]}
                </span>
            </header>

            <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--monomat-primary-light)] text-[var(--monomat-primary)]">
                    <MessageCircle
                        size={24}
                        strokeWidth={2.2}
                        aria-hidden="true"
                    />
                </span>
                <p className="mt-4 text-base font-bold leading-5 text-[var(--monomat-text-strong)]">
                    {LOBBY_ROOM_COPY.CHAT_PLACEHOLDER_TITLE}
                </p>
                <p className="mt-2 break-keep text-sm font-medium leading-5 text-[var(--monomat-text-muted)]">
                    {LOBBY_ROOM_COPY.CHAT_PLACEHOLDER_DESCRIPTION}
                </p>
            </div>
        </section>
    );
}
