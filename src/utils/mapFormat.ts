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
