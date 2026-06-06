import { MAP_CREATE_POLICY } from '../constants/map';

export interface MapCreateTiming {
    startTime: number;
    endTime: number;
}

export function getMapCreateTiming(startTime: number): MapCreateTiming {
    return {
        startTime,
        endTime:
            startTime +
            MAP_CREATE_POLICY.API_FALLBACK_PLAY_DURATION_SECONDS,
    };
}

export function getMapCreateTimingError(
    rawStartTime: string,
    videoDurationSeconds: number | null,
) {
    // 사용자 입력 단계의 UX 검증이며 최종 무결성은 BE 검증을 따른다.
    if (!rawStartTime.trim()) {
        return null;
    }

    const startTime = Number(rawStartTime);

    if (
        !Number.isInteger(startTime) ||
        startTime < MAP_CREATE_POLICY.MIN_START_TIME_SECONDS
    ) {
        return '시작 시간은 0 이상의 정수로 입력해주세요.';
    }

    const timing = getMapCreateTiming(startTime);

    if (timing.endTime <= timing.startTime) {
        return '종료 시간은 시작 시간보다 커야 합니다.';
    }

    if (
        videoDurationSeconds == null ||
        !Number.isFinite(videoDurationSeconds) ||
        videoDurationSeconds <= 0
    ) {
        return null;
    }

    if (timing.startTime >= videoDurationSeconds) {
        return `시작 시간은 영상 길이 ${Math.floor(videoDurationSeconds)}초보다 작아야 합니다.`;
    }

    if (timing.endTime > videoDurationSeconds) {
        const latestStartTime = Math.max(
            MAP_CREATE_POLICY.MIN_START_TIME_SECONDS,
            Math.floor(
                videoDurationSeconds -
                    MAP_CREATE_POLICY.API_FALLBACK_PLAY_DURATION_SECONDS,
            ),
        );

        return `현재 ${MAP_CREATE_POLICY.API_FALLBACK_PLAY_DURATION_SECONDS}초 재생 구간이 영상 길이를 넘습니다. 시작 시간을 ${latestStartTime}초 이하로 입력해주세요.`;
    }

    return null;
}
