import { X } from 'lucide-react';

import { useSocketStore } from '../../store/useSocketStore';

export function SocketErrorToast() {
    const lastError = useSocketStore((state) => state.lastError);
    const dismissError = useSocketStore((state) => state.dismissError);

    if (!lastError) {
        return null;
    }

    return (
        <div
            role="status"
            aria-live="polite"
            className="fixed right-4 bottom-4 z-50 flex max-w-[min(360px,calc(100vw-32px))] items-start gap-3 rounded-md border border-[var(--monomat-border-input)] bg-white px-4 py-3 text-sm text-[var(--monomat-text)] shadow-lg"
        >
            <p className="min-w-0 flex-1 leading-5 break-words">
                {lastError.message}
            </p>
            <button
                type="button"
                aria-label="WebSocket 오류 알림 닫기"
                className="shrink-0 rounded p-1 text-[var(--monomat-text-muted)] hover:bg-[var(--monomat-page-bg)] hover:text-[var(--monomat-text)]"
                onClick={dismissError}
            >
                <X aria-hidden="true" size={16} />
            </button>
        </div>
    );
}

