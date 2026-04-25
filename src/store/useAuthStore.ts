import { create } from 'zustand';
import { z } from 'zod';

import { STORAGE_KEYS, SESSION_EXPIRY_MS } from '../constants/storage';

import type { GuestSession } from '../types/auth';

// localStorage에서 읽어온 데이터가 올바른 구조인지 검증하는 스키마
// 사용자가 localStorage 값을 임의로 수정했거나, 형식이 맞지 않을 때를 대비한다.
// satisfies는 이 스키마가 GuestSession 타입과 일치하는지 TypeScript가 확인하도록 한다.
// 스키마 구조와 타입 정의가 서로 어긋나면 이 줄에서 바로 에러가 발생한다.
const guestSessionSchema = z.object({
    uuid: z.uuid({ error: '유효하지 않은 UUID 형식입니다.' }),
    nickname: z
        .string()
        .min(1, { error: '닉네임은 최소 1자 이상이어야 합니다.' })
        .max(12, { error: '닉네임은 12자 이내여야 합니다.' }),
    createdAt: z.number().refine(
        (time) => Date.now() - time <= SESSION_EXPIRY_MS,
        { error: `세션이 만료되었습니다. (기준: ${SESSION_EXPIRY_MS / (1000 * 60 * 60 * 24)}일)` },
    ),
}) satisfies z.ZodType<GuestSession>;

interface AuthState {
    uuid: string | null;
    nickname: string | null;
    isGuest: boolean;
    // localStorage 데이터를 읽어오기 전과 후를 구분하는 플래그
    // 이 값이 true가 되기 전에 화면을 렌더링하면 로그인 상태가 깜빡이는 현상이 발생한다.
    isHydrated: boolean;
    setSession: (uuid: string, nickname: string) => void;
    clearSession: () => void;
    initializeSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    uuid: null,
    nickname: null,
    isGuest: false,
    isHydrated: false,

    setSession: (uuid, nickname) => {
        set({ uuid, nickname, isGuest: true, isHydrated: true });
    },

    clearSession: () => {
        // STORAGE_KEYS.GUEST_SESSION을 사용하므로 문자열 오타 위험이 없다.
        localStorage.removeItem(STORAGE_KEYS.GUEST_SESSION);
        set({ uuid: null, nickname: null, isGuest: false, isHydrated: true });
    },

    initializeSession: () => {
        try {
            const storedData = localStorage.getItem(STORAGE_KEYS.GUEST_SESSION);

            // 저장된 데이터가 없으면 신규 방문자이다.
            if (!storedData) {
                set({ isHydrated: true });
                return;
            }

            const parsed = JSON.parse(storedData) as unknown;
            // safeParse는 검증 실패 시 예외를 던지지 않고 성공/실패 결과를 반환한다.
            const result = guestSessionSchema.safeParse(parsed);

            if (result.success) {
                set({
                    uuid: result.data.uuid,
                    nickname: result.data.nickname,
                    isGuest: true,
                    isHydrated: true,
                });
                console.log('세션 복구 완료:', result.data.nickname);
            } else {
                // 데이터가 오염되었거나 만료된 경우 즉시 삭제한다.
                // z.treeifyError는 Zod v4의 기능으로, 에러를 보기 좋은 트리 형태로 출력한다.
                console.warn('세션 무효화 (오염 또는 만료):', z.treeifyError(result.error));
                localStorage.removeItem(STORAGE_KEYS.GUEST_SESSION);
                set({ isHydrated: true });
            }
        } catch (error) {
            // JSON.parse 실패 등 예기치 못한 에러를 대비한 최후의 처리이다.
            console.error('세션 파싱 중 오류 발생:', error);
            localStorage.removeItem(STORAGE_KEYS.GUEST_SESSION);
            set({ isHydrated: true });
        }
    },
}));