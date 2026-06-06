import {
    type MouseEvent,
    useEffect,
} from 'react';
import { X } from 'lucide-react';

import { MAP_DELETE_CONFIRM_MODAL_COPY } from '../../constants/map';

interface MapDeleteConfirmModalProps {
    mapTitle: string;
    isDeleting: boolean;
    errorMessage: string | null;
    onCancel: () => void;
    onConfirm: () => void;
}

export function MapDeleteConfirmModal({
    mapTitle,
    isDeleting,
    errorMessage,
    onCancel,
    onConfirm,
}: MapDeleteConfirmModalProps) {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && !isDeleting) {
                onCancel();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isDeleting, onCancel]);

    const handleOverlayMouseDown = () => {
        if (!isDeleting) {
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
                aria-labelledby="map-delete-confirm-modal-title"
                aria-describedby="map-delete-confirm-modal-description"
                onMouseDown={handleContentMouseDown}
                className="relative w-full max-w-[445px] overflow-hidden rounded-lg bg-white px-7 pb-[18px] pt-8 text-center shadow-[0_18px_48px_rgba(15,23,42,0.22)]"
            >
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isDeleting}
                    className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg text-[var(--monomat-text-muted)] transition hover:bg-[var(--monomat-page-bg)] hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label={MAP_DELETE_CONFIRM_MODAL_COPY.CLOSE_ARIA_LABEL}
                >
                    <X size={20} strokeWidth={1.8} aria-hidden="true" />
                </button>

                <h2
                    id="map-delete-confirm-modal-title"
                    className="!m-0 !text-sm !font-semibold !leading-[21px] !text-black"
                >
                    {MAP_DELETE_CONFIRM_MODAL_COPY.TITLE}
                </h2>

                <p
                    id="map-delete-confirm-modal-description"
                    className="mx-auto mt-2 max-w-[360px] break-keep text-sm font-medium leading-5 text-[var(--monomat-text-muted)]"
                >
                    {MAP_DELETE_CONFIRM_MODAL_COPY.DESCRIPTION}
                </p>

                <div className="mt-4 rounded-lg bg-[var(--monomat-page-bg)] px-4 py-3 text-left">
                    <span className="block text-[11px] font-bold leading-none text-[var(--monomat-text-muted)]">
                        {MAP_DELETE_CONFIRM_MODAL_COPY.TARGET_LABEL}
                    </span>
                    <span className="mt-1 block break-keep text-sm font-bold leading-5 text-[var(--monomat-text-strong)] [overflow-wrap:anywhere]">
                        {mapTitle}
                    </span>
                </div>

                {errorMessage && (
                    <p
                        role="alert"
                        className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold leading-5 text-red-600 ring-1 ring-red-100"
                    >
                        {errorMessage}
                    </p>
                )}

                <div className="mt-[18px] flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isDeleting}
                        className="h-[33px] min-w-[62px] rounded-[25px] bg-[var(--monomat-primary)] px-4 text-sm font-bold leading-none text-white transition hover:bg-[var(--monomat-primary-hover)] disabled:cursor-not-allowed disabled:bg-[var(--monomat-primary-disabled)]"
                    >
                        {MAP_DELETE_CONFIRM_MODAL_COPY.CANCEL}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="h-[33px] min-w-[62px] rounded-2xl border border-[#CCCCD1] bg-white px-4 text-sm font-bold leading-none text-[#808085] transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-[#CCCCD1] disabled:hover:bg-white disabled:hover:text-[#808085]"
                    >
                        {isDeleting
                            ? MAP_DELETE_CONFIRM_MODAL_COPY.DELETING
                            : MAP_DELETE_CONFIRM_MODAL_COPY.CONFIRM}
                    </button>
                </div>
            </div>
        </div>
    );
}
