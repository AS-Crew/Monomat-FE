import {
    useEffect,
    useRef,
    useState,
} from 'react';
import { Send } from 'lucide-react';

import {
    LOBBY_CHAT_COPY,
    LOBBY_CHAT_POLICY,
} from '../../constants/lobby';

import type { KeyboardEvent } from 'react';
import type { LobbyChatMessage } from '../../types/lobbyChat';

type LobbyConnectionStatus = 'connected' | 'connecting' | 'disconnected';

interface LobbyChatPanelProps {
    messages: LobbyChatMessage[];
    currentUserId: number | null;
    connectionStatus: LobbyConnectionStatus;
    isRecentChatsLoading: boolean;
    hasLoadedRecentChats: boolean;
    recentChatsError: string | null;
    sendError: string | null;
    isSending: boolean;
    onSendMessage: (content: string) => boolean;
}

const CONNECTION_META = {
    connected: {
        label: LOBBY_CHAT_COPY.CONNECTED,
        dotClassName: 'bg-[#00A259]',
    },
    connecting: {
        label: LOBBY_CHAT_COPY.RECONNECTING,
        dotClassName: 'bg-amber-400',
    },
    disconnected: {
        label: LOBBY_CHAT_COPY.DISCONNECTED,
        dotClassName: 'bg-[var(--monomat-danger)]',
    },
} as const;

function formatTime(message: LobbyChatMessage) {
    const timestamp = message.sentAt ?? message.timestamp;

    if (!timestamp) {
        return '';
    }

    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
        return '';
    }

    return new Intl.DateTimeFormat('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).format(date);
}

function getSystemMessage(message: LobbyChatMessage) {
    switch (message.type) {
        case 'ENTER':
            return LOBBY_CHAT_COPY.SYSTEM.ENTER;
        case 'LEAVE':
            return LOBBY_CHAT_COPY.SYSTEM.LEAVE;
        case 'KICK':
            return LOBBY_CHAT_COPY.SYSTEM.KICK;
        case 'READY_CHANGED':
            return LOBBY_CHAT_COPY.SYSTEM.READY_CHANGED;
        case 'HOST_CHANGED':
            return LOBBY_CHAT_COPY.SYSTEM.HOST_CHANGED;
        case 'SYSTEM':
        default:
            return LOBBY_CHAT_COPY.SYSTEM.DEFAULT;
    }
}

function getMessageKey(message: LobbyChatMessage, index: number) {
    if (message.messageId) {
        return message.messageId;
    }

    const timestamp = message.sentAt ?? message.timestamp;

    return timestamp
        ? `${message.type}:${timestamp}:${message.content}`
        : `${message.type}:${index}`;
}

function SystemMessageItem({ message }: { message: LobbyChatMessage }) {
    return (
        <div className="flex justify-center py-2">
            <p className="max-w-[90%] rounded-full bg-[var(--monomat-page-bg)] px-3 py-1.5 text-center text-xs font-medium leading-4 text-[var(--monomat-text-muted)]">
                {getSystemMessage(message)}
            </p>
        </div>
    );
}

function ChatMessageItem({
    message,
    isMine,
}: {
    message: LobbyChatMessage;
    isMine: boolean;
}) {
    const nickname =
        message.senderNickname?.trim() ||
        LOBBY_CHAT_COPY.PARTICIPANT_FALLBACK;
    const sentTime = formatTime(message);

    if (isMine) {
        return (
            <article className="flex min-w-0 flex-col items-end py-2">
                <div className="flex max-w-[88%] items-baseline justify-end gap-2">
                    {sentTime && (
                        <time className="shrink-0 text-xs leading-none text-[#73788A]">
                            {sentTime}
                        </time>
                    )}
                    <span className="min-w-0 truncate text-[15px] font-semibold leading-none text-[var(--monomat-primary)]">
                        {nickname} · {LOBBY_CHAT_COPY.ME}
                    </span>
                </div>
                <p className="mt-2 max-w-[88%] whitespace-pre-wrap break-words rounded-xl rounded-tr-sm bg-[var(--monomat-primary-light)] px-3 py-2 text-left text-[15px] leading-5 text-[var(--monomat-text-strong)] [overflow-wrap:anywhere]">
                    {message.content}
                </p>
            </article>
        );
    }

    return (
        <article className="min-w-0 py-2">
            <div className="flex min-w-0 max-w-[88%] items-baseline gap-2">
                <span className="min-w-0 truncate text-[15px] font-semibold leading-none text-[var(--monomat-primary)]">
                    {nickname}
                </span>
                {sentTime && (
                    <time className="shrink-0 text-xs leading-none text-[#73788A]">
                        {sentTime}
                    </time>
                )}
            </div>
            <p className="mt-2 max-w-[88%] whitespace-pre-wrap break-words text-[15px] leading-5 text-black [overflow-wrap:anywhere]">
                {message.content}
            </p>
        </article>
    );
}

