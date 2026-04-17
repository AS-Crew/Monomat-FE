import { create } from 'zustand';
import { z } from 'zod';

// [아키텍처 지식: 매직 넘버(Magic Number) 제거]
// 시간과 관련된 하드코딩된 숫자는 가독성을 떨어뜨리고 버그를 유발합니다.
// 상수화를 통해 '게스트 세션 30일 만료 정책'이라는 도메인 규칙을 코드 레벨에서 명확히 선언합니다.
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * [아키텍처 지식: 부패 방지 계층(Anti-Corruption Layer) 및 Zod v4 적용]
 * localStorage와 같은 클라이언트 스토리지는 사용자나 악성 스크립트에 의해 언제든 변조될 수 있습니다.
 * 이 스키마는 외부의 오염된 데이터가 애플리케이션의 핵심 로직으로 침투하지 못하게 막는 방어막입니다.
 */

const guestSessionSchema = z.object({
    // Zod v4 스펙: 최상위 식별자 검증기(z.uuid)와 통합 에러 프로퍼티({ error: "..." })를 활용하여
    // 직관적이고 일관된 에러 컨트랙트를 구성합니다.
    uuid: z.uuid({ error: "유효하지 않은 UUID 형식입니다." }),
    nickname: z.string()
        .min(1, { error: "닉네임은 최소 1자 이상이어야 합니다." })
        .max(12, { error: "닉네임은 12자 이내여야 합니다." }),

    // 비즈니스 로직 캡슐화: 만료 검증 로직을 스키마 내부에 응집시킵니다.
    // 이 검증을 통과한 데이터는 '형식이 올바르고 기한이 유효한 안전한 데이터'임을 시스템 전체가 신뢰할 수 있습니다.
    createdAt: z.number().refine((time) => {
        const isExpired = (Date.now() - time) > THIRTY_DAYS_MS;
        return !isExpired;
    }, { error: "세션이 30일을 초과하여 만료되었습니다." })
});

interface AuthState {
    uuid: string | null;
    nickname: string | null;
    isGuest: boolean;
    // [아키텍처 지식: Hydration 동기화 플래그]
    // React 19 환경에서 스토리지 데이터 로드 전과 후의 렌더링 불일치(Hydration Mismatch)를 방지합니다.
    // UI 계층은 이 값이 true가 된 이후에만 게임 진입 화면이나 로그인 폼을 렌더링해야 안전합니다.
    isHydrated: boolean;
    setSession: (uuid: string, nickname: string) => void;
    clearSession: () => void;
    initializeSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    uuid: null,
    nickname: null,
    isGuest: false,
    isHydrated: false, // 최초 로드 시점에는 스토리지 확인 전이므로 무조건 false

    setSession: (uuid, nickname) => {
        // [로직 안전성 보장] 신규 유저가 진입하여 세션을 생성할 때도 동기화가 완료된 것으로 간주합니다.
        set({ uuid, nickname, isGuest: true, isHydrated: true });
    },

    clearSession: () => {
        localStorage.removeItem('monomat_guest_session');
        // 세션 데이터는 지워지지만 "스토리지가 비어있음을 확인한 상태"이므로 isHydrated는 true를 유지합니다.
        set({ uuid: null, nickname: null, isGuest: false, isHydrated: true });
    },

    initializeSession: () => {
        try {
            const storedData = localStorage.getItem('monomat_guest_session');

            // 신규 방문자거나 스토리지가 비어있는 경우
            if (!storedData) {
                set({ isHydrated: true });
                return;
            }

            const parsed = JSON.parse(storedData);
            // safeParse를 통해 검증 실패 시 예외를 던지지 않고 분기 처리
            const validationResult = guestSessionSchema.safeParse(parsed);

            if (validationResult.success) {
                // 메모리(Zustand)에 안전성이 검증된 상태만 적재합니다.
                set({
                    uuid: validationResult.data.uuid,
                    nickname: validationResult.data.nickname,
                    isGuest: true,
                    isHydrated: true
                });
                console.log('세션 복구 완료:', validationResult.data.nickname);
            } else {
                // [아키텍처 지식: Observability 극대화 및 Fail-Fast]
                // Zod v4의 z.treeifyError를 사용하여 복잡한 에러 객체를 구조화된 트리 형태로 포맷팅합니다.
                // 이는 개발 환경의 디버깅 효율을 높이고, Sentry 등의 로깅 시스템에서 컨텍스트를 파악하기 좋게 만듭니다.
                console.warn('세션 무효화 (오염 또는 만료):', z.treeifyError(validationResult.error));

                // 오염되거나 만료된 데이터는 즉시 파기하여 잘못된 상태로 앱이 동작하는 것을 선제적으로 차단합니다(자가 치유).
                localStorage.removeItem('monomat_guest_session');
                set({ isHydrated: true });
            }
        } catch (error) {
            // JSON.parse 실패 등 예기치 못한 치명적 예외가 발생할 경우를 대비한 최후의 보루(Fallback)입니다.
            console.error('세션 파싱 중 오류 발생:', error);
            localStorage.removeItem('monomat_guest_session');
            set({ isHydrated: true });
        }
    }
}));