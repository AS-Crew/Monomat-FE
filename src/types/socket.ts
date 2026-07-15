export const STOMP_ERROR_ACTIONS = [
    'RETURN_TO_LOBBY_LIST',
    'RETRY_CONNECT',
    'REFRESH_AND_RETRY',
    'RECONNECT',
    'REFRESH_TOKEN',
    'RELOGIN',
    'NONE',
] as const;

export type StompErrorAction = typeof STOMP_ERROR_ACTIONS[number];

export type StompErrorCode =
    | 'ACCESS_TOKEN_MISSING'
    | 'ACCESS_TOKEN_INVALID'
    | 'ACCESS_TOKEN_EXPIRED'
    | 'CONNECT_USER_IDENTIFIER_MISSING'
    | 'CONNECT_USER_IDENTIFIER_INVALID'
    | 'CONNECT_SESSION_SEQUENCE_FAILED'
    | 'CONNECT_WS_SESSION_ID_MISSING'
    | 'CONNECT_ONLINE_STATUS_FAILED'
    | 'CONNECT_SESSION_REVOKED'
    | 'SESSION_UNAUTHENTICATED'
    | 'SESSION_REVOKED'
    | 'LOBBY_ENTER_WS_SESSION_MISSING'
    | 'LOBBY_ENTER_SESSION_ATTRIBUTES_MISSING'
    | 'LOBBY_ENTER_SEQUENCE_MISSING'
    | 'LOBBY_NOT_FOUND'
    | 'LOBBY_FULL'
    | 'LOBBY_NOT_WAITING'
    | 'LOBBY_INVALID_CAPACITY'
    | 'LOBBY_STALE_SESSION'
    | 'LOBBY_KICKED_USER'
    | 'LOBBY_INVALID_SEQUENCE'
    | 'LOBBY_ENTER_UNKNOWN_RESULT'
    | 'LOBBY_ENTER_TEMPORARILY_UNAVAILABLE'
    | 'INTERNAL_STOMP_ERROR'
    | 'MALFORMED_STOMP_ERROR'
    | string;

export interface StompErrorPayload {
    type: 'STOMP_ERROR';
    code: StompErrorCode;
    message: string;
    action: StompErrorAction;
    recoverable: boolean;
    timestamp: string;
}

export interface SocketErrorNotice extends StompErrorPayload {
    signature: string;
}

