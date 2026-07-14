import { cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useSocket } from '../hooks/useSocket';
import { useAuthStore } from './useAuthStore';
import {
    configureSocketStoreForTest,
    resetSocketStoreForTest,
    useSocketStore,
} from './useSocketStore';

import type { IFrame, StompConfig } from '@stomp/stompjs';
import type { AuthSession } from '../types/auth';

class MockStompClient {
    active = false;
    reconnectDelay = -1;
    deactivate = vi.fn(async () => {
        this.active = false;
    });
    activate = vi.fn(() => {
        this.active = true;
    });
    publish = vi.fn();
    subscribe = vi.fn(() => ({
        unsubscribe: vi.fn(),
    }));

    constructor(readonly config: StompConfig) {
        this.reconnectDelay = config.reconnectDelay ?? -1;
    }
}

const createClientMock = vi.fn((config: StompConfig) =>
    new MockStompClient(config) as never,
);
const refreshSessionMock = vi.fn<() => Promise<AuthSession>>();
const invalidateQueriesMock = vi.fn<() => Promise<unknown>>();
const clearSessionMock = vi.fn();
const resetGameMock = vi.fn();
const replaceLocationMock = vi.fn();

function createSession(accessToken: string): AuthSession {
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

function getClient(index: number) {
    return createClientMock.mock.results[index]?.value as MockStompClient;
}

function createErrorFrame(
    code: string,
    action: string,
    recoverable: boolean,
): IFrame {
    return {
        body: JSON.stringify({
            type: 'STOMP_ERROR',
            code,
            message: `${code} message`,
            action,
            recoverable,
            timestamp: '2026-07-14T00:00:00Z',
        }),
        headers: {},
    } as IFrame;
}

async function flushAsync() {
    for (let index = 0; index < 10; index += 1) {
        await Promise.resolve();
    }
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

function SocketHarness() {
    useSocket();
    return null;
}

beforeEach(() => {
    vi.useFakeTimers();
    createClientMock.mockClear();
    refreshSessionMock.mockReset();
    invalidateQueriesMock.mockReset();
    clearSessionMock.mockClear();
    resetGameMock.mockClear();
    replaceLocationMock.mockClear();
    invalidateQueriesMock.mockResolvedValue(undefined);
    resetSocketStoreForTest();
    configureSocketStoreForTest({
        createClient: createClientMock,
        refreshSession: refreshSessionMock,
        invalidateQueries: invalidateQueriesMock,
        clearSession: clearSessionMock,
        resetGame: resetGameMock,
        replaceLocation: replaceLocationMock,
        defer: () => Promise.resolve(),
    });
    useAuthStore.setState({
        ...createSession('access-token'),
        isGuest: false,
        isHydrated: true,
    });
});

afterEach(() => {
    cleanup();
    resetSocketStoreForTest();
    resetAuthStoreState();
    vi.useRealTimers();
});

describe('useSocketStore connection auth', () => {
    it('Access Token을 Authorization Bearer CONNECT 헤더에 넣고 userIdentifier 헤더를 제거한다', async () => {
        await useSocketStore.getState().connect('access-token');

        expect(createClientMock).toHaveBeenCalledTimes(1);
        expect(getClient(0).config.connectHeaders).toMatchObject({
            Authorization: 'Bearer access-token',
        });
        expect(getClient(0).config.connectHeaders).not.toHaveProperty(
            'userIdentifier',
        );
        expect(getClient(0).config.reconnectDelay).toBe(0);
    });

    it('Access Token이 없으면 Client를 생성하지 않는다', async () => {
        await useSocketStore.getState().connect(null);

        expect(createClientMock).not.toHaveBeenCalled();
        expect(useSocketStore.getState().connectionStatus).toBe(
            'disconnected',
        );
    });
});

describe('useSocketStore token changes', () => {
    it('같은 토큰으로 connect를 반복해도 Client를 하나만 생성한다', async () => {
        await useSocketStore.getState().connect('access-token');
        await useSocketStore.getState().connect('access-token');

        expect(createClientMock).toHaveBeenCalledTimes(1);
    });

    it('Access Token 변경 시 기존 Client를 종료하고 새 토큰으로 Client를 생성한다', async () => {
        await useSocketStore.getState().connect('access-token');
        const firstClient = getClient(0);

        await useSocketStore.getState().connect('next-token');

        expect(firstClient.deactivate).toHaveBeenCalledTimes(1);
        expect(createClientMock).toHaveBeenCalledTimes(2);
        expect(getClient(1).config.connectHeaders).toMatchObject({
            Authorization: 'Bearer next-token',
        });
    });
});

describe('useSocketStore disconnect', () => {
    it('로그아웃 시 Client와 예약된 retry timer를 정리하고 이전 close callback이 재연결하지 않는다', async () => {
        await useSocketStore.getState().connect('access-token');
        const firstClient = getClient(0);

        firstClient.config.onWebSocketClose?.({} as CloseEvent);
        await useSocketStore.getState().disconnect();
        firstClient.config.onWebSocketClose?.({} as CloseEvent);
        await vi.advanceTimersByTimeAsync(10_000);

        expect(firstClient.deactivate).toHaveBeenCalledTimes(1);
        expect(createClientMock).toHaveBeenCalledTimes(1);
        expect(useSocketStore.getState().connectionStatus).toBe(
            'disconnected',
        );
    });
});

describe('useSocketStore STOMP error recovery', () => {
    it('ACCESS_TOKEN_EXPIRED + REFRESH_TOKEN은 refresh 후 새 토큰으로 연결한다', async () => {
        refreshSessionMock.mockResolvedValue(createSession('refreshed-token'));
        await useSocketStore.getState().connect('access-token');

        getClient(0).config.onStompError?.(
            createErrorFrame('ACCESS_TOKEN_EXPIRED', 'REFRESH_TOKEN', true),
        );
        await flushAsync();

        expect(refreshSessionMock).toHaveBeenCalledTimes(1);
        expect(createClientMock).toHaveBeenCalledTimes(2);
        expect(getClient(1).config.connectHeaders).toMatchObject({
            Authorization: 'Bearer refreshed-token',
        });
    });

    it('동일 REFRESH_TOKEN 오류 반복 시 refresh와 Client 교체를 한 번만 수행한다', async () => {
        refreshSessionMock.mockResolvedValue(createSession('refreshed-token'));
        await useSocketStore.getState().connect('access-token');
        const frame = createErrorFrame(
            'ACCESS_TOKEN_EXPIRED',
            'REFRESH_TOKEN',
            true,
        );

        getClient(0).config.onStompError?.(frame);
        getClient(0).config.onStompError?.(frame);
        await flushAsync();

        expect(refreshSessionMock).toHaveBeenCalledTimes(1);
        expect(createClientMock).toHaveBeenCalledTimes(2);
    });

    it('ACCESS_TOKEN_INVALID + RELOGIN은 세션과 게임 상태를 초기화하고 /로 이동한다', async () => {
        await useSocketStore.getState().connect('access-token');

        getClient(0).config.onStompError?.(
            createErrorFrame('ACCESS_TOKEN_INVALID', 'RELOGIN', false),
        );
        await flushAsync();

        expect(clearSessionMock).toHaveBeenCalledTimes(1);
        expect(resetGameMock).toHaveBeenCalledTimes(1);
        expect(replaceLocationMock).toHaveBeenCalledWith('/');
        expect(createClientMock).toHaveBeenCalledTimes(1);
    });

    it('SESSION_REVOKED + RELOGIN은 세션을 초기화한다', async () => {
        await useSocketStore.getState().connect('access-token');

        getClient(0).config.onStompError?.(
            createErrorFrame('SESSION_REVOKED', 'RELOGIN', false),
        );
        await flushAsync();

        expect(clearSessionMock).toHaveBeenCalledTimes(1);
        expect(resetGameMock).toHaveBeenCalledTimes(1);
    });

    it('LOBBY_STALE_SESSION + RECONNECT는 제한된 횟수만 재연결한다', async () => {
        await useSocketStore.getState().connect('access-token');

        for (let index = 0; index < 4; index += 1) {
            getClient(index).config.onStompError?.(
                createErrorFrame('LOBBY_STALE_SESSION', 'RECONNECT', true),
            );
            await flushAsync();
            await vi.advanceTimersByTimeAsync(5_000);
            await flushAsync();
        }

        expect(createClientMock).toHaveBeenCalledTimes(4);
        expect(useSocketStore.getState().connectionStatus).toBe(
            'disconnected',
        );
    });

    it('RETURN_TO_LOBBY_LIST는 게임 상태를 초기화하고 /lobbies로 이동한 뒤 한 번만 복구한다', async () => {
        await useSocketStore.getState().connect('access-token');

        getClient(0).config.onStompError?.(
            createErrorFrame(
                'LOBBY_NOT_FOUND',
                'RETURN_TO_LOBBY_LIST',
                false,
            ),
        );
        await flushAsync();

        expect(resetGameMock).toHaveBeenCalledTimes(1);
        expect(replaceLocationMock).toHaveBeenCalledWith('/lobbies');
        expect(createClientMock).toHaveBeenCalledTimes(2);
    });

    it('REFRESH_AND_RETRY는 query invalidation 후 제한 재연결을 예약한다', async () => {
        await useSocketStore.getState().connect('access-token');

        getClient(0).config.onStompError?.(
            createErrorFrame(
                'LOBBY_INVALID_SEQUENCE',
                'REFRESH_AND_RETRY',
                true,
            ),
        );
        await flushAsync();

        expect(invalidateQueriesMock).toHaveBeenCalledTimes(1);
        expect(createClientMock).toHaveBeenCalledTimes(1);

        await vi.advanceTimersByTimeAsync(1_000);
        await flushAsync();

        expect(createClientMock).toHaveBeenCalledTimes(2);
    });

    it('malformed ERROR body는 throw되지 않고 fallback 오류로 제한 재연결한다', async () => {
        await useSocketStore.getState().connect('access-token');

        expect(() => {
            getClient(0).config.onStompError?.({
                body: 'not-json',
                headers: {},
            } as IFrame);
        }).not.toThrow();
        await flushAsync();

        expect(useSocketStore.getState().lastError?.code).toBe(
            'MALFORMED_STOMP_ERROR',
        );
        await vi.advanceTimersByTimeAsync(1_000);
        await flushAsync();
        expect(createClientMock).toHaveBeenCalledTimes(2);
    });
});

describe('React lifecycle', () => {
    it('mount-cleanup-mount 후 최종 활성 Client는 하나만 유지된다', async () => {
        const firstRender = render(<SocketHarness />);

        await flushAsync();
        firstRender.unmount();
        await flushAsync();
        render(<SocketHarness />);
        await flushAsync();

        const activeClients = createClientMock.mock.results
            .map((result) => result.value as MockStompClient)
            .filter((client) => client.active);

        expect(createClientMock).toHaveBeenCalledTimes(2);
        expect(activeClients).toHaveLength(1);
    });

    it('effect cleanup 이후 이전 Client callback은 현재 상태를 덮어쓰지 않는다', async () => {
        await useSocketStore.getState().connect('access-token');
        const firstClient = getClient(0);

        await useSocketStore.getState().connect('next-token');
        firstClient.config.onConnect?.({} as IFrame);

        expect(useSocketStore.getState().stompClient).toBe(getClient(1));
        expect(useSocketStore.getState().connectionStatus).toBe('connecting');
    });
});
