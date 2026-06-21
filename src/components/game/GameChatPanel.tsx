import { useEffect, useRef } from 'react';

import { GAME_COPY } from '../../constants/game';

import type { GameChatDisplayMessage } from '../../types/game';

interface GameChatPanelProps {
    messages: readonly GameChatDisplayMessage[];
}

export function GameChatPanel({ messages }: GameChatPanelProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const shouldFollowLatestRef = useRef(true);

    useEffect(() => {
        const scrollContainer = scrollContainerRef.current;

        if (!scrollContainer || !shouldFollowLatestRef.current) {
            return;
        }

        const frameId = window.requestAnimationFrame(() => {
            scrollContainer.scrollTo({
                top: scrollContainer.scrollHeight,
                behavior: 'smooth',
            });
        });

        return () => {
            window.cancelAnimationFrame(frameId);
        };
    }, [messages.length]);

    return (
        <section className="flex min-h-[420px] flex-col overflow-hidden rounded-2xl border border-[color:var(--monomat-border-default)] bg-white text-left shadow-[0_4px_8px_rgba(0,0,0,0.10)] min-[1280px]:h-[602px]">
            <header className="flex h-[55px] shrink-0 items-center border-b border-[color:var(--monomat-border-default)] px-5">
                <h2 className="!m-0 !text-base !font-semibold !leading-none !text-black">
                    {GAME_COPY.CHAT_TITLE}
                </h2>
            </header>

            <div
                ref={scrollContainerRef}
                onScroll={(event) => {
                    const element = event.currentTarget;
                    const distanceFromBottom =
                        element.scrollHeight -
                        element.scrollTop -
                        element.clientHeight;

                    shouldFollowLatestRef.current =
                        distanceFromBottom < 80;
                }}
                className="min-h-0 flex-1 overflow-y-auto px-5 py-4"
            >
                {messages.length === 0 ? (
                    <p className="mt-8 text-center text-sm font-medium text-[var(--monomat-text-muted)]">
                        {GAME_COPY.CHAT_EMPTY}
                    </p>
                ) : (
                    <ul className="space-y-[18px]">
                        {messages.map((chatMessage, index) => (
                            <li
                                key={`${chatMessage.nickname}-${chatMessage.time}-${index}`}
                                className={
                                    chatMessage.type === 'SYSTEM'
                                        ? 'min-w-0 rounded-lg bg-[var(--monomat-page-bg)] px-3 py-2'
                                        : 'min-w-0'
                                }
                            >
                                <div className="flex min-w-0 items-baseline gap-2">
                                    <span
                                        className={`min-w-0 truncate text-base font-semibold leading-[19px] ${
                                            chatMessage.type === 'SYSTEM'
                                                ? 'text-[var(--monomat-text-muted)]'
                                                : 'text-[var(--monomat-primary)]'
                                        }`}
                                    >
                                        {chatMessage.type === 'SYSTEM'
                                            ? GAME_COPY.CHAT_SYSTEM_SENDER
                                            : chatMessage.nickname ??
                                              GAME_COPY.CHAT_UNKNOWN_SENDER}
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
                )}
            </div>
        </section>
    );
}
