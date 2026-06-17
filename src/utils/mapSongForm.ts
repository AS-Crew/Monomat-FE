import { MAP_CREATE_POLICY } from '../constants/map';
import { normalizeAnswerList } from './answerNormalizer';
import { getMapCreateTimingError } from './mapCreateTiming';

import type {
    CreateMapWithItemsItemRequest,
    CreateMapSongFormState,
} from '../types/map';

export function isValidMapSongForm(song: CreateMapSongFormState) {
    const startTime = Number(song.startTime);
    const normalizedAnswers = normalizeAnswerList(song.answers);
    const timingError = getMapCreateTimingError(
        song.startTime,
        song.videoDurationSeconds,
        song.playDurationSeconds ??
            MAP_CREATE_POLICY.API_FALLBACK_PLAY_DURATION_SECONDS,
    );

    return (
        song.youtubeUrl.trim().length > 0 &&
        song.youtubeUrl.trim().length <=
            MAP_CREATE_POLICY.YOUTUBE_URL_MAX_LENGTH &&
        song.hint.trim().length > 0 &&
        song.hint.trim().length <= MAP_CREATE_POLICY.HINT_MAX_LENGTH &&
        song.startTime.trim().length > 0 &&
        Number.isInteger(startTime) &&
        startTime >= MAP_CREATE_POLICY.MIN_START_TIME_SECONDS &&
        timingError == null &&
        normalizedAnswers.length >= MAP_CREATE_POLICY.MIN_ANSWER_COUNT &&
        normalizedAnswers.length <= MAP_CREATE_POLICY.MAX_ANSWER_COUNT &&
        normalizedAnswers.every(
            (answer) =>
                answer.length <= MAP_CREATE_POLICY.ANSWER_MAX_LENGTH,
        )
    );
}

export function createMapItemRequestFromSong(
    song: CreateMapSongFormState,
    orderNum: number,
): CreateMapWithItemsItemRequest {
    const hintTime = song.hintTime;
    const hasValidHintTime =
        typeof hintTime === 'number' &&
        Number.isInteger(hintTime) &&
        hintTime >= MAP_CREATE_POLICY.MIN_HINT_TIME_SECONDS &&
        hintTime <= MAP_CREATE_POLICY.MAX_HINT_TIME_SECONDS;

    return {
        orderNum,
        youtubeUrl: song.youtubeUrl.trim(),
        startTime: Number(song.startTime),
        answers: song.answers
            .map((answer) => answer.trim())
            .filter(Boolean),
        hint: song.hint.trim(),
        ...(hasValidHintTime ? { hintTime } : {}),
    };
}
