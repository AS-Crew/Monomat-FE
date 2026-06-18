import { fetchWithAuth } from './apiClient';
import { createApiError } from './apiError';
import { API_ENDPOINTS } from '../constants/endpoints';
import { currentGameRoundStatusSchema } from '../schemas/gameSchema';

import type { CurrentGameRoundStatus } from '../types/game';

const DEFAULT_FETCH_CURRENT_ROUND_ERROR_MESSAGE =
    '현재 게임 라운드 정보를 불러오는 데 실패했습니다.';

export async function getCurrentGameRoundStatus(
    inviteCode: string,
): Promise<CurrentGameRoundStatus> {
    const response = await fetchWithAuth(
        API_ENDPOINTS.GAME.CURRENT_ROUND(inviteCode),
    );

    if (!response.ok) {
        throw await createApiError(
            response,
            DEFAULT_FETCH_CURRENT_ROUND_ERROR_MESSAGE,
        );
    }

    const payload = await response.json() as unknown;
    const parsed = currentGameRoundStatusSchema.safeParse(payload);

    if (!parsed.success) {
        console.warn(
            '[gameApi] 현재 라운드 응답 검증 실패:',
            parsed.error,
        );
        throw new Error('현재 게임 라운드 응답 형식이 올바르지 않습니다.');
    }

    return parsed.data;
}
