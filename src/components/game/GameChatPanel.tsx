import { useState } from 'react';
import { Send } from 'lucide-react';

import { GAME_COPY } from '../../constants/game';

import type { GameChatPreviewMessage } from '../../types/game';

interface GameChatPanelProps {
    messages: readonly GameChatPreviewMessage[];
}

export function GameChatPanel({ messages }: GameChatPanelProps) {
    const [message, setMessage] = useState('');

    return (
        <section className="flex min-h-[420px] flex-col overflow-hidden rounded-2xl border border-[color:var(--monomat-border-default)] bg-white text-left shadow-[0_4px_8px_rgba(0,0,0,0.10)] min-[1280px]:h-[690px]">
            <header className="flex h-[55px] shrink-0 items-center border-b border-[color:var(--monomat-border-default)] px-5">
                <h2 className="!m-0 !text-base !font-semibold !leading-none !text-black">
                    {GAME_COPY.CHAT_TITLE}
                </h2>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                <ul className="space-y-[18px]">
                    {messages.map((chatMessage, index) => (
                        <li
                            key={`${chatMessage.nickname}-${chatMessage.time}-${index}`}
                            className="min-w-0"
                        >
                            <div className="flex min-w-0 items-baseline gap-2">
                                <span className="min-w-0 truncate text-base font-semibold leading-[19px] text-[var(--monomat-primary)]">
                                    {chatMessage.nickname}
                                </span>
                                <time className="shrink-0 text-xs leading-[19px] text-[#73788A]">
                                    {chatMessage.time}
                                </time>
                            </div>
                            <p className="mt-[9px] whitespace-pre-wrap break-words text-[15px] leading-[26px] text-black [overflow-wrap:anywhere]">
                                {chatMessage.content}
                            </p>
                        </li>
                    ))}
                </ul>
            </div>

            <footer className="h-[70px] shrink-0 border-t border-[color:var(--monomat-border-default)] px-3 py-2">
                <div className="flex h-[52px] gap-[8px]">
                    <label className="sr-only" htmlFor="game-chat-input">
                        {GAME_COPY.CHAT_PLACEHOLDER}
                    </label>
                    <input
                        id="game-chat-input"
                        type="text"
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                        placeholder={GAME_COPY.CHAT_PLACEHOLDER}
                        className="h-[52px] min-w-0 flex-1 rounded-xl border border-[color:var(--monomat-border-input)] bg-[var(--monomat-page-bg)] px-[14px] text-sm text-[var(--monomat-text-strong)] outline-none transition placeholder:text-[var(--monomat-border-input)] focus:border-[var(--monomat-primary)]"
                    />
                    <button
                        type="button"
                        disabled
                        aria-label={GAME_COPY.CHAT_ACTION_ARIA_LABEL}
                        title={GAME_COPY.CHAT_ACTION_ARIA_LABEL}
                        className="flex h-[52px] w-[52px] shrink-0 cursor-not-allowed items-center justify-center rounded-xl bg-[var(--monomat-primary)] text-white"
                    >
                        <Send
                            size={24}
                            strokeWidth={2}
                            className="-rotate-12"
                            aria-hidden="true"
                        />
                    </button>
                </div>
            </footer>
        </section>
    );
}
