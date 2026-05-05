// 로비 리스트 화면 우측에 고정되는 전체 채팅 UI 컴포넌트.
//
// [책임]
// - 메시지 목록 렌더링
// - 입력창 및 전송 버튼 렌더링
// - 새 메시지 수신 시 자동 스크롤 (Auto-scroll)
//
// [이 컴포넌트가 하지 않는 것]
// - 소켓 구독/발행 로직 → useGlobalChat 훅이 담당
// - 소켓 연결 관리 → useSocket, useSocketStore가 담당

import { useEffect, useRef, useState } from 'react';
import { useGlobalChat } from '../../hooks/useGlobalChat';
import { MonomatInput } from '../common/MonomatInput';
import { useSocketStore } from '../../store/useSocketStore';
import type { ChatMessage } from '../../types/chat';

// 타임스탬프 포맷 유틸 (ISO 8601 → "HH:MM")
// 컴포넌트 외부에 선언하여 렌더링마다 재생성되지 않도록 한다.
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

// 메시지 타입별 스타일 분기
// SYSTEM 메시지(ENTER/LEAVE)는 회색 이탤릭으로 표시한다.
function MessageItem({ message }: { message: ChatMessage }) {
    const isSystem = message.type === 'ENTER' || message.type === 'LEAVE';

    if (isSystem) {
        return (
            <div className="py-0.5 text-center text-xs text-gray-400 italic">
                {message.content}
            </div>
        );
    }

    return (
        <div className="py-1">
            {/* 닉네임 + 타임스탬프 */}
            <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-semibold text-green-600 truncate max-w-[120px]">
                    {message.sender}
                </span>
                <span className="text-xs text-gray-400 shrink-0">
                    {formatTime(message.timestamp)}
                </span>
            </div>
            {/* 메시지 본문 */}
            <p className="text-sm text-gray-800 break-words leading-snug">
                {message.content}
            </p>
        </div>
    );
}

export function GlobalChat() {
    const { messages, sendMessage } = useGlobalChat();
    const connectionStatus = useSocketStore((state) => state.connectionStatus);
    const [inputValue, setInputValue] = useState('');

    // 메시지 목록 컨테이너 ref — 자동 스크롤에 사용
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 새 메시지가 추가될 때마다 최신 메시지로 자동 스크롤
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = (value: string) => {
        sendMessage(value);
        setInputValue('');
    };

    const isConnected = connectionStatus === 'connected';

    return (
        <div className="flex flex-col h-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

            {/* 헤더: 제목 + 접속자 수 표시 영역 */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
                <span className="text-sm font-bold text-gray-800">전체 채팅</span>
                <div className="flex items-center gap-1.5">
                    {/* 연결 상태 표시 인디케이터 */}
                    <span
                        className={`w-2 h-2 rounded-full ${
                            isConnected ? 'bg-green-400' : 'bg-gray-300'
                        }`}
                    />
                    <span className="text-xs text-gray-400">
                        {isConnected ? '연결됨' : '연결 중...'}
                    </span>
                </div>
            </div>

            {/* 메시지 목록 영역 — flex-1로 남은 공간을 채우고 스크롤 가능하게 */}
            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-0.5 min-h-0">
                {messages.length === 0 ? (
                    <p className="text-center text-xs text-gray-400 mt-8">
                        아직 채팅이 없습니다.
                    </p>
                ) : (
                    messages.map((msg, index) => (
                        // index를 key로 쓰는 이유:
                        // ChatMessage에 고유 id가 없고, 동일 sender+content+timestamp가
                        // 중복될 수 있어 복합 키도 안전하지 않다.
                        // 메시지는 append-only라 index 불안정 문제가 발생하지 않는다.
                        <MessageItem key={index} message={msg} />
                    ))
                )}
                {/* 자동 스크롤 앵커 */}
                <div ref={messagesEndRef} />
            </div>

            {/* 입력창 영역 */}
            <div className="px-3 py-3 border-t border-gray-100 shrink-0">
                <div className="flex items-center gap-2">
                    <MonomatInput
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onEnter={handleSend}
                        placeholder={isConnected ? '메시지를 입력하세요' : '연결 중...'}
                        disabled={!isConnected}
                        maxLength={200}
                        className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-400 focus:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    {/* 전송 버튼 */}
                    <button
                        onClick={() => handleSend(inputValue)}
                        disabled={!isConnected || !inputValue.trim()}
                        className="shrink-0 w-9 h-9 flex items-center justify-center bg-blue-500 hover:bg-blue-600 active:scale-95 disabled:bg-gray-200 disabled:cursor-not-allowed rounded-lg transition-all"
                        aria-label="메시지 전송"
                    >
                        {/* 전송 아이콘 (SVG) */}
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            className="text-white"
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
            </div>
        </div>
    );
}
