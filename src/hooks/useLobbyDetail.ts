import { useQuery } from '@tanstack/react-query';

import { getLobbyDetail } from '../api/lobbyApi';

import type { LobbyDetailResponse } from '../types/lobby';

export const lobbyDetailQueryKey = (inviteCode: string) => [
    'lobbyDetail',
    inviteCode,
] as const;

export function useLobbyDetail(inviteCode: string | undefined) {
    const normalizedInviteCode = inviteCode?.trim() ?? '';

    return useQuery<LobbyDetailResponse>({
        queryKey: lobbyDetailQueryKey(normalizedInviteCode),
        queryFn: () => getLobbyDetail(normalizedInviteCode),
        enabled: normalizedInviteCode.length > 0,
    });
}

