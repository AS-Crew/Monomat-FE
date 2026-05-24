import { type FormEvent } from 'react';

import {
    AUTH_LABELS,
    REGISTER_POLICY,
} from '../../constants/auth';

interface RegisterFormProps {
    loginId: string;
    password: string;
    passwordConfirm: string;
    nickname: string;
    isSubmitting: boolean;
    errorMessage: string | null;
    onLoginIdChange: (value: string) => void;
    onPasswordChange: (value: string) => void;
    onPasswordConfirmChange: (value: string) => void;
    onNicknameChange: (value: string) => void;
    onSubmit: () => void;
    onLoginClick: () => void;
}

function MonomatLogoMark() {
    return (
        <svg
            aria-hidden
            className="h-[37px] w-[37px] shrink-0"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <rect
                x="1.5"
                y="1.5"
                width="45"
                height="45"
                rx="11"
                fill="#FEFEFE"
                stroke="#3873E5"
                strokeWidth="3"
            />
            <path
                d="M20.25 8.95C18.75 8.08 16.88 9.16 16.88 10.89V25.11C16.88 26.84 18.75 27.92 20.25 27.05L32.58 19.94C34.08 19.07 34.08 16.93 32.58 16.06L20.25 8.95Z"
                fill="#3873E5"
            />
            <rect x="11" y="31" width="3.5" height="9" rx="1.75" fill="#3873E5" />
            <rect x="18" y="28" width="3.5" height="12" rx="1.75" fill="#3873E5" />
            <rect x="26" y="32" width="3.5" height="9" rx="1.75" fill="#3873E5" />
            <rect x="33.75" y="30" width="3.5" height="10" rx="1.75" fill="#3873E5" />
        </svg>
    );
}

function RegisterErrorMessage({ message }: { message: string | null }) {
    if (!message) {
        return null;
    }

    return (
        <div
            role="alert"
            className="mb-[10px] min-h-[31px] rounded-md bg-[#FFEAEC] px-3 py-[9px] text-left text-[11px] font-medium leading-[13px] text-[#FD2B48]"
        >
            {message}
        </div>
    );
}

