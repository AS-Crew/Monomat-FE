import { useState } from 'react';

import { register } from '../api/authApi';
import { ApiError } from '../api/apiError';
import { AUTH_MESSAGES, REGISTER_POLICY } from '../constants/auth';

interface RegisterFormValues {
    loginId: string;
    password: string;
    passwordConfirm: string;
    nickname: string;
}

interface UseRegisterSessionReturn {
    registerWithAccount: (values: RegisterFormValues) => Promise<string | null>;
    isSubmitting: boolean;
    errorMessage: string | null;
    errorField: string | null;
    clearErrorMessage: () => void;
}

function getErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message) {
        return error.message;
    }

    return AUTH_MESSAGES.REGISTER_FAILED;
}

export function useRegisterSession(): UseRegisterSessionReturn {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [errorField, setErrorField] = useState<string | null>(null);

    const clearErrorMessage = () => {
        setErrorMessage(null);
        setErrorField(null);
    };

    const registerWithAccount = async ({
        loginId,
        password,
        passwordConfirm,
        nickname,
    }: RegisterFormValues) => {
        const trimmedLoginId = loginId.trim();
        const trimmedNickname = nickname.trim();

        if (!trimmedLoginId) {
            setErrorMessage(AUTH_MESSAGES.EMPTY_LOGIN_ID);
            setErrorField('loginId');
            return null;
        }

        if (
            trimmedLoginId.length < REGISTER_POLICY.LOGIN_ID_MIN_LENGTH ||
            trimmedLoginId.length > REGISTER_POLICY.LOGIN_ID_MAX_LENGTH
        ) {
            setErrorMessage(AUTH_MESSAGES.INVALID_LOGIN_ID_LENGTH);
            setErrorField('loginId');
            return null;
        }

        if (!REGISTER_POLICY.LOGIN_ID_PATTERN.test(trimmedLoginId)) {
            setErrorMessage(AUTH_MESSAGES.INVALID_LOGIN_ID_FORMAT);
            setErrorField('loginId');
            return null;
        }

        if (!password.trim()) {
            setErrorMessage(AUTH_MESSAGES.EMPTY_PASSWORD);
            setErrorField('password');
            return null;
        }

        if (
            password.length < REGISTER_POLICY.PASSWORD_MIN_LENGTH ||
            password.length > REGISTER_POLICY.PASSWORD_MAX_LENGTH
        ) {
            setErrorMessage(AUTH_MESSAGES.INVALID_PASSWORD_LENGTH);
            setErrorField('password');
            return null;
        }

        if (REGISTER_POLICY.PASSWORD_WHITESPACE_PATTERN.test(password)) {
            setErrorMessage(AUTH_MESSAGES.INVALID_PASSWORD_WHITESPACE);
            setErrorField('password');
            return null;
        }

        if (!passwordConfirm.trim()) {
            setErrorMessage(AUTH_MESSAGES.EMPTY_PASSWORD_CONFIRM);
            setErrorField('passwordConfirm');
            return null;
        }

        if (password !== passwordConfirm) {
            setErrorMessage(AUTH_MESSAGES.PASSWORD_CONFIRM_MISMATCH);
            setErrorField('passwordConfirm');
            return null;
        }

        if (!trimmedNickname) {
            setErrorMessage(AUTH_MESSAGES.EMPTY_NICKNAME);
            setErrorField('nickname');
            return null;
        }

        if (
            trimmedNickname.length < REGISTER_POLICY.NICKNAME_MIN_LENGTH ||
            trimmedNickname.length > REGISTER_POLICY.NICKNAME_MAX_LENGTH
        ) {
            setErrorMessage(AUTH_MESSAGES.INVALID_NICKNAME_LENGTH);
            setErrorField('nickname');
            return null;
        }

        if (isSubmitting) {
            return null;
        }

        try {
            setIsSubmitting(true);
            setErrorMessage(null);
            setErrorField(null);

            await register({
                loginId: trimmedLoginId,
                password,
                nickname: trimmedNickname,
            });

            return trimmedLoginId;
        } catch (error) {
            setErrorMessage(getErrorMessage(error));
            setErrorField(error instanceof ApiError ? error.field ?? null : null);
            return null;
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        registerWithAccount,
        isSubmitting,
        errorMessage,
        errorField,
        clearErrorMessage,
    };
}
