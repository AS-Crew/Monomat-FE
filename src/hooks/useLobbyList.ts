import { useQuery } from '@tanstack/react-query';

import { fetchLobbyList } from '../api/lobbyApi';

import type { Lobby } from '../types/lobby';

/**
 * 컴포넌트에서 로비 목록 데이터를 쉽게 가져오고 상태를 관리하기 위한 커스텀 훅
 * (데이터, 로딩 상태, 에러 상태 등을 컴포넌트로 전달해 준다.)
 */
export function useLobbyList() {
    return useQuery<Lobby[]>({
        // queryKey : React Query가 캐시 데이터를 관리하기 위해 사용하는 고유 식별자 (배열)
        // 나중에 데이터를 강제로 새로고침 (invalidate)할 때 이 키값을 사용한다.
        queryKey: ['lobbies'],

        // queryFn : 실제로 데이터를 서버에서 요청해서 가져오는 함수를 지정한다.
        queryFn: fetchLobbyList,
    });
}
