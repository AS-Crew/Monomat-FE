import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

import {
    LOBBY_ROOM_COPY,
    LOBBY_STATUS_META,
} from '../../constants/lobby';

interface LobbyRoomTopControlsProps {
    inviteCode: string;
    status: string;
}

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

export function LobbyRoomTopControls({
    inviteCode,
    status,
}: LobbyRoomTopControlsProps) {
    const [isCopied, setIsCopied] = useState(false);
    const statusMeta = getLobbyStatusMeta(status);

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
        <div className="flex w-full flex-wrap items-center gap-2 md:w-auto">
            <span
                className={`inline-flex h-9 min-w-[115px] items-center justify-center rounded-full px-4 text-[15px] font-bold leading-none ${statusMeta.badgeClassName}`}
            >
                ● {statusMeta.label}
            </span>

            <button
                type="button"
                onClick={handleCopyInviteCode}
                className="inline-flex h-9 min-w-[135px] items-center justify-center rounded-lg border border-[color:var(--monomat-border-input)] bg-white px-3 text-[15px] font-bold leading-none text-[var(--monomat-primary)] transition hover:bg-[var(--monomat-page-bg)]"
                aria-label={LOBBY_ROOM_COPY.INVITE_CODE_COPY}
            >
                {isCopied ? (
                    <Check
                        className="mr-2 shrink-0 text-emerald-600"
                        size={18}
                        strokeWidth={2.4}
                        aria-hidden="true"
                    />
                ) : (
                    <Copy
                        className="mr-2 shrink-0 text-[var(--monomat-text-strong)]"
                        size={18}
                        strokeWidth={2.2}
                        aria-hidden="true"
                    />
                )}
                <span className="font-mono">
                    {isCopied
                        ? LOBBY_ROOM_COPY.INVITE_CODE_COPIED
                        : inviteCode}
                </span>
            </button>
        </div>
    );
}
