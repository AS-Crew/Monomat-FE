import { create } from 'zustand';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

import { WS_ENDPOINT } from '../constants/endpoints';
import { LOBBY_ROUTES } from '../constants/lobby';
import { parseStompErrorPayload } from '../schemas/stompErrorSchema';
import { refreshAuthSessionSingleFlight } from '../services/authSessionRefresh';
import { queryClient } from '../services/queryClient';
import { useAuthStore } from './useAuthStore';
import { useGameStore } from './useGameStore';

import type { IFrame, StompConfig } from '@stomp/stompjs';
import type { SocketErrorNotice, StompErrorPayload } from '../types/socket';

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

interface SocketState {
    stompClient: Client | null;
    connectionStatus: ConnectionStatus;
    lastError: SocketErrorNotice | null;
    connect: (accessToken: string | null) => Promise<void>;
    disconnect: () => Promise<void>;
    dismissError: () => void;
}

interface SocketRuntimeDependencies {
    createClient: (config: StompConfig) => Client;
    refreshSession: typeof refreshAuthSessionSingleFlight;
    invalidateQueries: () => Promise<unknown>;
    clearSession: () => void;
    resetGame: () => void;
    replaceLocation: (path: string) => void;
    defer: () => Promise<void>;
}

interface DeactivateOptions {
    clearState?: boolean;
    preserveToken?: boolean;
    intentional?: boolean;
}

interface ReplaceClientOptions {
    preserveRetryAttempt?: boolean;
}

const SOCKET_RETRY_DELAYS_MS = [1_000, 3_000, 5_000] as const;
const SOCKET_ERROR_DEDUPE_WINDOW_MS = 2_000;
const AUTHORIZATION_HEADER = 'Authorization';
const AUTH_HEADER_PREFIX = 'Bearer';
const AUTH_ENTRY_PATH = '/';
const SOCKET_GENERIC_RETRY_MESSAGE =
    'WebSocket 연결이 끊어졌습니다. 다시 연결을 시도합니다.';
const SOCKET_RETRY_EXHAUSTED_MESSAGE =
    'WebSocket 연결을 복구하지 못했습니다. 잠시 후 다시 시도해주세요.';

function createDefaultClient(config: StompConfig) {
    return new Client(config);
}

