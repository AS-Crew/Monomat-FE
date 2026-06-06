import {
    type MouseEvent,
    useEffect,
} from 'react';
import { ImageOff } from 'lucide-react';

import {
    MAP_ITEM_DETAIL_MODAL_COPY,
    MAP_MANAGE_PAGE_COPY,
} from '../../constants/map';
import { formatMapStartTime } from '../../utils/mapFormat';
import {
    createYouTubeEmbedUrl,
    extractYouTubeVideoId,
} from '../../utils/youtube';

import type { MapItemResponse } from '../../types/map';

interface MapItemDetailModalProps {
    item: MapItemResponse;
    onClose: () => void;
}

export function MapItemDetailModal({
    item,
    onClose,
}: MapItemDetailModalProps) {
    useEffect(() => {
        const previousOverflow = document.body.style.overflow;
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = previousOverflow;
        };
    }, [onClose]);

    const title =
        item.title?.trim() || MAP_MANAGE_PAGE_COPY.SONG_TITLE_FALLBACK;
    const videoId =
        item.videoId?.trim() || extractYouTubeVideoId(item.youtubeUrl);
    const embedUrl = videoId
        ? createYouTubeEmbedUrl(videoId, item.startTime)
        : null;
    const titleId = `map-item-detail-title-${item.id}`;
    const descriptionId = `map-item-detail-description-${item.id}`;

    const handleContentMouseDown = (event: MouseEvent<HTMLDivElement>) => {
        event.stopPropagation();
    };

    return (
        <div
            role="presentation"
            onMouseDown={onClose}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/65 px-4 py-8"
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={descriptionId}
                onMouseDown={handleContentMouseDown}
                className="flex max-h-[calc(100vh-64px)] w-full max-w-[700px] flex-col overflow-hidden rounded-2xl border border-[var(--monomat-border-card)] bg-white shadow-[0_18px_48px_rgba(15,23,42,0.25)]"
            >
                <header className="flex min-h-[70px] shrink-0 items-center border-b border-[var(--monomat-border-card)] px-5">
                    <div className="min-w-0 flex-1">
                        <h2
                            id={titleId}
                            className="!m-0 truncate !text-base !font-semibold !leading-5 !text-black"
                        >
                            {title}
                        </h2>
                        <p
                            id={descriptionId}
                            className="mt-1 text-sm text-[var(--monomat-text-secondary)]"
                        >
                            {MAP_ITEM_DETAIL_MODAL_COPY.PLAY_FROM(
                                formatMapStartTime(item.startTime),
                            )}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label={
                            MAP_ITEM_DETAIL_MODAL_COPY.CLOSE_ARIA_LABEL
                        }
                        className="ml-4 h-[30px] min-w-[60px] rounded-2xl bg-[var(--monomat-page-bg)] px-3 text-[13px] font-semibold text-[var(--monomat-text-strong)] transition hover:bg-[var(--monomat-border-default)]"
                    >
                        {MAP_ITEM_DETAIL_MODAL_COPY.CLOSE}
                    </button>
                </header>

                <div className="aspect-video min-h-0 w-full bg-black">
                    {embedUrl ? (
                        <iframe
                            src={embedUrl}
                            title={MAP_ITEM_DETAIL_MODAL_COPY.IFRAME_TITLE(
                                title,
                            )}
                            className="h-full w-full border-0"
                            loading="lazy"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                        />
                    ) : item.thumbnailUrl ? (
                        <img
                            src={item.thumbnailUrl}
                            alt=""
                            className="h-full w-full object-contain"
                        />
                    ) : (
                        <div className="flex h-full min-h-[260px] items-center justify-center text-center text-sm font-medium text-white/75">
                            <div>
                                <ImageOff
                                    className="mx-auto mb-3"
                                    size={36}
                                    strokeWidth={1.5}
                                    aria-hidden="true"
                                />
                                {
                                    MAP_ITEM_DETAIL_MODAL_COPY.PREVIEW_FALLBACK
                                }
                            </div>
                        </div>
                    )}
                </div>

                <footer className="max-h-[120px] shrink-0 overflow-y-auto border-t border-[var(--monomat-border-card)] px-5 py-3 text-sm leading-5 text-[var(--monomat-text-secondary)]">
                    <span className="font-semibold">
                        {MAP_ITEM_DETAIL_MODAL_COPY.ANSWERS_LABEL} :{' '}
                    </span>
                    {item.answers.length > 0
                        ? item.answers.join(', ')
                        : MAP_ITEM_DETAIL_MODAL_COPY.EMPTY_ANSWERS}
                </footer>
            </div>
        </div>
    );
}