export function RegisterForm({
    loginId,
    password,
    passwordConfirm,
    nickname,
    isSubmitting,
    errorMessage,
    onLoginIdChange,
    onPasswordChange,
    onPasswordConfirmChange,
    onNicknameChange,
    onSubmit,
    onLoginClick,
}: RegisterFormProps) {
    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onSubmit();
    };

    return (
        <div className="w-full max-w-[480px] min-w-0 rounded-2xl bg-white px-10 pb-[22px] pt-[29px] text-[var(--monomat-text-strong)] shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
            <div className="mx-auto flex h-[37px] w-[170px] items-center justify-center gap-[10px]">
                <MonomatLogoMark />
                <span className="text-[28px] font-extrabold leading-none text-black">
                    Monomat
                </span>
            </div>

            <header className="mt-[11px] text-center">
                <h2 className="m-0 text-xl font-bold leading-10 !text-[var(--monomat-text-strong)]">
                    {AUTH_LABELS.SIGNUP}
                </h2>
                <p className="text-sm font-normal leading-5 text-[var(--monomat-text-muted)]">
                    {AUTH_LABELS.SIGNUP_DESCRIPTION}
                </p>
            </header>

            <form onSubmit={handleSubmit} className="mt-[15px] min-w-0 text-left">
                <RegisterErrorMessage message={errorMessage} />

                <label
                    htmlFor="register-login-id"
                    className="mb-[5px] block text-sm font-medium leading-[17px] text-black"
                >
                    {AUTH_LABELS.LOGIN_ID}
                </label>
                <input
                    id="register-login-id"
                    type="text"
                    value={loginId}
                    maxLength={REGISTER_POLICY.LOGIN_ID_MAX_LENGTH}
                    autoFocus
                    disabled={isSubmitting}
                    placeholder={AUTH_LABELS.REGISTER_LOGIN_ID_PLACEHOLDER}
                    onChange={(event) => onLoginIdChange(event.target.value)}
                    className="h-11 w-full rounded-lg border border-[color:var(--monomat-border-input)] bg-[var(--monomat-page-bg)] px-3 text-sm text-[var(--monomat-text-strong)] outline-none transition placeholder:text-[var(--monomat-border-input)] focus:border-[color:var(--monomat-primary)] disabled:cursor-not-allowed disabled:opacity-60"
                />

                <label
                    htmlFor="register-password"
                    className="mb-[5px] mt-[15px] block text-sm font-medium leading-[17px] text-black"
                >
                    {AUTH_LABELS.PASSWORD}
                </label>
                <input
                    id="register-password"
                    type="password"
                    value={password}
                    maxLength={REGISTER_POLICY.PASSWORD_MAX_LENGTH}
                    disabled={isSubmitting}
                    placeholder={AUTH_LABELS.REGISTER_PASSWORD_PLACEHOLDER}
                    onChange={(event) => onPasswordChange(event.target.value)}
                    className="h-11 w-full rounded-lg border border-[color:var(--monomat-border-input)] bg-[var(--monomat-page-bg)] px-3 text-sm text-[var(--monomat-text-strong)] outline-none transition placeholder:text-[var(--monomat-border-input)] focus:border-[color:var(--monomat-primary)] disabled:cursor-not-allowed disabled:opacity-60"
                />

                <label
                    htmlFor="register-password-confirm"
                    className="mb-[5px] mt-[15px] block text-sm font-medium leading-[17px] text-black"
                >
                    {AUTH_LABELS.PASSWORD_CONFIRM}
                </label>
                <input
                    id="register-password-confirm"
                    type="password"
                    value={passwordConfirm}
                    maxLength={REGISTER_POLICY.PASSWORD_MAX_LENGTH}
                    disabled={isSubmitting}
                    placeholder={AUTH_LABELS.PASSWORD_CONFIRM_PLACEHOLDER}
                    onChange={(event) => onPasswordConfirmChange(event.target.value)}
                    className="h-11 w-full rounded-lg border border-[color:var(--monomat-border-input)] bg-[var(--monomat-page-bg)] px-3 text-sm text-[var(--monomat-text-strong)] outline-none transition placeholder:text-[var(--monomat-border-input)] focus:border-[color:var(--monomat-primary)] disabled:cursor-not-allowed disabled:opacity-60"
                />

                <label
                    htmlFor="register-nickname"
                    className="mb-[5px] mt-[22px] block text-sm font-medium leading-[17px] text-black"
                >
                    {AUTH_LABELS.NICKNAME}
                </label>
                <input
                    id="register-nickname"
                    type="text"
                    value={nickname}
                    maxLength={REGISTER_POLICY.NICKNAME_MAX_LENGTH}
                    disabled={isSubmitting}
                    placeholder={AUTH_LABELS.NICKNAME_PLACEHOLDER}
                    onChange={(event) => onNicknameChange(event.target.value)}
                    className="h-11 w-full rounded-lg border border-[color:var(--monomat-border-input)] bg-[var(--monomat-page-bg)] px-3 text-sm text-[var(--monomat-text-strong)] outline-none transition placeholder:text-[var(--monomat-border-input)] focus:border-[color:var(--monomat-primary)] disabled:cursor-not-allowed disabled:opacity-60"
                />

                <div className="mt-[25px] h-px w-full bg-[var(--monomat-border-default)]" />

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-3 h-12 w-full min-w-0 rounded-lg bg-[var(--monomat-primary)] px-3 text-[15px] font-bold leading-5 text-white transition hover:bg-[var(--monomat-primary-hover)] disabled:cursor-not-allowed disabled:bg-[var(--monomat-primary-disabled)]"
                >
                    {isSubmitting
                        ? AUTH_LABELS.SIGNUP_SUBMITTING
                        : AUTH_LABELS.SIGNUP}
                </button>
            </form>

            <footer className="mt-[14px] flex h-6 min-w-0 items-center justify-between gap-4 text-[13px] leading-4">
                <span className="min-w-0 break-keep text-[var(--monomat-text-muted)]">
                    {AUTH_LABELS.ALREADY_HAVE_ACCOUNT}
                </span>

                <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={onLoginClick}
                    className="font-semibold text-[var(--monomat-primary)] underline underline-offset-2 transition hover:text-[var(--monomat-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {AUTH_LABELS.LOGIN}
                </button>
            </footer>
        </div>
    );
}
