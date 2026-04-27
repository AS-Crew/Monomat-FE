// 게스트 세션 생성 로직 (UUID 발급 → localStorage 저장 → Zustand 업데이트)을 하나의 커스텀 훅으로 캡슐화하여 제공한다.

import { useAuthStore } from '../store/useAuthStore';
import { generateUUID } from '../utils/uuid';
import { STORAGE_KEYS } from '../constants/storage';

/**
 * useGuestSession 훅이 반환하는 객체의 타입이다.
 * 현재는 createGuestSession 함수만 제공하지만,
 * 추후 세션 상태(isLoading, error 등)가 필요해지면 이 타입을 확장한다.
 */
interface UseGuestSessionReturn {
    /**
     * 닉네임을 받아 게스트 세션 생성의 전체 흐름을 실행
     * 성공/실패 여부와 무관하게 현재 탭에서는 게임 진행이 가능
     *
     * @param nickname - 사용자가 입력한 닉네임 (trim 전 원본값)
     */
    createGuestSession: (nickname: string) => void;
}

/**
 * 게스트 세션 생성과 관련된 비즈니스 로직을 캡슐화한 커스텀 훅
 *
 * [내부 실행 순서]
 * 1. 닉네임 유효성 검사 (빈 값 방지)
 * 2. generateUUID()로 클라이언트 측 UUID 발급
 * 3. localStorage에 세션 데이터 저장 (Graceful Reconnect 대비)
 * 4. Zustand 스토어 업데이트 (메모리 상태 반영 → ProtectedRoute 진입 허용)
 *
 * [localStorage 실패 시 전략]
 * iOS Safari 시크릿 모드 등 저장이 불가능한 환경에서도
 * 입장을 차단하지 않고 사용자에게 상황을 고지한 뒤 진행
 * Zustand 스토어(메모리)에는 정상적으로 값이 세팅되므로
 * 현재 탭에서는 게임 플레이가 가능
 */
export function useGuestSession(): UseGuestSessionReturn {
    const setSession = useAuthStore((state) => state.setSession);

    const createGuestSession = (nickname: string) => {
        const trimmedNickname = nickname.trim();

        // 1단계: 닉네임 유효성 검사
        // trim() 후 빈 문자열이면 이후 로직을 실행하지 않는다.
        if (!trimmedNickname) {
            alert('닉네임을 입력해주세요.');
            return;
        }

        // 2단계: UUID 발급
        // 브라우저 환경에 따른 분기 처리는 generateUUID() 내부에서 담당.
        // 백엔드 게스트 발급 API가 완성되면 이 호출을 API 호출로 교체할 예정.
        const guestUuid = generateUUID();

        const sessionData = {
            uuid: guestUuid,
            nickname: trimmedNickname,
            createdAt: Date.now(),
        };

        // 3단계: localStorage 저장 (Graceful Reconnect 대비)
        // 새로고침이나 브라우저 탭 재방문 시 세션을 복구하기 위해 영구 저장한다.
        // useAuthStore의 initializeSession()이 이 값을 읽어 세션을 복구한다.
        try {
            localStorage.setItem(
                STORAGE_KEYS.GUEST_SESSION,
                JSON.stringify(sessionData),
            );
            console.log('[useGuestSession] 게스트 세션 생성 완료:', trimmedNickname);
        } catch (error) {
            // 저장 실패 시에도 입장은 허용한다. (Graceful Degradation)
            // 단, 새로고침 시 세션이 사라짐을 사용자에게 명확히 고지한다.
            console.error('[useGuestSession] localStorage 저장 실패:', error);
            alert(
                '브라우저의 시크릿 모드이거나 저장 공간이 부족합니다.\n' +
                '게임은 진행할 수 있으나 새로고침 시 접속이 끊어질 수 있습니다.',
            );
        }

        // 4단계: Zustand 스토어 업데이트
        // localStorage 저장 성공 여부와 무관하게 항상 실행된다.
        // 이 호출로 인해 isGuest가 true로 바뀌고, ProtectedRoute의 진입이 허용된다.
        setSession(guestUuid, trimmedNickname);
    };

    return { createGuestSession };
}