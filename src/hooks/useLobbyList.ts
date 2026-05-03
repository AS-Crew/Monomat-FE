import { useQuery } from '@tanstack/react-query';
import type { Lobby } from '../types/lobby';

// 서버에서 로비 목록 데이터를 가져오는 비동기 (fetch) 함수
const fetchLobbyList = async (): Promise<Lobby[]> => {
    // 1. API 엔드포인트 ('/api/lobbies')로 데이터를 요청
    const response = await fetch('/api/lobbies');

    // 2. 응답이 정상적이지 않은 경우 (예 : 404, 500 에러) 예외를 발생시킨다.
    // 여기서 발생한 에러는 React Query가 감지하여 error 상태로 처리한다.
    if (!response.ok) {
        throw new Error('로비 목록을 불러오는 데 실패했습니다.');
    }

    // 3. 응답 데이터를 JSON 형태로 파싱하고, 미리 정의한 Lobby 타입의 배열로 반환한다.
    return response.json() as Promise<Lobby[]>;
};

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