export function LobbyChatPanel({
    messages,
    currentUserId,
    connectionStatus,
    isRecentChatsLoading,
    hasLoadedRecentChats,
    recentChatsError,
    sendError,
    isSending,
    onSendMessage,
}: LobbyChatPanelProps) {
    const [inputValue, setInputValue] = useState('');
    const messageListRef = useRef<HTMLDivElement>(null);
    const wasNearBottomRef = useRef(true);
    const previousMessageCountRef = useRef(0);
    const connectionMeta = CONNECTION_META[connectionStatus];
    const isConnected = connectionStatus === 'connected';
    const trimmedInput = inputValue.trim();
    const canSubmit =
        isConnected &&
        !isSending &&
        trimmedInput.length > 0 &&
        trimmedInput.length <= LOBBY_CHAT_POLICY.MAX_MESSAGE_LENGTH;

    const scrollToBottom = (behavior: ScrollBehavior) => {
        const messageList = messageListRef.current;

        if (!messageList) {
            return;
        }

        messageList.scrollTo({
            top: messageList.scrollHeight,
            behavior,
        });
        wasNearBottomRef.current = true;
    };

    useEffect(() => {
        if (!hasLoadedRecentChats) {
            return;
        }

        const animationFrameId = window.requestAnimationFrame(() => {
            scrollToBottom('auto');
        });

        return () => {
            window.cancelAnimationFrame(animationFrameId);
        };
    }, [hasLoadedRecentChats]);

    useEffect(() => {
        const previousMessageCount = previousMessageCountRef.current;
        previousMessageCountRef.current = messages.length;

        if (messages.length <= previousMessageCount || messages.length === 0) {
            return;
        }

        const latestMessage = messages[messages.length - 1];
        const isLatestMessageMine =
            latestMessage.type === 'CHAT' &&
            currentUserId != null &&
            latestMessage.senderId === currentUserId;

        if (!isLatestMessageMine && !wasNearBottomRef.current) {
            return;
        }

        const animationFrameId = window.requestAnimationFrame(() => {
            scrollToBottom(isLatestMessageMine ? 'smooth' : 'auto');
        });

        return () => {
            window.cancelAnimationFrame(animationFrameId);
        };
    }, [currentUserId, messages]);

    const handleMessageListScroll = () => {
        const messageList = messageListRef.current;

        if (!messageList) {
            return;
        }

        const distanceFromBottom =
            messageList.scrollHeight -
            messageList.scrollTop -
            messageList.clientHeight;

        wasNearBottomRef.current =
            distanceFromBottom <= LOBBY_CHAT_POLICY.AUTO_SCROLL_THRESHOLD_PX;
    };

    const handleSend = () => {
        if (!canSubmit) {
            return;
        }

        if (!onSendMessage(inputValue)) {
            return;
        }

        setInputValue('');
        scrollToBottom('smooth');
    };

    const handleInputKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.nativeEvent.isComposing) {
            return;
        }

        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSend();
        }
    };

    return (
        <section className="flex min-h-[420px] flex-col overflow-hidden rounded-2xl border border-[color:var(--monomat-border-default)] bg-white text-left shadow-[0_4px_8px_rgba(0,0,0,0.10)] xl:h-[690px]">
            <header className="flex h-[55px] shrink-0 items-center justify-between border-b border-[color:var(--monomat-border-default)] px-5">
                <h2 className="!m-0 !text-base !font-semibold !leading-none !text-black">
                    {LOBBY_CHAT_COPY.TITLE}
                </h2>
                <span className="inline-flex items-center gap-1.5 text-sm font-normal leading-none text-[#B9B9B9]">
                    <span
                        className={`h-[9px] w-[9px] rounded-full ${connectionMeta.dotClassName}`}
                    />
                    {connectionMeta.label}
                </span>
            </header>

            <div
                ref={messageListRef}
                onScroll={handleMessageListScroll}
                className="min-h-0 flex-1 overflow-y-auto px-5 py-4"
            >
                {isRecentChatsLoading && messages.length === 0 ? (
                    <p className="mt-8 text-center text-sm font-medium text-[var(--monomat-text-muted)]">
                        {LOBBY_CHAT_COPY.RECENT_FETCHING}
                    </p>
                ) : messages.length === 0 ? (
                    <div className="flex h-full min-h-[220px] flex-col items-center justify-center px-6 text-center">
                        <p className="text-sm font-bold text-[var(--monomat-text-strong)]">
                            {LOBBY_CHAT_COPY.EMPTY}
                        </p>
                        <p className="mt-2 text-xs font-medium text-[var(--monomat-text-muted)]">
                            {LOBBY_CHAT_COPY.EMPTY_DESCRIPTION}
                        </p>
                    </div>
                ) : (
                    messages.map((message, index) =>
                        message.type === 'CHAT' ? (
                            <ChatMessageItem
                                key={getMessageKey(message, index)}
                                message={message}
                                isMine={
                                    currentUserId != null &&
                                    message.senderId === currentUserId
                                }
                            />
                        ) : (
                            <SystemMessageItem
                                key={getMessageKey(message, index)}
                                message={message}
                            />
                        ),
                    )
                )}
            </div>

            {(recentChatsError || sendError || !isConnected) && (
                <div
                    role={sendError ? 'alert' : 'status'}
                    className={`shrink-0 border-t border-[color:var(--monomat-border-default)] px-5 py-2 text-xs font-semibold ${
                        sendError
                            ? 'bg-[var(--monomat-danger-light)] text-[var(--monomat-danger)]'
                            : 'bg-[var(--monomat-page-bg)] text-[var(--monomat-text-muted)]'
                    }`}
                >
                    {sendError ??
                        recentChatsError ??
                        LOBBY_CHAT_COPY.INPUT_DISABLED_PLACEHOLDER}
                </div>
            )}

            <footer className="h-[70px] shrink-0 border-t border-[color:var(--monomat-border-default)] px-5 py-2">
                <div className="flex h-[52px] items-center gap-2">
                    <textarea
                        value={inputValue}
                        onChange={(event) => setInputValue(event.target.value)}
                        onKeyDown={handleInputKeyDown}
                        placeholder={
                            isConnected
                                ? LOBBY_CHAT_COPY.INPUT_PLACEHOLDER
                                : LOBBY_CHAT_COPY.INPUT_DISABLED_PLACEHOLDER
                        }
                        disabled={!isConnected || isSending}
                        maxLength={LOBBY_CHAT_POLICY.MAX_MESSAGE_LENGTH}
                        rows={1}
                        className="h-[52px] min-w-0 flex-1 resize-none overflow-y-auto rounded-xl border border-[color:var(--monomat-border-input)] bg-[var(--monomat-page-bg)] px-[14px] py-[14px] text-sm leading-[22px] text-[var(--monomat-text-strong)] outline-none transition placeholder:text-[var(--monomat-border-input)] focus:border-[var(--monomat-primary)] disabled:cursor-not-allowed disabled:opacity-60"
                    />
                    <button
                        type="button"
                        onClick={handleSend}
                        disabled={!canSubmit}
                        aria-label={LOBBY_CHAT_COPY.SEND_ARIA_LABEL}
                        className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-xl bg-[var(--monomat-primary)] text-white transition hover:bg-[var(--monomat-primary-hover)] active:scale-95 disabled:cursor-not-allowed disabled:bg-[var(--monomat-border-input)]"
                    >
                        <Send
                            size={25}
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
