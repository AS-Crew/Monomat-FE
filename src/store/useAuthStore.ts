import { create } from 'zustand';
import { z } from 'zod';

import { STORAGE_KEYS, SESSION_EXPIRY_MS } from '../constants/storage';

import type { GuestSession } from '../types/auth';

const guestSessionSchema = z.object({
    uuid: z.uuid({ error: '유효하지 않은 UUID 형식입니다.' }),
    nickname: z
        .string()
        .min(1, { error: '닉네임은 최소 1자 이상이어야 합니다.' })
        .max(12, { error: '닉네임은 12자 이내여야 합니다.' }),
    createdAt: z.number().refine(
        (time) => Date.now() - time <= SESSION_EXPIRY_MS,
        {
            error: `세션이 만료되었습니다. (기준: ${
                SESSION_EXPIRY_MS / (1000 * 60 * 60 * 24)
            }일)`,
        },
    ),
}) satisfies z.ZodType<GuestSession>;

interface AuthState {
    uuid: string | null;
    nickname: string | null;
    isGuest: boolean;
    isHydrated: boolean;
    setSession: (uuid: string, nickname: string) => void;
    clearSession: () => void;
    initializeSession: () => void;
    updateNickname: (nickname: string) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    uuid: null,
    nickname: null,
    isGuest: false,
    isHydrated: false,

    setSession: (uuid, nickname) => {
        set({
            uuid,
            nickname,
            isGuest: true,
            isHydrated: true,
        });
    },

    clearSession: () => {
        localStorage.removeItem(STORAGE_KEYS.GUEST_SESSION);

        set({
            uuid: null,
            nickname: null,
            isGuest: false,
            isHydrated: true,
        });
    },

    updateNickname: (nickname) => {
        const trimmedNickname = nickname.trim();
        const { uuid } = get();

        if (!uuid || !trimmedNickname) {
            return;
        }

        try {
            const storedData = localStorage.getItem(STORAGE_KEYS.GUEST_SESSION);
            const parsedData = storedData
                ? (JSON.parse(storedData) as Partial<GuestSession>)
                : null;

            const nextSession: GuestSession = {
                uuid,
                nickname: trimmedNickname,
                createdAt:
                    typeof parsedData?.createdAt === 'number'
                        ? parsedData.createdAt
                        : Date.now(),
            };

            localStorage.setItem(
                STORAGE_KEYS.GUEST_SESSION,
                JSON.stringify(nextSession),
            );

            set({
                nickname: trimmedNickname,
            });
        } catch (error) {
            console.error('[useAuthStore] 닉네임 변경 저장 실패:', error);

            set({
                nickname: trimmedNickname,
            });
        }
    },

    initializeSession: () => {
        try {
            const storedData = localStorage.getItem(STORAGE_KEYS.GUEST_SESSION);

            if (!storedData) {
                set({ isHydrated: true });
                return;
            }

            const parsed = JSON.parse(storedData) as unknown;
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
                console.warn(
                    '세션 무효화 (오염 또는 만료):',
                    z.treeifyError(result.error),
                );

                localStorage.removeItem(STORAGE_KEYS.GUEST_SESSION);
                set({ isHydrated: true });
            }
        } catch (error) {
            console.error('세션 파싱 중 오류 발생:', error);

            localStorage.removeItem(STORAGE_KEYS.GUEST_SESSION);
            set({ isHydrated: true });
        }
    },
}));