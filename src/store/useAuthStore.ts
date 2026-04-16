import { create } from 'zustand';
import { z } from 'zod';

// [아키텍처 지식: 매직 넘버(Magic Number) 제거]
// 30일을 하드코딩하지 않고 상수로 빼두면, 나중에 기획이 "15일로 줄입시다"라고 했을 때 유지보수가 매우 쉬워집니다.

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * [아키텍처 지식: 런타임 타입 검증 및 비즈니스 룰 캡슐화]
 * @description Zod 스키마 내부에 데이터의 형태(Type)뿐만 아니라,
 * "30일 만료 정책"이라는 핵심 비즈니스 로직(Business Rule)까지 캡슐화합니다.
 */

const guestSessionSchema = z.object({
    uuid: z.string().uuid("유효하지 않은 UUID 형식입니다."),
    nickname: z.string().min(1).max(12, "닉네임은 1~12자 이내여야 합니다."),

    // refine(): Zod의 강력한 기능 중 하나로, 커스텀 검증 로직을 작성할 수 있습니다.
    // 기존의 optional()을 제거하여 createdAt을 필수로 만들고, 현재 시간과 비교합니다.
    createdAt: z.number().refine((time) => {
        const isExpired = (Date.now() - time) > THIRTY_DAYS_MS;
        return !isExpired; // true면 검증 통과(유효함), false면 검증 실패(만료됨)
    }, { message: "세션이 30일을 초과하여 만료되었습니다." })
});

interface AuthState {
    uuid: string | null;
    nickname: string | null;
    isGuest: boolean;
    setSession: (uuid: string, nickname: string) => void;
    clearSession: () => void;
    initializeSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    uuid: null,
    nickname: null,
    isGuest: false,

    setSession: (uuid, nickname) =>
        set({ uuid, nickname, isGuest: true }),

    clearSession: () => {
        localStorage.removeItem('monomat_guest_session');
        set({ uuid: null, nickname: null, isGuest: false });
    },

    initializeSession: () => {
        try {
            const storedData = localStorage.getItem('monomat_guest_session');
            if (!storedData) return; // 저장된 데이터가 없으면 즉시 종료 (초기 방문자)

            const parsed = JSON.parse(storedData);

            // [프론트엔드 문지기 역할]
            // safeParse가 실행되는 순간, 데이터 오염 여부뿐만 아니라 30일 경과 체크까지 한 번에 수행됩니다.
            const validationResult = guestSessionSchema.safeParse(parsed);

            if (validationResult.success) {
                set({
                    uuid: validationResult.data.uuid,
                    nickname: validationResult.data.nickname,
                    isGuest: true
                });
                console.log('세션 복구 완료:', validationResult.data.nickname);
            } else {
                // 누군가 데이터를 조작했거나, 접속한 지 30일이 지나 만료된 경우 모두 이곳으로 빠집니다.
                console.warn('세션 무효화 (오염 또는 만료):', validationResult.error.format());
                // 만료된 세션을 깔끔하게 청소하여 다음 접속 시 닉네임 입력을 유도합니다.
                localStorage.removeItem('monomat_guest_session');
            }
        } catch (error) {
            console.error('세션 파싱 중 오류 발생:', error);
            localStorage.removeItem('monomat_guest_session');
        }
    }
}));