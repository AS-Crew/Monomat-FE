import { CREATE_LOBBY_POLICY } from '../constants/lobby';

export function hasValidLobbyMapSongCount(
    mapNumOfSong?: number | null,
): mapNumOfSong is number {
    return typeof mapNumOfSong === 'number' && mapNumOfSong > 0;
}

export function getLobbyQuestionCountMax(
    mapNumOfSong?: number | null,
): number {
    if (!hasValidLobbyMapSongCount(mapNumOfSong)) {
        return CREATE_LOBBY_POLICY.MAX_QUESTION_COUNT;
    }

    return mapNumOfSong;
}

export function clampLobbyQuestionCount(
    questionCount: number,
    mapNumOfSong?: number | null,
): number {
    return Math.min(
        Math.max(
            questionCount,
            CREATE_LOBBY_POLICY.MIN_QUESTION_COUNT,
        ),
        getLobbyQuestionCountMax(mapNumOfSong),
    );
}

export function normalizeLobbyQuestionCountInput(
    inputValue: string,
    mapNumOfSong?: number | null,
    fallbackQuestionCount: number = CREATE_LOBBY_POLICY.MIN_QUESTION_COUNT,
): number {
    const parsedValue = Number(inputValue);

    if (!Number.isFinite(parsedValue)) {
        return clampLobbyQuestionCount(
            fallbackQuestionCount,
            mapNumOfSong,
        );
    }

    return clampLobbyQuestionCount(
        Math.trunc(parsedValue),
        mapNumOfSong,
    );
}
