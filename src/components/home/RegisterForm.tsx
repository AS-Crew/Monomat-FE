import { type FormEvent } from 'react';

import {
    AUTH_LABELS,
    AUTH_MESSAGES,
    REGISTER_POLICY,
} from '../../constants/auth';
import { MonomatLogoMark } from '../common/MonomatLogo';

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

function isPasswordConfirmError(message: string | null) {
    return message === AUTH_MESSAGES.EMPTY_PASSWORD_CONFIRM ||
        message === AUTH_MESSAGES.PASSWORD_CONFIRM_MISMATCH;
}

function SignupDivider() {
    return (
        <div className="flex h-5 w-full items-center">
            <span className="h-px w-full bg-[var(--monomat-border-default)]" />
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
    const passwordConfirmErrorMessage = isPasswordConfirmError(errorMessage)
        ? errorMessage
        : null;
    const formErrorMessage = passwordConfirmErrorMessage
        ? null
        : errorMessage;

    return (
        <div className="min-h-[651px] w-full max-w-[480px] min-w-0 rounded-2xl bg-white px-10 pb-5 pt-[27px] text-[var(--monomat-text-strong)] shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
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
                <RegisterErrorMessage message={formErrorMessage} />

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

                <div className="mb-[5px] mt-[15px] grid min-h-[17px] min-w-0 grid-cols-[77px_minmax(0,1fr)] items-start gap-4">
                    <label
                        htmlFor="register-password-confirm"
                        className="whitespace-nowrap text-sm font-medium leading-[17px] text-black"
                    >
                        {AUTH_LABELS.PASSWORD_CONFIRM}
                    </label>

                    {passwordConfirmErrorMessage ? (
                        <p
                            role="alert"
                            className="flex h-[17px] min-w-0 items-center justify-center rounded-lg bg-[#FFEAEC] px-2 text-center text-[10px] font-medium leading-[17px] text-[#FD2B48]"
                        >
                            {passwordConfirmErrorMessage}
                        </p>
                    ) : null}
                </div>
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

                <div className="mt-[18px]">
                    <SignupDivider />
                </div>

                <label
                    htmlFor="register-nickname"
                    className="mb-[5px] mt-[9px] block text-sm font-medium leading-[17px] text-black"
                >
                    {AUTH_LABELS.NICKNAME}
                </label>
                <input
                    id="register-nickname"
                    type="text"
                    value={nickname}
                    maxLength={REGISTER_POLICY.NICKNAME_MAX_LENGTH}
                    disabled={isSubmitting}
                    placeholder={AUTH_LABELS.REGISTER_NICKNAME_PLACEHOLDER}
                    onChange={(event) => onNicknameChange(event.target.value)}
                    className="h-11 w-full rounded-lg border border-[color:var(--monomat-border-input)] bg-[var(--monomat-page-bg)] px-3 text-sm text-[var(--monomat-text-strong)] outline-none transition placeholder:text-[var(--monomat-border-input)] focus:border-[color:var(--monomat-primary)] disabled:cursor-not-allowed disabled:opacity-60"
                />

                <div className="mt-[8px]">
                    <SignupDivider />
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-[9px] h-12 w-full min-w-0 rounded-lg bg-[var(--monomat-primary)] px-3 text-[15px] font-bold leading-5 text-white transition hover:bg-[var(--monomat-primary-hover)] disabled:cursor-not-allowed disabled:bg-[var(--monomat-primary-disabled)]"
                >
                    {isSubmitting
                        ? AUTH_LABELS.SIGNUP_SUBMITTING
                        : AUTH_LABELS.SIGNUP_BUTTON}
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
