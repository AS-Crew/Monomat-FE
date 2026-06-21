import { create } from 'zustand';

import { STORAGE_KEYS } from '../constants/storage';
import { AUTH_MESSAGES } from '../constants/auth';
import { authSessionSchema } from '../schemas/authSchema';

import type {
    AuthSession,
    AuthStorageStrategy,
    SetSessionOptions,
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
    setSession: (session: AuthSession, options?: SetSessionOptions) => void;
    clearSession: () => void;
    initializeSession: () => void;
    updateNickname: (nickname: string) => void;
}

const DEFAULT_STORAGE_STRATEGY: AuthStorageStrategy = 'local';

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

function getStorage(strategy: AuthStorageStrategy): Storage | null {
    if (typeof window === 'undefined') {
        return null;
    }

    return strategy === 'local'
        ? window.localStorage
        : window.sessionStorage;
}

function getOppositeStorageStrategy(
    strategy: AuthStorageStrategy,
): AuthStorageStrategy {
    return strategy === 'local' ? 'session' : 'local';
}

function removeStoredSession(strategy: AuthStorageStrategy) {
    try {
        getStorage(strategy)?.removeItem(STORAGE_KEYS.GUEST_SESSION);
    } catch (error) {
        console.error(
            `[useAuthStore] ${strategy}Storage 인증 세션 삭제 실패:`,
            error,
        );
    }
}

function readStoredSession(
    strategy: AuthStorageStrategy,
): AuthSession | null {
    try {
        const storage = getStorage(strategy);

        if (!storage) {
            return null;
        }

        const storedData = storage.getItem(STORAGE_KEYS.GUEST_SESSION);

        if (!storedData) {
            return null;
        }

        const parsedData = JSON.parse(storedData) as unknown;
        const result = authSessionSchema.safeParse(parsedData);

        if (!result.success) {
            console.warn(
                `[useAuthStore] ${AUTH_MESSAGES.SESSION_RESTORE_FAILED}`,
                result.error,
            );
            removeStoredSession(strategy);
            return null;
        }

        return result.data;
    } catch (error) {
        console.error(
            `[useAuthStore] ${strategy}Storage 세션 복구 중 오류 발생:`,
            error,
        );
        removeStoredSession(strategy);
        return null;
    }
}

let currentStorageStrategy: AuthStorageStrategy | null = null;

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

    setSession: (session, options) => {
        const storageStrategy =
            options?.storageStrategy ??
            currentStorageStrategy ??
            DEFAULT_STORAGE_STRATEGY;

        currentStorageStrategy = storageStrategy;

        try {
            getStorage(storageStrategy)?.setItem(
                STORAGE_KEYS.GUEST_SESSION,
                JSON.stringify(session),
            );
        } catch (error) {
            // 브라우저 저장소 저장 실패가 즉시 플레이를 막지는 않도록 메모리 상태는 유지한다.
            // 단, 새로고침 시 세션 복구는 실패할 수 있으므로 로그를 남긴다.
            console.error('[useAuthStore] 인증 세션 저장 실패:', error);
        } finally {
            removeStoredSession(getOppositeStorageStrategy(storageStrategy));
        }

        set(createSessionState(session));
    },

    clearSession: () => {
        removeStoredSession('local');
        removeStoredSession('session');
        currentStorageStrategy = null;
        set(createEmptyAuthState());
    },

    initializeSession: () => {
        const localSession = readStoredSession('local');

        if (localSession) {
            removeStoredSession('session');
            currentStorageStrategy = 'local';
            set(createSessionState(localSession));
            return;
        }

        const sessionSession = readStoredSession('session');

        if (sessionSession) {
            currentStorageStrategy = 'session';
            set(createSessionState(sessionSession));
            return;
        }

        currentStorageStrategy = null;
        set(createEmptyAuthState());
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

        get().setSession(nextSession);
    },
}));