function replaceLocation(path: string) {
    if (typeof window === 'undefined') {
        return;
    }

    if (window.location.pathname === path) {
        return;
    }

    window.history.replaceState(null, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
}

const defaultDependencies: SocketRuntimeDependencies = {
    createClient: createDefaultClient,
    refreshSession: refreshAuthSessionSingleFlight,
    invalidateQueries: () => queryClient.invalidateQueries(),
    clearSession: () => useAuthStore.getState().clearSession(),
    resetGame: () => useGameStore.getState().reset(),
    replaceLocation,
    defer: () => new Promise((resolve) => setTimeout(resolve, 0)),
};

let dependencies: SocketRuntimeDependencies = defaultDependencies;
let currentClient: Client | null = null;
let currentAccessToken: string | null = null;
let currentGeneration = 0;
let intentionalDisconnect = true;
let retryAttempt = 0;
let retryTimer: ReturnType<typeof setTimeout> | null = null;
let lifecyclePromise: Promise<void> = Promise.resolve();
let recoveryPromise: Promise<void> | null = null;
let suppressCloseRetryGeneration: number | null = null;
let lastHandledError:
    | {
        signature: string;
        handledAt: number;
    }
    | null = null;

function enqueueLifecycle(task: () => Promise<void>) {
    const nextPromise = lifecyclePromise
        .catch(() => undefined)
        .then(task);

    lifecyclePromise = nextPromise.catch(() => undefined);

    return nextPromise;
}

function isCurrentGeneration(generation: number, client: Client) {
    return currentGeneration === generation && currentClient === client;
}

function clearRetryTimer() {
    if (retryTimer) {
        clearTimeout(retryTimer);
        retryTimer = null;
    }
}

function createSocketErrorNotice(
    payload: StompErrorPayload,
    signature: string,
): SocketErrorNotice {
    return {
        ...payload,
        signature,
    };
}

function setSocketError(payload: StompErrorPayload, signature: string) {
    useSocketStore.setState({
        lastError: createSocketErrorNotice(payload, signature),
    });
}

function createRetryExhaustedPayload(): StompErrorPayload {
    return {
        type: 'STOMP_ERROR',
        code: 'SOCKET_RETRY_EXHAUSTED',
        message: SOCKET_RETRY_EXHAUSTED_MESSAGE,
        action: 'NONE',
        recoverable: false,
        timestamp: new Date().toISOString(),
    };
}

async function deactivateCurrentClient(options: DeactivateOptions = {}) {
    const {
        clearState = true,
        preserveToken = false,
        intentional = true,
    } = options;
    const clientToDeactivate = currentClient;

    clearRetryTimer();
    intentionalDisconnect = intentional;
    currentGeneration += 1;
    suppressCloseRetryGeneration = null;
    currentClient = null;

    if (!preserveToken) {
        currentAccessToken = null;
    }

    useSocketStore.setState({
        stompClient: null,
        connectionStatus: clearState ? 'disconnected' : 'connecting',
    });

    if (clientToDeactivate) {
        clientToDeactivate.reconnectDelay = 0;

        try {
            await clientToDeactivate.deactivate();
        } catch (error) {
            console.warn('[Socket] STOMP Client 종료 실패:', error);
        }
    }

    if (clearState) {
        useSocketStore.setState({
            connectionStatus: 'disconnected',
        });
    }
}

function scheduleRetryWithCurrentToken(reason: string) {
    const accessToken = currentAccessToken;

    if (!accessToken || intentionalDisconnect) {
        return;
    }

    if (retryAttempt >= SOCKET_RETRY_DELAYS_MS.length) {
        clearRetryTimer();
        const payload = createRetryExhaustedPayload();
        const signature = `${currentGeneration}:${payload.code}:${payload.action}`;

        setSocketError(payload, signature);
        useSocketStore.setState({
            connectionStatus: 'disconnected',
        });
        return;
    }

    const delayMs = SOCKET_RETRY_DELAYS_MS[retryAttempt];
    retryAttempt += 1;
    clearRetryTimer();

    console.info('[Socket] 제한 재연결 예약:', {
        reason,
        attempt: retryAttempt,
        delayMs,
    });

    useSocketStore.setState({
        connectionStatus: 'connecting',
    });

    retryTimer = setTimeout(() => {
        retryTimer = null;

        const retryAccessToken = currentAccessToken;

        if (!retryAccessToken || intentionalDisconnect) {
            return;
        }

        void enqueueLifecycle(() =>
            replaceClient(retryAccessToken, {
                preserveRetryAttempt: true,
            }),
        );
    }, delayMs);
}

async function retryWithBackoff(reason: string) {
    if (!currentAccessToken) {
        return;
    }

    await deactivateCurrentClient({
        clearState: false,
        preserveToken: true,
        intentional: false,
    });

    scheduleRetryWithCurrentToken(reason);
}

async function replaceClient(
    accessToken: string,
    options: ReplaceClientOptions = {},
) {
    if (!accessToken) {
        await deactivateCurrentClient();
        return;
    }

    clearRetryTimer();

    if (!options.preserveRetryAttempt) {
        retryAttempt = 0;
    }

    await deactivateCurrentClient({
        clearState: false,
        preserveToken: false,
        intentional: true,
    });

    const generation = currentGeneration + 1;
    const client = dependencies.createClient({
        webSocketFactory: () => new SockJS(WS_ENDPOINT) as WebSocket,
        connectHeaders: {
            [AUTHORIZATION_HEADER]: `${AUTH_HEADER_PREFIX} ${accessToken}`,
        },
        reconnectDelay: 0,
        onConnect: () => {
            if (!isCurrentGeneration(generation, client)) {
                return;
            }

            retryAttempt = 0;
            clearRetryTimer();
            console.info('[Socket] 연결 성공');

            useSocketStore.setState({
                connectionStatus: 'connected',
                lastError: null,
            });
        },
        onDisconnect: () => {
            if (!isCurrentGeneration(generation, client)) {
                return;
            }

            useSocketStore.setState({
                connectionStatus: intentionalDisconnect
                    ? 'disconnected'
                    : 'connecting',
            });
        },
        onStompError: (frame: IFrame) => {
            if (!isCurrentGeneration(generation, client)) {
                return;
            }

            void handleStompError(frame, generation);
        },
        onWebSocketError: () => {
            if (!isCurrentGeneration(generation, client)) {
                return;
            }

            console.warn('[Socket] WebSocket 오류 발생');
        },
        onWebSocketClose: () => {
            if (!isCurrentGeneration(generation, client)) {
                return;
            }

            if (intentionalDisconnect) {
                useSocketStore.setState({
                    connectionStatus: 'disconnected',
                });
                return;
            }

            if (suppressCloseRetryGeneration === generation) {
                useSocketStore.setState({
                    connectionStatus: 'disconnected',
                });
                return;
            }

            const payload: StompErrorPayload = {
                type: 'STOMP_ERROR',
                code: 'WEBSOCKET_CLOSED',
                message: SOCKET_GENERIC_RETRY_MESSAGE,
                action: 'RETRY_CONNECT',
                recoverable: true,
                timestamp: new Date().toISOString(),
            };
            const signature = `${generation}:${payload.code}:${payload.action}`;

            setSocketError(payload, signature);
            scheduleRetryWithCurrentToken(payload.code);
        },
    });

    currentGeneration = generation;
    suppressCloseRetryGeneration = null;
    currentClient = client;
    currentAccessToken = accessToken;
    intentionalDisconnect = false;

    useSocketStore.setState({
        stompClient: client,
        connectionStatus: 'connecting',
    });

    client.activate();
}

async function handleRefreshTokenAction() {
    clearRetryTimer();
    await deactivateCurrentClient({
        clearState: false,
        preserveToken: true,
        intentional: true,
    });

    try {
        const nextSession = await dependencies.refreshSession();

        await replaceClient(nextSession.accessToken);
    } catch {
        await handleReloginAction();
    }
}

async function handleReloginAction() {
    clearRetryTimer();
    await deactivateCurrentClient();
    dependencies.clearSession();
    dependencies.resetGame();
    dependencies.replaceLocation(AUTH_ENTRY_PATH);
}

async function handleReturnToLobbyListAction() {
    const accessToken = currentAccessToken ?? useAuthStore.getState().accessToken;

    clearRetryTimer();
    await deactivateCurrentClient({
        clearState: false,
        preserveToken: true,
        intentional: true,
    });
    dependencies.resetGame();
    dependencies.replaceLocation(LOBBY_ROUTES.LIST);
    await dependencies.defer();

    if (accessToken) {
        await replaceClient(accessToken);
    } else {
        await deactivateCurrentClient();
    }
}

async function handleRefreshAndRetryAction() {
    await dependencies.invalidateQueries();
    await retryWithBackoff('REFRESH_AND_RETRY');
}

async function runRecovery(payload: StompErrorPayload) {
    switch (payload.action) {
        case 'REFRESH_TOKEN':
            await handleRefreshTokenAction();
            return;
        case 'RELOGIN':
            await handleReloginAction();
            return;
        case 'RETURN_TO_LOBBY_LIST':
            await handleReturnToLobbyListAction();
            return;
        case 'RECONNECT':
            await retryWithBackoff(payload.code);
            return;
        case 'RETRY_CONNECT':
            await retryWithBackoff(payload.code);
            return;
        case 'REFRESH_AND_RETRY':
            await handleRefreshAndRetryAction();
            return;
        case 'NONE':
            if (!payload.recoverable) {
                clearRetryTimer();
                await deactivateCurrentClient({
                    clearState: false,
                    preserveToken: true,
                    intentional: true,
                });
                useSocketStore.setState({
                    connectionStatus: 'disconnected',
                });
            }
            return;
    }
}

async function handleStompError(frame: IFrame, generation: number) {
    const payload = parseStompErrorPayload(frame.body);
    const signature = `${generation}:${payload.code}:${payload.action}`;
    const now = Date.now();

    if (
        lastHandledError?.signature === signature &&
        now - lastHandledError.handledAt < SOCKET_ERROR_DEDUPE_WINDOW_MS
    ) {
        return;
    }

    lastHandledError = {
        signature,
        handledAt: now,
    };

    console.warn('[Socket] STOMP 오류 수신:', {
        code: payload.code,
        action: payload.action,
        recoverable: payload.recoverable,
    });

    setSocketError(payload, signature);

    if (payload.action === 'NONE') {
        suppressCloseRetryGeneration = generation;
    }

    if (!payload.recoverable && payload.action === 'NONE') {
        clearRetryTimer();
    }

    if (recoveryPromise) {
        return recoveryPromise;
    }

    recoveryPromise = enqueueLifecycle(() => runRecovery(payload)).finally(() => {
        recoveryPromise = null;
    });

    return recoveryPromise;
}

export const useSocketStore = create<SocketState>((set, get) => ({
    stompClient: null,
    connectionStatus: 'disconnected',
    lastError: null,

    connect: (accessToken) =>
        enqueueLifecycle(async () => {
            if (!accessToken) {
                await deactivateCurrentClient();
                return;
            }

            const {
                stompClient: existingClient,
                connectionStatus,
            } = get();

            if (
                currentAccessToken === accessToken &&
                existingClient === currentClient &&
                (connectionStatus === 'connecting' ||
                    connectionStatus === 'connected')
            ) {
                return;
            }

            await replaceClient(accessToken);
        }),

    disconnect: () =>
        enqueueLifecycle(async () => {
            retryAttempt = 0;
            recoveryPromise = null;
            await deactivateCurrentClient();
        }),

    dismissError: () => {
        set({ lastError: null });
    },
}));

export function configureSocketStoreForTest(
    nextDependencies: Partial<SocketRuntimeDependencies>,
) {
    dependencies = {
        ...defaultDependencies,
        ...nextDependencies,
    };
}

export function resetSocketStoreForTest() {
    clearRetryTimer();
    dependencies = defaultDependencies;
    currentClient = null;
    currentAccessToken = null;
    currentGeneration = 0;
    intentionalDisconnect = true;
    retryAttempt = 0;
    lifecyclePromise = Promise.resolve();
    recoveryPromise = null;
    suppressCloseRetryGeneration = null;
    lastHandledError = null;
    useSocketStore.setState({
        stompClient: null,
        connectionStatus: 'disconnected',
        lastError: null,
    });
}
