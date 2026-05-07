import { useEffect, useRef, useState } from 'react';
import { useGlobalChat } from '../../hooks/useGlobalChat';
import { useChatCooldown } from '../../hooks/useChatCooldown';
import { MonomatInput } from '../common/MonomatInput';
import { useSocketStore } from '../../store/useSocketStore';
import type { ChatMessage } from '../../types/chat';

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

function getConnectionLabel(isConnected: boolean, isReconnecting: boolean): string {
    if (isConnected) {
        return '연결됨';
    }

    if (isReconnecting) {
        return '재연결 중...';
    }

    return '연결 끊김';
}

function MessageItem({ message }: { message: ChatMessage }) {
    const isSystemMessage = message.type === 'ENTER' || message.type === 'LEAVE';

    if (isSystemMessage) {
        return (
            <div className="py-0.5 text-center text-xs text-gray-400 italic">
                {message.content}
            </div>
        );
    }

    return (
        <div className="py-1">
            <div className="flex items-baseline gap-1.5">
                <span className="max-w-[120px] truncate text-sm font-semibold text-blue-600">
                    {message.sender}
                </span>
                <span className="shrink-0 text-xs text-gray-400">
                    {formatTime(message.timestamp)}
                </span>
            </div>

            <p className="break-words text-sm leading-snug text-gray-800">
                {message.content}
            </p>
        </div>
    );
}

function ReconnectOverlay() {
    return (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-white/55 backdrop-blur-[1px]">
            <div
                className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500"
                aria-hidden="true"
            />
            <p className="text-sm font-semibold text-gray-700">
                재연결 중...
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
        <div className="relative flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            {isReconnecting && <ReconnectOverlay />}

            <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-4 py-3">
                <span className="text-sm font-bold text-gray-800">
                    전체 채팅
                </span>

                <div className="flex items-center gap-1.5">
                    <span
                        className={`h-2 w-2 rounded-full ${
                            isConnected ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                    />
                    <span className="text-xs text-gray-400">
                        {getConnectionLabel(isConnected, isReconnecting)}
                    </span>
                </div>
            </div>

            <div className="min-h-0 flex-1 space-y-0.5 overflow-y-auto px-4 py-2">
                {messages.length === 0 ? (
                    <p className="mt-8 text-center text-xs text-gray-400">
                        아직 채팅이 없습니다.
                    </p>
                ) : (
                    messages.map((message, index) => (
                        <MessageItem key={index} message={message} />
                    ))
                )}

                <div ref={messagesEndRef} />
            </div>

            <div className="shrink-0 border-t border-gray-100 px-3 py-3">
                <div className="flex items-center gap-2">
                    <MonomatInput
                        type="text"
                        value={inputValue}
                        onChange={(event) => setInputValue(event.target.value)}
                        onEnter={handleSend}
                        placeholder={isConnected ? '메시지를 입력하세요' : '연결 중...'}
                        disabled={!isConnected || isCoolingDown}
                        maxLength={MAX_CHAT_LENGTH}
                        className="
                            flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm
                          text-gray-900 placeholder:text-gray-400
                            outline-none transition-colors
                            focus:border-blue-500
                            disabled:cursor-not-allowed disabled:opacity-50
                        "
                    />

                    <button
                        type="button"
                        onClick={() => handleSend(inputValue)}
                        disabled={!canSubmit}
                        className="
                            flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500
                            transition-all hover:bg-blue-600 active:scale-95
                            disabled:cursor-not-allowed disabled:bg-gray-200
                        "
                        aria-label="메시지 전송"
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            className="text-white"
                            aria-hidden="true"
                        >
                            <path
                                d="M22 2L11 13"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M22 2L15 22L11 13L2 9L22 2Z"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>
                </div>

                {isCoolingDown && (
                    <p className="mt-2 text-xs text-orange-500">
                        연속 전송 방지를 위해 {remainingSeconds}초 후 다시 보낼 수 있습니다.
                    </p>
                )}
            </div>
        </div>
    );
}