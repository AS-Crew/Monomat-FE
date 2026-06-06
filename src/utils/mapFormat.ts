export function formatMapPlayTime(totalPlayTime: number) {
    const safeSeconds = Math.max(0, Math.floor(totalPlayTime));
    const minutes = Math.floor(safeSeconds / 60);
    const seconds = safeSeconds % 60;

    if (minutes === 0) {
        return `${seconds}초`;
    }

    if (seconds === 0) {
        return `${minutes}분`;
    }

    return `${minutes}분 ${seconds}초`;
}

export function formatMapPlayCount(playCount: number | null | undefined) {
    if (typeof playCount !== 'number') {
        return '-';
    }

    const safePlayCount = Math.max(0, Math.floor(playCount));

    return `${safePlayCount.toLocaleString('ko-KR')}회`;
}

export function formatMapDescription(description: string | null) {
    const trimmedDescription = description?.trim();

    return trimmedDescription || '맵 설명이 없습니다.';
}

export function formatMapOwnerNickname(
    ownerNickname: string | null | undefined,
) {
    const trimmedNickname = ownerNickname?.trim();

    return trimmedNickname || '알 수 없는 제작자';
}

export function formatMapSongCount(songCount: number) {
    const safeSongCount = Math.max(0, Math.floor(songCount));

    return `${safeSongCount.toLocaleString('ko-KR')}곡`;
}

export function formatMapStartTime(startTime: number) {
    const safeSeconds = Math.max(0, Math.floor(startTime));
    const minutes = Math.floor(safeSeconds / 60);
    const seconds = safeSeconds % 60;

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function formatMapAnswerCount(answerCount: number) {
    const safeAnswerCount = Math.max(0, Math.floor(answerCount));

    return `+${safeAnswerCount} 정답`;
}

export function formatMapUpdatedAt(updatedAt: string) {
    const timestamp = new Date(updatedAt).getTime();

    if (!Number.isFinite(timestamp)) {
        return '-';
    }

    const elapsedSeconds = Math.round((timestamp - Date.now()) / 1_000);
    const absoluteSeconds = Math.abs(elapsedSeconds);
    const relativeTimeFormatter = new Intl.RelativeTimeFormat('ko-KR', {
        numeric: 'auto',
    });

    if (absoluteSeconds < 60) {
        return relativeTimeFormatter.format(elapsedSeconds, 'second');
    }

    const elapsedMinutes = Math.round(elapsedSeconds / 60);
    if (Math.abs(elapsedMinutes) < 60) {
        return relativeTimeFormatter.format(elapsedMinutes, 'minute');
    }

    const elapsedHours = Math.round(elapsedMinutes / 60);
    if (Math.abs(elapsedHours) < 24) {
        return relativeTimeFormatter.format(elapsedHours, 'hour');
    }

    const elapsedDays = Math.round(elapsedHours / 24);
    if (Math.abs(elapsedDays) < 7) {
        return relativeTimeFormatter.format(elapsedDays, 'day');
    }

    const elapsedWeeks = Math.round(elapsedDays / 7);
    if (Math.abs(elapsedWeeks) < 5) {
        return relativeTimeFormatter.format(elapsedWeeks, 'week');
    }

    const elapsedMonths = Math.round(elapsedDays / 30);
    if (Math.abs(elapsedMonths) < 12) {
        return relativeTimeFormatter.format(elapsedMonths, 'month');
    }

    return relativeTimeFormatter.format(
        Math.round(elapsedDays / 365),
        'year',
    );
}
