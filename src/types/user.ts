import type { UserType } from './auth';

export type UserStatus = 'ACTIVE' | 'BANNED' | 'DELETED';

export interface MyUserInfoResponse {
    userId: number;
    username: string;
    userType: UserType;
    status: UserStatus;
    createdAt: string;
}

export interface UpdateNicknameRequest {
    username: string;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
    newPasswordConfirm: string;
}
