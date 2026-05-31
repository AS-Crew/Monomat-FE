import { type FormEvent } from 'react';

import {
    AUTH_LABELS,
    REGISTER_POLICY,
} from '../../constants/auth';
import { MonomatLogo } from '../common/MonomatLogo';
import {
    AuthFieldHeader,
    AuthGlobalErrorMessage,
} from './AuthErrorMessage';

interface RegisterFormProps {
    loginId: string;
    password: string;
    passwordConfirm: string;
    nickname: string;
    isSubmitting: boolean;
    errorMessage: string | null;
    errorField: string | null;
    onLoginIdChange: (value: string) => void;
    onPasswordChange: (value: string) => void;
    onPasswordConfirmChange: (value: string) => void;
    onNicknameChange: (value: string) => void;
    onSubmit: () => void;
    onLoginClick: () => void;
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
    errorField,
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
    const getFieldError = (field: string) => (
        errorField === field ? errorMessage : null
    );
    const formErrorMessage = errorField ? null : errorMessage;

    return (
        <div className="w-full max-w-[480px] min-w-0 rounded-2xl bg-white px-5 pb-8 pt-8 text-[var(--monomat-text-strong)] shadow-[0_4px_24px_rgba(0,0,0,0.16)] sm:px-[30px] sm:pb-12 sm:pt-[47px]">
            <div className="flex h-9 min-w-0 items-center justify-start">
                <MonomatLogo size="small" />
            </div>

            <header className="mt-[15px] text-center sm:mt-[15px]">
                <h2 className="m-0 text-2xl font-extrabold leading-7 !text-black">
                    {AUTH_LABELS.SIGNUP}
                </h2>
                <p className="mt-[7px] break-keep text-sm font-medium leading-[17px] text-[var(--monomat-text-muted)]">
                    {AUTH_LABELS.SIGNUP_DESCRIPTION}
                </p>
            </header>

            <form onSubmit={handleSubmit} className="mt-[15px] min-w-0 text-left">
                <AuthGlobalErrorMessage
                    message={formErrorMessage}
                    className="mb-[15px]"
                />

                <AuthFieldHeader
                    htmlFor="register-login-id"
                    label={AUTH_LABELS.LOGIN_ID}
                    errorMessage={getFieldError('loginId')}
                    labelClassName="text-black"
                />
                <input
                    id="register-login-id"
                    type="text"
                    value={loginId}
                    maxLength={REGISTER_POLICY.LOGIN_ID_MAX_LENGTH}
                    autoFocus
                    disabled={isSubmitting}
                    placeholder={AUTH_LABELS.REGISTER_LOGIN_ID_PLACEHOLDER}
                    onChange={(event) => onLoginIdChange(event.target.value)}
                    className="h-11 w-full min-w-0 rounded-lg border border-[color:var(--monomat-border-input)] bg-[var(--monomat-page-bg)] px-5 text-sm font-medium text-[var(--monomat-text-strong)] outline-none transition placeholder:text-[var(--monomat-border-input)] focus:border-[color:var(--monomat-primary)] disabled:cursor-not-allowed disabled:opacity-60"
                />

                <div className="mt-[23px]" />
                <AuthFieldHeader
                    htmlFor="register-password"
                    label={AUTH_LABELS.PASSWORD}
                    errorMessage={getFieldError('password')}
                    labelClassName="text-black"
                />
                <input
                    id="register-password"
                    type="password"
                    value={password}
                    maxLength={REGISTER_POLICY.PASSWORD_MAX_LENGTH}
                    disabled={isSubmitting}
                    placeholder={AUTH_LABELS.REGISTER_PASSWORD_PLACEHOLDER}
                    onChange={(event) => onPasswordChange(event.target.value)}
                    className="h-11 w-full min-w-0 rounded-lg border border-[color:var(--monomat-border-input)] bg-[var(--monomat-page-bg)] px-5 text-sm font-medium text-[var(--monomat-text-strong)] outline-none transition placeholder:text-[var(--monomat-border-input)] focus:border-[color:var(--monomat-primary)] disabled:cursor-not-allowed disabled:opacity-60"
                />

                <div className="mt-[23px]" />
                <AuthFieldHeader
                    htmlFor="register-password-confirm"
                    label={AUTH_LABELS.PASSWORD_CONFIRM}
                    errorMessage={getFieldError('passwordConfirm')}
                    labelClassName="text-black"
                />
                <input
                    id="register-password-confirm"
                    type="password"
                    value={passwordConfirm}
                    maxLength={REGISTER_POLICY.PASSWORD_MAX_LENGTH}
                    disabled={isSubmitting}
                    placeholder={AUTH_LABELS.PASSWORD_CONFIRM_PLACEHOLDER}
                    onChange={(event) => onPasswordConfirmChange(event.target.value)}
                    className="h-11 w-full min-w-0 rounded-lg border border-[color:var(--monomat-border-input)] bg-[var(--monomat-page-bg)] px-5 text-sm font-medium text-[var(--monomat-text-strong)] outline-none transition placeholder:text-[var(--monomat-border-input)] focus:border-[color:var(--monomat-primary)] disabled:cursor-not-allowed disabled:opacity-60"
                />

                <div className="mt-[15px]">
                    <SignupDivider />
                </div>

                <div className="mt-[15px]" />
                <AuthFieldHeader
                    htmlFor="register-nickname"
                    label={AUTH_LABELS.NICKNAME}
                    errorMessage={getFieldError('nickname')}
                    labelClassName="text-black"
                />
                <input
                    id="register-nickname"
                    type="text"
                    value={nickname}
                    maxLength={REGISTER_POLICY.NICKNAME_MAX_LENGTH}
                    disabled={isSubmitting}
                    placeholder={AUTH_LABELS.REGISTER_NICKNAME_PLACEHOLDER}
                    onChange={(event) => onNicknameChange(event.target.value)}
                    className="h-11 w-full min-w-0 rounded-lg border border-[color:var(--monomat-border-input)] bg-[var(--monomat-page-bg)] px-5 text-sm font-medium text-[var(--monomat-text-strong)] outline-none transition placeholder:text-[var(--monomat-border-input)] focus:border-[color:var(--monomat-primary)] disabled:cursor-not-allowed disabled:opacity-60"
                />

                <div className="mt-[15px]">
                    <SignupDivider />
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-[15px] h-12 w-full min-w-0 rounded-lg bg-[var(--monomat-primary)] px-3 text-[15px] font-bold leading-5 text-white transition hover:bg-[var(--monomat-primary-hover)] disabled:cursor-not-allowed disabled:bg-[var(--monomat-primary-disabled)]"
                >
                    {isSubmitting
                        ? AUTH_LABELS.SIGNUP_SUBMITTING
                        : AUTH_LABELS.SIGNUP_BUTTON}
                </button>
            </form>

            <footer className="mt-[15px] flex min-h-4 min-w-0 items-center justify-between gap-4 text-xs leading-4">
                <span className="min-w-0 break-keep text-[var(--monomat-text-muted)]">
                    {AUTH_LABELS.ALREADY_HAVE_ACCOUNT}
                </span>

                <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={onLoginClick}
                    className="shrink-0 font-semibold text-[var(--monomat-primary)] underline underline-offset-2 transition hover:text-[var(--monomat-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {AUTH_LABELS.LOGIN}
                </button>
            </footer>
        </div>
    );
}
