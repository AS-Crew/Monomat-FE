// BE가 내려주는 userIdentifier, accessToken, refreshToken이 기준

export type UserType = 'REGISTERED' | 'GUEST';

export interface GuestLoginRequest {
    nickname: string;
}

export interface LoginRequest {
    loginId: string;
    password: string;
}

export interface RegisterRequest {
    loginId: string;
    password: string;
    nickname: string;
}

export interface AuthTokenSet {
    accessToken: string;
    accessTokenExpiresAt: string;
    refreshToken: string;
    refreshTokenExpiresAt: string;
}

export interface AuthSession extends AuthTokenSet {
    userId: number;
    nickname: string;
    userType: UserType;
    userIdentifier: string;
}

export interface RefreshSessionResponse extends AuthTokenSet {
    userId: number;
    userType: UserType;
    userIdentifier: string;
}

export interface RefreshTokenRequest {
    refreshToken: string;
}

export type RefreshTokenResponse = RefreshSessionResponse | AuthTokenSet;

export type GuestSession = AuthSession;

export type GuestLoginResponse = GuestSession;

export type LoginResponse = AuthSession;

export interface RegisterResponse {
    userId: number;
    loginId: string;
    nickname: string;
    userType: 'REGISTERED';
}

export interface AuthErrorResponse {
    code?: string;
    message: string;
    field?: 'loginId' | 'password' | 'nickname' | 'refreshToken' | null;
}
