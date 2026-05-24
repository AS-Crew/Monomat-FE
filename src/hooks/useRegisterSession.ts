import { useState } from 'react';

import { register } from '../api/authApi';
import { AUTH_MESSAGES } from '../constants/auth';

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

    const clearErrorMessage = () => {
        setErrorMessage(null);
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
            return null;
        }

        if (!password.trim()) {
            setErrorMessage(AUTH_MESSAGES.EMPTY_PASSWORD);
            return null;
        }

        if (!passwordConfirm.trim()) {
            setErrorMessage(AUTH_MESSAGES.EMPTY_PASSWORD_CONFIRM);
            return null;
        }

        if (password !== passwordConfirm) {
            setErrorMessage(AUTH_MESSAGES.PASSWORD_CONFIRM_MISMATCH);
            return null;
        }

        if (!trimmedNickname) {
            setErrorMessage(AUTH_MESSAGES.EMPTY_NICKNAME);
            return null;
        }

        if (isSubmitting) {
            return null;
        }

        try {
            setIsSubmitting(true);
            setErrorMessage(null);

            await register({
                loginId: trimmedLoginId,
                password,
                nickname: trimmedNickname,
            });

            return trimmedLoginId;
        } catch (error) {
            setErrorMessage(getErrorMessage(error));
            return null;
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        registerWithAccount,
        isSubmitting,
        errorMessage,
        clearErrorMessage,
    };
}
