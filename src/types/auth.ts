// BE가 내려주는 userIdentifier, accessToken, refreshToken이 기준

export type UserType = 'REGISTERED' | 'GUEST';

export interface GuestLoginRequest {
    nickname: string;
}

export interface GuestSession {
    userId: number;
    nickname: string;
    userType: UserType;
    userIdentifier: string;
    accessToken: string;
    accessTokenExpiresAt: string;
    refreshToken: string;
    refreshTokenExpiresAt: string;
}

export type GuestLoginResponse = GuestSession;