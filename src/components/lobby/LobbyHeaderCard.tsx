import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

import {
    LOBBY_ROOM_COPY,
    LOBBY_STATUS_META,
} from '../../constants/lobby';

type LobbyConnectionStatus = 'connected' | 'connecting' | 'disconnected';

interface LobbyHeaderCardProps {
    title: string;
    inviteCode: string;
    status: string;
    connectionStatus: LobbyConnectionStatus;
    hostNickname?: string | null;
    currentPlayers: number;
    maxPlayers: number;
    isHost: boolean;
}

const CONNECTION_STATUS_LABEL = {
    connected: 'connected',
    connecting: 'connecting',
    disconnected: 'disconnected',
} as const;

const CONNECTION_STATUS_CLASS_NAME = {
    connected: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    connecting: 'bg-amber-50 text-amber-700 ring-amber-200',
    disconnected: 'bg-red-50 text-red-700 ring-red-200',
} as const;

function getLobbyStatusMeta(status: string) {
    if (status === 'WAITING') {
        return LOBBY_STATUS_META.WAITING;
    }

    if (status === 'PLAYING') {
        return LOBBY_STATUS_META.PLAYING;
    }

    return LOBBY_STATUS_META.UNKNOWN;
}

async function writeTextToClipboard(text: string) {
    if (navigator.clipboard?.writeText) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch {
            // 일부 브라우저 권한 환경에서는 아래 fallback으로 처리한다.
        }
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();

    try {
        return document.execCommand('copy');
    } finally {
        document.body.removeChild(textarea);
    }
}

export function LobbyHeaderCard({
    title,
    inviteCode,
    status,
    connectionStatus,
    hostNickname,
    currentPlayers,
    maxPlayers,
    isHost,
}: LobbyHeaderCardProps) {
    const [isCopied, setIsCopied] = useState(false);
    const statusMeta = getLobbyStatusMeta(status);
    const hostDisplayName =
        hostNickname?.trim() || LOBBY_ROOM_COPY.HOST_UNKNOWN;

    const handleCopyInviteCode = async () => {
        const didCopy = await writeTextToClipboard(inviteCode);

        if (didCopy) {
            setIsCopied(true);
            window.setTimeout(() => setIsCopied(false), 1400);
        } else {
            setIsCopied(false);
        }
    };

    return (
        <section className="rounded-lg bg-white px-5 py-5 text-left shadow-[0_4px_16px_rgba(0,0,0,0.08)] ring-1 ring-[color:var(--monomat-border-card)] sm:px-6 lg:px-[25px]">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex h-[24px] shrink-0 items-center justify-center rounded-full px-3 text-[11px] font-semibold leading-none ${statusMeta.badgeClassName}`}>
                            ● {statusMeta.label}
                        </span>
                        <span
                            className={`inline-flex h-[24px] shrink-0 items-center rounded-full px-3 text-[11px] font-semibold leading-none ring-1 ${CONNECTION_STATUS_CLASS_NAME[connectionStatus]}`}
                        >
                            socket {CONNECTION_STATUS_LABEL[connectionStatus]}
                        </span>
                    </div>

                    <h1 className="!mb-0 !ml-0 !mr-0 !mt-4 truncate !text-[30px] !font-extrabold !leading-[38px] !text-[var(--monomat-text-strong)] sm:!text-[36px] sm:!leading-[43px]">
                        {title}
                    </h1>

                    <p className="mt-2 truncate text-sm font-medium leading-5 text-[var(--monomat-text-muted)]">
                        {LOBBY_ROOM_COPY.HOST_BADGE} {hostDisplayName}
                    </p>
                </div>

                <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_120px] lg:w-[380px]">
                    <button
                        type="button"
                        onClick={handleCopyInviteCode}
                        className="flex h-11 min-w-0 items-center rounded-lg border border-[color:var(--monomat-border-input)] bg-[var(--monomat-page-bg)] px-3 text-left transition hover:bg-white"
                        aria-label={LOBBY_ROOM_COPY.INVITE_CODE_COPY}
                    >
                        {isCopied ? (
                            <Check
                                className="shrink-0 text-emerald-600"
                                size={18}
                                strokeWidth={2.4}
                                aria-hidden="true"
                            />
                        ) : (
                            <Copy
                                className="shrink-0 text-[var(--monomat-text-strong)]"
                                size={18}
                                strokeWidth={2.2}
                                aria-hidden="true"
                            />
                        )}
                        <span className="ml-3 min-w-0">
                            <span className="block text-[10px] font-semibold leading-none text-[var(--monomat-text-muted)]">
                                {isCopied
                                    ? LOBBY_ROOM_COPY.INVITE_CODE_COPIED
                                    : LOBBY_ROOM_COPY.INVITE_CODE}
                            </span>
                            <span className="mt-1 block truncate font-mono text-sm font-extrabold leading-none text-[var(--monomat-text-strong)]">
                                {inviteCode}
                            </span>
                        </span>
                    </button>

                    <div className="grid h-11 grid-cols-2 overflow-hidden rounded-lg border border-[color:var(--monomat-border-input)] bg-white text-center sm:grid-cols-1">
                        <div className="flex items-center justify-center gap-1 border-r border-[color:var(--monomat-border-input)] text-sm font-extrabold leading-none text-[var(--monomat-text-strong)] sm:border-b sm:border-r-0">
                            {currentPlayers}/{maxPlayers}
                        </div>
                        <div className="flex items-center justify-center text-[11px] font-semibold leading-none text-[var(--monomat-text-muted)]">
                            {isHost
                                ? LOBBY_ROOM_COPY.ROLE_HOST
                                : LOBBY_ROOM_COPY.ROLE_PLAYER}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
