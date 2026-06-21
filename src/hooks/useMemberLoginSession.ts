import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { login } from '../api/authApi';
import { ApiError } from '../api/apiError';
import { AUTH_ERROR_CODES, AUTH_MESSAGES } from '../constants/auth';
import { useAuthStore } from '../store/useAuthStore';

interface UseMemberLoginSessionReturn {
    loginWithAccount: (
        loginId: string,
        password: string,
        autoLogin: boolean,
    ) => Promise<void>;
    forceLoginWithAccount: (
        loginId: string,
        password: string,
        autoLogin: boolean,
    ) => Promise<void>;
    cancelConcurrentLogin: () => void;
    isSubmitting: boolean;
    isConcurrentLoginConfirmOpen: boolean;
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
    const [isConcurrentLoginConfirmOpen, setIsConcurrentLoginConfirmOpen] =
        useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [errorField, setErrorField] = useState<string | null>(null);
    const isRequestInFlightRef = useRef(false);

    const clearErrorMessage = () => {
        setErrorMessage(null);
        setErrorField(null);
    };

    const completeLogin = async (
        loginId: string,
        password: string,
        force: boolean,
        autoLogin: boolean,
    ) => {
        const session = await login({
            loginId,
            password,
            force,
        });

        setSession(session, {
            storageStrategy: autoLogin ? 'local' : 'session',
        });
        navigate('/lobbies');
    };

    const loginWithAccount = async (
        loginId: string,
        password: string,
        autoLogin: boolean,
    ) => {
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

        if (
            isRequestInFlightRef.current ||
            isConcurrentLoginConfirmOpen
        ) {
            return;
        }

        try {
            isRequestInFlightRef.current = true;
            setIsSubmitting(true);
            setErrorMessage(null);
            setErrorField(null);

            await completeLogin(trimmedLoginId, password, false, autoLogin);
        } catch (error) {
            if (
                error instanceof ApiError &&
                error.code === AUTH_ERROR_CODES.CONCURRENT_LOGIN_REJECTED
            ) {
                setIsConcurrentLoginConfirmOpen(true);
                return;
            }

            setErrorMessage(getErrorMessage(error));
            setErrorField(error instanceof ApiError ? error.field ?? null : null);
        } finally {
            isRequestInFlightRef.current = false;
            setIsSubmitting(false);
        }
    };

    const forceLoginWithAccount = async (
        loginId: string,
        password: string,
        autoLogin: boolean,
    ) => {
        if (
            !isConcurrentLoginConfirmOpen ||
            isRequestInFlightRef.current
        ) {
            return;
        }

        try {
            isRequestInFlightRef.current = true;
            setIsSubmitting(true);
            setErrorMessage(null);
            setErrorField(null);

            await completeLogin(loginId.trim(), password, true, autoLogin);
        } catch (error) {
            setIsConcurrentLoginConfirmOpen(false);
            setErrorMessage(getErrorMessage(error));
            setErrorField(error instanceof ApiError ? error.field ?? null : null);
        } finally {
            isRequestInFlightRef.current = false;
            setIsSubmitting(false);
        }
    };

    const cancelConcurrentLogin = () => {
        if (isRequestInFlightRef.current) {
            return;
        }

        setIsConcurrentLoginConfirmOpen(false);
    };

    return {
        loginWithAccount,
        forceLoginWithAccount,
        cancelConcurrentLogin,
        isSubmitting,
        isConcurrentLoginConfirmOpen,
        errorMessage,
        errorField,
        clearErrorMessage,
    };
}
