import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { loginAsGuest } from '../api/authApi';
import { ApiError } from '../api/apiError';
import { AUTH_MESSAGES } from '../constants/auth';
import { useAuthStore } from '../store/useAuthStore';
import { validateGuestNickname } from '../utils/validateNickname';

interface UseGuestSessionReturn {
    createGuestSession: (nickname: string) => Promise<void>;
    isSubmitting: boolean;
    errorMessage: string | null;
    errorField: string | null;
    clearErrorMessage: () => void;
}

function getErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message) {
        return error.message;
    }

    return AUTH_MESSAGES.GUEST_LOGIN_FAILED;
}

export function useGuestSession(): UseGuestSessionReturn {
    const setSession = useAuthStore((state) => state.setSession);
    const navigate = useNavigate();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [errorField, setErrorField] = useState<string | null>(null);

    const clearErrorMessage = () => {
        setErrorMessage(null);
        setErrorField(null);
    };

    const createGuestSession = async (nickname: string) => {
        const trimmedNickname = nickname.trim();
        const validationMessage = validateGuestNickname(trimmedNickname);

        if (validationMessage) {
            setErrorMessage(validationMessage);
            setErrorField('nickname');
            return;
        }

        if (isSubmitting) {
            return;
        }

        try {
            setIsSubmitting(true);
            setErrorMessage(null);
            setErrorField(null);

            const session = await loginAsGuest({
                nickname: trimmedNickname,
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
        createGuestSession,
        isSubmitting,
        errorMessage,
        errorField,
        clearErrorMessage,
    };
}
