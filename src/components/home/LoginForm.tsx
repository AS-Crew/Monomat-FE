import { type FormEvent } from 'react';

import { AUTH_LABELS } from '../../constants/auth';
import { AuthFieldHeader } from './AuthErrorMessage';

interface LoginFormProps {
    loginId: string;
    password: string;
    autoLogin: boolean;
    isSubmitting: boolean;
    errorMessage: string | null;
    errorField: string | null;
    onLoginIdChange: (value: string) => void;
    onPasswordChange: (value: string) => void;
    onAutoLoginChange: (value: boolean) => void;
    onSubmit: () => void;
}

export function LoginForm({
    loginId,
    password,
    autoLogin,
    isSubmitting,
    errorMessage,
    errorField,
    onLoginIdChange,
    onPasswordChange,
    onAutoLoginChange,
    onSubmit,
}: LoginFormProps) {
    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onSubmit();
    };
    const loginIdError = errorField === 'loginId' ? errorMessage : null;
    const passwordError = errorField === 'password' ? errorMessage : null;

    return (
        <form onSubmit={handleSubmit} className="min-w-0 text-left">
            <AuthFieldHeader
                htmlFor="login-id"
                label={AUTH_LABELS.LOGIN_ID}
                errorMessage={loginIdError}
            />
            <input
                id="login-id"
                type="text"
                value={loginId}
                autoFocus
                disabled={isSubmitting}
                placeholder={AUTH_LABELS.LOGIN_ID_PLACEHOLDER}
                onChange={(event) => onLoginIdChange(event.target.value)}
                className="h-11 w-full min-w-0 rounded-lg border border-[color:var(--monomat-border-input)] bg-[var(--monomat-page-bg)] px-5 text-sm font-medium text-[var(--monomat-text-strong)] outline-none transition placeholder:text-[var(--monomat-border-input)] focus:border-[color:var(--monomat-primary)] disabled:cursor-not-allowed disabled:opacity-60"
            />

            <div className="mt-[27px]" />
            <AuthFieldHeader
                htmlFor="login-password"
                label={AUTH_LABELS.PASSWORD}
                errorMessage={passwordError}
            />
            <input
                id="login-password"
                type="password"
                value={password}
                disabled={isSubmitting}
                placeholder={AUTH_LABELS.PASSWORD_PLACEHOLDER}
                onChange={(event) => onPasswordChange(event.target.value)}
                className="h-11 w-full min-w-0 rounded-lg border border-[color:var(--monomat-border-input)] bg-[var(--monomat-page-bg)] px-5 text-sm font-medium text-[var(--monomat-text-strong)] outline-none transition placeholder:text-[var(--monomat-border-input)] focus:border-[color:var(--monomat-primary)] disabled:cursor-not-allowed disabled:opacity-60"
            />

            <label className="mt-[22px] flex h-4 items-center gap-[6px] text-xs font-medium text-[var(--monomat-text-muted)]">
                <input
                    type="checkbox"
                    checked={autoLogin}
                    disabled={isSubmitting}
                    onChange={(event) => onAutoLoginChange(event.target.checked)}
                    className="h-4 w-4 rounded border-[color:var(--monomat-border-input)] accent-[var(--monomat-primary)] disabled:cursor-not-allowed"
                />
                {AUTH_LABELS.AUTO_LOGIN}
            </label>

            <button
                type="submit"
                disabled={isSubmitting}
                className="mt-[27px] min-h-12 w-full min-w-0 rounded-lg bg-[var(--monomat-primary)] px-3 text-[15px] font-bold leading-5 text-white transition hover:bg-[var(--monomat-primary-hover)] disabled:cursor-not-allowed disabled:bg-[var(--monomat-primary-disabled)]"
            >
                {isSubmitting
                    ? AUTH_LABELS.LOGIN_SUBMITTING
                    : AUTH_LABELS.LOGIN}
            </button>
        </form>
    );
}
