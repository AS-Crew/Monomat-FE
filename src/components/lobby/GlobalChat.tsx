import { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';

import { useChatCooldown } from '../../hooks/useChatCooldown';
import { useGlobalChat } from '../../hooks/useGlobalChat';
import { useSocketStore } from '../../store/useSocketStore';
import { GLOBAL_CHAT_COPY } from '../../constants/lobby';
import type { ChatMessage } from '../../types/chat';
import { MonomatInput } from '../common/MonomatInput';

const CHAT_COOLDOWN_MS = 3000;
const MAX_CHAT_LENGTH = 200;

function formatTime(timestamp: string): string {
    try {
        return new Date(timestamp).toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });
    } catch {
        return '';
    }
}

function getConnectionLabel(
    isConnected: boolean,
    isReconnecting: boolean,
): string {
    if (isConnected) {
        return GLOBAL_CHAT_COPY.CONNECTED;
    }

    if (isReconnecting) {
        return GLOBAL_CHAT_COPY.RECONNECTING;
    }

    return GLOBAL_CHAT_COPY.DISCONNECTED;
}

function MessageItem({ message }: { message: ChatMessage }) {
    const isSystemMessage = message.type === 'ENTER' || message.type === 'LEAVE';

    if (isSystemMessage) {
        return (
            <div className="py-1 text-center text-xs text-[var(--monomat-text-muted)]">
                {message.content}
            </div>
        );
    }

    return (
        <div className="py-2">
            <div className="flex items-baseline gap-3">
                <span className="max-w-[170px] truncate text-[15px] font-semibold leading-none text-[var(--monomat-primary)]">
                    {message.sender}
                </span>
                <span className="shrink-0 text-xs leading-none text-[#73788A]">
                    {formatTime(message.timestamp)}
                </span>
            </div>

            <p className="mt-2 break-words text-base leading-[19px] text-black">
                {message.content}
            </p>
        </div>
    );
}

function ReconnectOverlay() {
    return (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-white/65 backdrop-blur-[1px]">
            <div
                className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--monomat-border-default)] border-t-[var(--monomat-primary)]"
                aria-hidden="true"
            />
            <p className="text-sm font-semibold text-[var(--monomat-text-strong)]">
                {GLOBAL_CHAT_COPY.RECONNECTING}
            </p>
        </div>
    );
}

export function GlobalChat() {
    const { messages, sendMessage } = useGlobalChat();
    const connectionStatus = useSocketStore((state) => state.connectionStatus);

    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const {
        isCoolingDown,
        remainingSeconds,
        startCooldown,
        canSend,
    } = useChatCooldown({ cooldownMs: CHAT_COOLDOWN_MS });

    const isConnected = connectionStatus === 'connected';
    const isReconnecting = connectionStatus === 'connecting';
    const trimmedInput = inputValue.trim();

    const canSubmit =
        isConnected &&
        !isCoolingDown &&
        trimmedInput.length > 0;

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = (value: string) => {
        const message = value.trim();

        if (!message || !isConnected || !canSend()) {
            return;
        }

        const isSent = sendMessage(message);

        if (!isSent) {
            return;
        }

        setInputValue('');
        startCooldown();
    };

    return (
        <div className="relative flex h-full flex-col overflow-hidden rounded-xl border border-[color:var(--monomat-border-input)] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
            {isReconnecting && <ReconnectOverlay />}

            <div className="flex h-14 shrink-0 items-center justify-between border-b border-[color:var(--monomat-border-input)] px-[18px]">
                <span className="text-base font-semibold leading-none text-black">
                    {GLOBAL_CHAT_COPY.TITLE}
                </span>

                <div className="flex items-center gap-1.5">
                    <span
                        className={`h-[9px] w-[9px] rounded-full ${
                            isConnected ? 'bg-[#00A259]' : 'bg-[var(--monomat-border-input)]'
                        }`}
                    />
                    <span className="text-base leading-none text-[#B9B9B9]">
                        {getConnectionLabel(isConnected, isReconnecting)}
                    </span>
                </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-[18px] py-[9px]">
                {messages.length === 0 ? (
                    <p className="mt-8 text-center text-sm text-[var(--monomat-border-input)]">
                        {GLOBAL_CHAT_COPY.EMPTY}
                    </p>
                ) : (
                    messages.map((message, index) => (
                        <MessageItem key={index} message={message} />
                    ))
                )}

                <div ref={messagesEndRef} />
            </div>

            <div className="h-[70px] shrink-0 border-t border-[color:var(--monomat-border-input)] px-[22px] py-2.5">
                <div className="flex h-[50px] items-center gap-[9px]">
                    <MonomatInput
                        type="text"
                        value={inputValue}
                        onChange={(event) => setInputValue(event.target.value)}
                        onEnter={handleSend}
                        placeholder={
                            isConnected
                                ? GLOBAL_CHAT_COPY.INPUT_PLACEHOLDER
                                : GLOBAL_CHAT_COPY.CONNECTING_PLACEHOLDER
                        }
                        disabled={!isConnected || isCoolingDown}
                        maxLength={MAX_CHAT_LENGTH}
                        className="
                            h-[50px] min-w-0 flex-1 rounded-xl border border-[color:var(--monomat-border-input)] bg-[var(--monomat-page-bg)]
                            px-[11px] text-sm text-[var(--monomat-text-strong)] placeholder:text-[var(--monomat-border-input)]
                            outline-none transition-colors
                            focus:border-[color:var(--monomat-primary)]
                            disabled:cursor-not-allowed disabled:opacity-50
                        "
                    />

                    <button
                        type="button"
                        onClick={() => handleSend(inputValue)}
                        disabled={!canSubmit}
                        className="
                            flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-xl bg-[var(--monomat-primary)]
                            transition-all hover:bg-[var(--monomat-primary-hover)] active:scale-95
                            disabled:cursor-not-allowed disabled:bg-[var(--monomat-border-input)]
                        "
                        aria-label={GLOBAL_CHAT_COPY.SEND_ARIA_LABEL}
                    >
                        <Send
                            className="-rotate-12 text-white"
                            size={24}
                            strokeWidth={2.2}
                            aria-hidden="true"
                        />
                    </button>
                </div>

                {isCoolingDown && (
                    <p className="mt-1 text-xs text-[#F28C1A]">
                        {GLOBAL_CHAT_COPY.COOLDOWN_PREFIX}{' '}
                        {remainingSeconds}
                        {GLOBAL_CHAT_COPY.COOLDOWN_SUFFIX}
                    </p>
                )}
            </div>
        </div>
    );
}
