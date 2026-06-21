import {
    type MouseEvent,
    useEffect,
} from 'react';
import { X } from 'lucide-react';

import { CONCURRENT_LOGIN_CONFIRM_COPY } from '../../constants/auth';

interface ConcurrentLoginConfirmModalProps {
    isSubmitting: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}

export function ConcurrentLoginConfirmModal({
    isSubmitting,
    onCancel,
    onConfirm,
}: ConcurrentLoginConfirmModalProps) {
    useEffect(() => {
        const previousOverflow = document.body.style.overflow;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && !isSubmitting) {
                onCancel();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = previousOverflow;
        };
    }, [isSubmitting, onCancel]);

    const handleOverlayMouseDown = () => {
        if (!isSubmitting) {
            onCancel();
        }
    };

    const handleContentMouseDown = (event: MouseEvent<HTMLDivElement>) => {
        event.stopPropagation();
    };

    return (
        <div
            role="presentation"
            onMouseDown={handleOverlayMouseDown}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-8"
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="concurrent-login-confirm-title"
                aria-describedby="concurrent-login-confirm-description"
                onMouseDown={handleContentMouseDown}
                className="relative w-full max-w-[445px] overflow-hidden rounded-lg bg-white px-7 pb-6 pt-8 text-center shadow-[0_18px_48px_rgba(15,23,42,0.22)]"
            >
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    aria-label={CONCURRENT_LOGIN_CONFIRM_COPY.CLOSE_ARIA_LABEL}
                    className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg text-[var(--monomat-text-muted)] transition hover:bg-[var(--monomat-page-bg)] hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <X size={20} strokeWidth={1.8} aria-hidden="true" />
                </button>

                <h2
                    id="concurrent-login-confirm-title"
                    className="!m-0 !text-lg !font-bold !leading-7 !text-black"
                >
                    {CONCURRENT_LOGIN_CONFIRM_COPY.TITLE}
                </h2>

                <p
                    id="concurrent-login-confirm-description"
                    className="mx-auto mt-3 max-w-[360px] break-keep text-sm font-medium leading-5 text-[var(--monomat-text-muted)]"
                >
                    {CONCURRENT_LOGIN_CONFIRM_COPY.DESCRIPTION}
                </p>

                <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isSubmitting}
                        className="min-h-11 rounded-lg border border-[color:var(--monomat-border-input)] bg-white px-4 text-sm font-bold text-[var(--monomat-text-muted)] transition hover:bg-[var(--monomat-page-bg)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {CONCURRENT_LOGIN_CONFIRM_COPY.CANCEL}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isSubmitting}
                        className="min-h-11 rounded-lg bg-[var(--monomat-primary)] px-4 text-sm font-bold text-white transition hover:bg-[var(--monomat-primary-hover)] disabled:cursor-not-allowed disabled:bg-[var(--monomat-primary-disabled)]"
                    >
                        {isSubmitting
                            ? CONCURRENT_LOGIN_CONFIRM_COPY.SUBMITTING
                            : CONCURRENT_LOGIN_CONFIRM_COPY.CONFIRM}
                    </button>
                </div>
            </div>
        </div>
    );
}
