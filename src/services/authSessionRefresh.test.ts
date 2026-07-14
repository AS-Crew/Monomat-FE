import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
    refreshAuthSessionSingleFlight,
    resetAuthSessionRefreshForTest,
} from './authSessionRefresh';
import { useAuthStore } from '../store/useAuthStore';

import type { AuthSession, AuthTokenSet } from '../types/auth';

const fetchMock = vi.fn<typeof fetch>();

function createMemoryStorage(): Storage {
    const values = new Map<string, string>();

    return {
        get length() {
            return values.size;
        },
        clear: vi.fn(() => {
            values.clear();
        }),
        getItem: vi.fn((key: string) => values.get(key) ?? null),
        key: vi.fn((index: number) => Array.from(values.keys())[index] ?? null),
        removeItem: vi.fn((key: string) => {
            values.delete(key);
        }),
        setItem: vi.fn((key: string, value: string) => {
            values.set(key, value);
        }),
    };
}

function installMemoryStorage() {
    Object.defineProperty(window, 'localStorage', {
        value: createMemoryStorage(),
        configurable: true,
    });
    Object.defineProperty(window, 'sessionStorage', {
        value: createMemoryStorage(),
        configurable: true,
    });
}

function createSession(accessToken = 'access-token'): AuthSession {
    return {
        userId: 1,
        nickname: 'tester',
        userType: 'REGISTERED',
        userIdentifier: '11111111-1111-4111-8111-111111111111',
        accessToken,
        accessTokenExpiresAt: '2026-07-14T00:00:00Z',
        refreshToken: 'refresh-token',
        refreshTokenExpiresAt: '2026-07-15T00:00:00Z',
    };
}

function createTokenSet(accessToken: string): AuthTokenSet {
    return {
        accessToken,
        accessTokenExpiresAt: '2026-07-16T00:00:00Z',
        refreshToken: `${accessToken}-refresh-token`,
        refreshTokenExpiresAt: '2026-07-17T00:00:00Z',
    };
}

function createJsonResponse(payload: unknown, status = 200) {
    return new Response(JSON.stringify(payload), {
        status,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}

function createDeferred<T>() {
    let resolve!: (value: T) => void;
    let reject!: (reason?: unknown) => void;
    const promise = new Promise<T>((resolvePromise, rejectPromise) => {
        resolve = resolvePromise;
        reject = rejectPromise;
    });

    return {
        promise,
        resolve,
        reject,
    };
}

function resetAuthStoreState() {
    useAuthStore.setState({
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
    });
}

beforeEach(() => {
    installMemoryStorage();
    resetAuthSessionRefreshForTest();
    resetAuthStoreState();
    window.localStorage.clear();
    window.sessionStorage.clear();
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
    resetAuthSessionRefreshForTest();
    resetAuthStoreState();
    window.localStorage.clear();
    window.sessionStorage.clear();
    fetchMock.mockReset();
    vi.unstubAllGlobals();
});

describe('refreshAuthSessionSingleFlight', () => {
    it('동시 호출은 같은 Promise와 하나의 Refresh API 호출을 공유한다', async () => {
        useAuthStore.setState({
            ...createSession(),
            isGuest: false,
            isHydrated: true,
        });
        const deferred = createDeferred<Response>();

        fetchMock.mockReturnValueOnce(deferred.promise);

        const firstPromise = refreshAuthSessionSingleFlight();
        const secondPromise = refreshAuthSessionSingleFlight();

        expect(firstPromise).toBe(secondPromise);
        expect(fetchMock).toHaveBeenCalledTimes(1);

        deferred.resolve(createJsonResponse(createTokenSet('new-access-token')));

        const [firstSession, secondSession] = await Promise.all([
            firstPromise,
            secondPromise,
        ]);

        expect(firstSession).toBe(secondSession);
        expect(firstSession.accessToken).toBe('new-access-token');
        expect(useAuthStore.getState().accessToken).toBe('new-access-token');
    });

    it('완료 후에는 refreshPromise가 정리되어 다음 호출이 새 fetch를 실행한다', async () => {
        useAuthStore.setState({
            ...createSession(),
            isGuest: false,
            isHydrated: true,
        });
        fetchMock
            .mockResolvedValueOnce(
                createJsonResponse(createTokenSet('first-new-token')),
            )
            .mockResolvedValueOnce(
                createJsonResponse(createTokenSet('second-new-token')),
            );

        const firstSession = await refreshAuthSessionSingleFlight();
        const secondSession = await refreshAuthSessionSingleFlight();

        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(firstSession.accessToken).toBe('first-new-token');
        expect(secondSession.accessToken).toBe('second-new-token');
        expect(useAuthStore.getState().accessToken).toBe('second-new-token');
    });

    it('실패 후에도 refreshPromise가 정리되어 새 세션으로 재호출할 수 있다', async () => {
        useAuthStore.setState({
            ...createSession(),
            isGuest: false,
            isHydrated: true,
        });
        const failedResponse = createJsonResponse(
            {
                code: 'SESSION_EXPIRED',
                message: '세션이 만료되었습니다.',
            },
            401,
        );

        fetchMock.mockResolvedValueOnce(failedResponse);

        const firstPromise = refreshAuthSessionSingleFlight();
        const secondPromise = refreshAuthSessionSingleFlight();

        expect(firstPromise).toBe(secondPromise);
        await expect(firstPromise).rejects.toThrow();
        await expect(secondPromise).rejects.toThrow();
        expect(useAuthStore.getState().accessToken).toBeNull();

        useAuthStore.setState({
            ...createSession('restored-access-token'),
            isGuest: false,
            isHydrated: true,
        });
        fetchMock.mockResolvedValueOnce(
            createJsonResponse(createTokenSet('recovered-access-token')),
        );

        const recoveredSession = await refreshAuthSessionSingleFlight();

        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(recoveredSession.accessToken).toBe('recovered-access-token');
        expect(useAuthStore.getState().accessToken).toBe(
            'recovered-access-token',
        );
    });

    it('REST와 STOMP가 같은 refreshAuthSessionSingleFlight import를 사용한다', () => {
        const apiClientSource = readFileSync(
            resolve(process.cwd(), 'src/api/apiClient.ts'),
            'utf8',
        );
        const socketStoreSource = readFileSync(
            resolve(process.cwd(), 'src/store/useSocketStore.ts'),
            'utf8',
        );

        expect(apiClientSource).toContain(
            "import { refreshAuthSessionSingleFlight } from '../services/authSessionRefresh';",
        );
        expect(socketStoreSource).toContain(
            "import { refreshAuthSessionSingleFlight } from '../services/authSessionRefresh';",
        );
        expect(apiClientSource).not.toContain('refreshPromise');
        expect(socketStoreSource).not.toContain('refreshPromise');
    });
});
