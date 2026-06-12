import { create } from 'zustand';

import { STORAGE_KEYS } from '../constants/storage';
import { AUTH_MESSAGES } from '../constants/auth';
import { authSessionSchema } from '../schemas/authSchema';

import type {
    AuthSession,
    UserType,
} from '../types/auth';

interface AuthState {
    userId: number | null;
    userIdentifier: string | null;
    nickname: string | null;
    userType: UserType | null;
    accessToken: string | null;
    accessTokenExpiresAt: string | null;
    refreshToken: string | null;
    refreshTokenExpiresAt: string | null;
    isGuest: boolean;
    isHydrated: boolean;
    setSession: (session: AuthSession) => void;
    clearSession: () => void;
    initializeSession: () => void;
    updateNickname: (nickname: string) => void;
}

function createSessionState(session: AuthSession) {
    return {
        userId: session.userId,
        userIdentifier: session.userIdentifier,
        nickname: session.nickname,
        userType: session.userType,
        accessToken: session.accessToken,
        accessTokenExpiresAt: session.accessTokenExpiresAt,
        refreshToken: session.refreshToken,
        refreshTokenExpiresAt: session.refreshTokenExpiresAt,
        isGuest: session.userType === 'GUEST',
        isHydrated: true,
    };
}

function createEmptyAuthState() {
    return {
        userId: null,
        userIdentifier: null,
        nickname: null,
        userType: null,
        accessToken: null,
        accessTokenExpiresAt: null,
        refreshToken: null,
        refreshTokenExpiresAt: null,
        isGuest: false,
        isHydrated: true,
    };
}

export const useAuthStore = create<AuthState>((set, get) => ({
    userId: null,
    userIdentifier: null,
    nickname: null,
    userType: null,
    accessToken: null,
    accessTokenExpiresAt: null,
    refreshToken: null,
    refreshTokenExpiresAt: null,
    isGuest: false,
    isHydrated: false,

    setSession: (session) => {
        try {
            localStorage.setItem(
                STORAGE_KEYS.GUEST_SESSION,
                JSON.stringify(session),
            );
        } catch (error) {
            // localStorage 저장 실패가 즉시 플레이를 막지는 않도록 메모리 상태는 유지한다.
            // 단, 새로고침 시 세션 복구는 실패할 수 있으므로 로그를 남긴다.
            console.error('[useAuthStore] 인증 세션 저장 실패:', error);
        }

        set(createSessionState(session));
    },

    clearSession: () => {
        localStorage.removeItem(STORAGE_KEYS.GUEST_SESSION);
        set(createEmptyAuthState());
    },

    initializeSession: () => {
        try {
            const storedData = localStorage.getItem(STORAGE_KEYS.GUEST_SESSION);

            if (!storedData) {
                set({ isHydrated: true });
                return;
            }

            const parsedData = JSON.parse(storedData) as unknown;
            const result = authSessionSchema.safeParse(parsedData);

            if (!result.success) {
                console.warn(
                    `[useAuthStore] ${AUTH_MESSAGES.SESSION_RESTORE_FAILED}`,
                    result.error,
                );

                localStorage.removeItem(STORAGE_KEYS.GUEST_SESSION);
                set(createEmptyAuthState());
                return;
            }

            set(createSessionState(result.data));
        } catch (error) {
            console.error('[useAuthStore] 세션 복구 중 오류 발생:', error);

            localStorage.removeItem(STORAGE_KEYS.GUEST_SESSION);
            set(createEmptyAuthState());
        }
    },

    updateNickname: (nickname) => {
        const trimmedNickname = nickname.trim();
        const {
            userId,
            userIdentifier,
            userType,
            accessToken,
            accessTokenExpiresAt,
            refreshToken,
            refreshTokenExpiresAt,
        } = get();

        if (
            !trimmedNickname ||
            userId == null ||
            !userIdentifier ||
            !userType ||
            !accessToken ||
            !accessTokenExpiresAt ||
            !refreshToken ||
            !refreshTokenExpiresAt
        ) {
            return;
        }

        const nextSession: AuthSession = {
            userId,
            userIdentifier,
            nickname: trimmedNickname,
            userType,
            accessToken,
            accessTokenExpiresAt,
            refreshToken,
            refreshTokenExpiresAt,
        };

        try {
            localStorage.setItem(
                STORAGE_KEYS.GUEST_SESSION,
                JSON.stringify(nextSession),
            );
        } catch (error) {
            console.error('[useAuthStore] 닉네임 변경 저장 실패:', error);
        }

        set({
            nickname: trimmedNickname,
        });
    },
}));
