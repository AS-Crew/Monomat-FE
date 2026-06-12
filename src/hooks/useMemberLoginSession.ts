import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { login } from '../api/authApi';
import { ApiError } from '../api/apiError';
import { AUTH_MESSAGES } from '../constants/auth';
import { useAuthStore } from '../store/useAuthStore';

interface UseMemberLoginSessionReturn {
    loginWithAccount: (loginId: string, password: string) => Promise<void>;
    isSubmitting: boolean;
    errorMessage: string | null;
    errorField: string | null;
    clearErrorMessage: () => void;
}

function getErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message) {
        return error.message;
    }

    return AUTH_MESSAGES.LOGIN_FAILED;
}

export function useMemberLoginSession(): UseMemberLoginSessionReturn {
    const setSession = useAuthStore((state) => state.setSession);
    const navigate = useNavigate();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [errorField, setErrorField] = useState<string | null>(null);

    const clearErrorMessage = () => {
        setErrorMessage(null);
        setErrorField(null);
    };

    const loginWithAccount = async (loginId: string, password: string) => {
        const trimmedLoginId = loginId.trim();

        if (!trimmedLoginId) {
            setErrorMessage(AUTH_MESSAGES.EMPTY_LOGIN_ID);
            setErrorField('loginId');
            return;
        }

        if (!password) {
            setErrorMessage(AUTH_MESSAGES.EMPTY_PASSWORD);
            setErrorField('password');
            return;
        }

        if (isSubmitting) {
            return;
        }

        try {
            setIsSubmitting(true);
            setErrorMessage(null);
            setErrorField(null);

            const session = await login({
                loginId: trimmedLoginId,
                password,
            });

            setSession(session);
            navigate('/lobbies');
        } catch (error) {
            setErrorMessage(getErrorMessage(error));
            setErrorField(error instanceof ApiError ? error.field ?? null : null);
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        loginWithAccount,
        isSubmitting,
        errorMessage,
        errorField,
        clearErrorMessage,
    };
}
