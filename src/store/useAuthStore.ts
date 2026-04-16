import { create } from 'zustand';
import { z } from 'zod';

/**
 * [아키텍처 지식: 런타임 타입 검증 (Runtime Type Validation)]
 * @description TypeScript의 타입(interface)은 컴파일 후 사라지기 때문에,
 * 실제 브라우저가 실행될 때(Runtime) localStorage에 들어있는 값이 정말 올바른 형태인지 보장하지 못합니다.
 * Zod를 사용하면 데이터가 스키마에 맞는지 실행 중에 검사하고, 오염된 데이터를 걸러낼 수 있습니다.
 */

const guestSessionSchema = z.object({
    // UUID 형식이 맞는지 정규식 수준으로 깐깐하게 검증합니다.
    uuid: z.string().uuid("유효하지 않은 UUID 형식입니다."),

    // Home.tsx의 입력창 제한(maxLength={12})과 동일한 비즈니스 룰을 적용합니다.
    nickname: z.string().min(1).max(12, "닉네임은 1~12자 이내여야 합니다."),

    // 기능명세서의 '게스트 세션 만료 정책(예: 30일)' 구현 시
    // 클라이언트 측에서 먼저 만료 여부를 판별하기 위해 사용할 타임스탬프입니다.
    createdAt: z.number().optional()
});

interface AuthState {
    uuid: string | null;
    nickname: string | null;
    isGuest: boolean;
    setSession: (uuid: string, nickname: string) => void;
    clearSession: () => void;
    initializeSession: () => void;
}

// Zustand를 이용해 전역 상태 스토어를 생성합니다.
export const useAuthStore = create<AuthState>((set) => ({
    uuid: null,
    nickname: null,
    isGuest: false,

    // 메모리에만 세션을 설정합니다. (localStorage 저장은 Home.tsx 등 컴포넌트 레벨에서 처리됨)
    setSession: (uuid, nickname) =>
        set({ uuid, nickname, isGuest: true }),

    // 로그아웃 또는 세션 만료 시 호출되어 로컬 스토리지와 메모리 상태를 모두 비웁니다.
    clearSession: () => {
        localStorage.removeItem('monomat_guest_session');
        set({ uuid: null, nickname: null, isGuest: false });
    },

    /**
     * @description App.tsx가 켜질 때 딱 한 번 실행되어 "조용한 로그인(Silent Auth)"을 수행합니다.
     */

    initializeSession: () => {
        try {
            const storedData = localStorage.getItem('monomat_guest_session');
            if (!storedData) return; // 첫 방문자: 그냥 넘어갑니다.

            const parsed = JSON.parse(storedData);

            // [방어적 프로그래밍]
            // parse() 대신 safeParse()를 사용하여, 검증 실패 시 앱이 뻗어버리는(Crash) 것을 막습니다.
            const validationResult = guestSessionSchema.safeParse(parsed);

            if (validationResult.success) {
                // 데이터가 완벽히 깨끗함: Zustand 상태에 밀어넣고 앱을 '로그인 된 상태(isGuest: true)'로 만듭니다.
                set({
                    uuid: validationResult.data.uuid,
                    nickname: validationResult.data.nickname,
                    isGuest: true
                });
                console.log('세션 복구 완료:', validationResult.data.nickname);
            } else {
                // 누군가 개발자 도구를 열고 localStorage 값을 임의로 수정했거나 데이터가 깨진 상황
                console.warn('세션 데이터 오염 감지. 스토리지를 초기화합니다:', validationResult.error.format());
                localStorage.removeItem('monomat_guest_session'); // 오염된 데이터 삭제
            }
        } catch (error) {
            // JSON 형식이 아닌 엉뚱한 문자열이 들어있어 JSON.parse() 자체가 터진 경우
            console.error('세션 파싱 중 오류 발생:', error);
            localStorage.removeItem('monomat_guest_session');
        }
    }
}));