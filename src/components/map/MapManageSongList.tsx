import { ImageOff } from 'lucide-react';

import { MAP_MANAGE_PAGE_COPY } from '../../constants/map';
import {
    formatMapAnswerCount,
    formatMapStartTime,
} from '../../utils/mapFormat';

import type { MapItemResponse } from '../../types/map';

interface MapManageSongListProps {
    items: MapItemResponse[];
    onItemClick: (item: MapItemResponse) => void;
}

function getItemTitle(item: MapItemResponse) {
    return (
        item.answers[0]?.trim() || MAP_MANAGE_PAGE_COPY.SONG_TITLE_FALLBACK
    );
}

function getItemDescription(item: MapItemResponse) {
    return (
        item.hint.trim() ||
        item.artist?.trim() ||
        MAP_MANAGE_PAGE_COPY.SONG_DESCRIPTION_FALLBACK
    );
}

export function MapManageSongList({
    items,
    onItemClick,
}: MapManageSongListProps) {
    const sortedItems = [...items].sort(
        (first, second) => first.orderNum - second.orderNum,
    );

    if (sortedItems.length === 0) {
        return (
            <div className="flex min-h-[180px] items-center justify-center rounded-2xl bg-white px-6 text-center text-sm font-medium text-[var(--monomat-text-muted)] shadow-[0_4px_16px_rgba(0,0,0,0.18)]">
                {MAP_MANAGE_PAGE_COPY.EMPTY_SONG_LIST}
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-2xl bg-white shadow-[0_4px_16px_rgba(0,0,0,0.18)]">
            {sortedItems.map((item, index) => {
                const title = getItemTitle(item);

                return (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => onItemClick(item)}
                        aria-label={MAP_MANAGE_PAGE_COPY.SONG_ROW_ARIA_LABEL(
                            title,
                        )}
                        className="group flex min-h-[107px] w-full items-center border-b border-[var(--monomat-border-card)] bg-white px-[15px] text-left transition last:border-b-0 hover:bg-[var(--monomat-page-bg)] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--monomat-primary)]"
                    >
                        <span className="w-[50px] shrink-0 text-center font-mono text-sm font-semibold text-[var(--monomat-text-secondary)]">
                            {String(index + 1).padStart(2, '0')}
                        </span>

                        <span className="flex h-20 w-[130px] shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#D9D9D9] text-[var(--monomat-text-muted)]">
                            {item.thumbnailUrl ? (
                                <img
                                    src={item.thumbnailUrl}
                                    alt=""
                                    className="h-full w-full object-cover"
                                    loading="lazy"
                                />
                            ) : (
                                <span className="text-center text-[11px] font-medium">
                                    <ImageOff
                                        className="mx-auto mb-1"
                                        size={22}
                                        strokeWidth={1.7}
                                        aria-hidden="true"
                                    />
                                    {
                                        MAP_MANAGE_PAGE_COPY.THUMBNAIL_FALLBACK
                                    }
                                </span>
                            )}
                        </span>

                        <span className="ml-[15px] min-w-0 flex-1">
                            <span className="block truncate text-base font-semibold leading-7 text-black">
                                {title}
                            </span>
                            <span className="mt-1 block truncate text-sm font-medium text-[var(--monomat-text-secondary)]">
                                {getItemDescription(item)}
                            </span>
                        </span>

                        <span className="ml-5 flex shrink-0 items-center gap-4 text-sm font-medium text-[var(--monomat-text-secondary)]">
                            <span>{formatMapStartTime(item.startTime)}</span>
                            <span>
                                {formatMapAnswerCount(item.answers.length)}
                            </span>
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
