import { type FormEvent } from 'react';

import {
    AUTH_LABELS,
    GUEST_NICKNAME_GUIDE,
    GUEST_NICKNAME_POLICY,
} from '../../constants/auth';

interface GuestFormProps {
    nickname: string;
    isSubmitting: boolean;
    onNicknameChange: (value: string) => void;
    onSubmit: () => void;
}

export function GuestForm({
    nickname,
    isSubmitting,
    onNicknameChange,
    onSubmit,
}: GuestFormProps) {
    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onSubmit();
    };

    return (
        <form onSubmit={handleSubmit} className="min-w-0 text-left">
            <label
                htmlFor="guest-nickname"
                className="mb-2 block text-xs font-semibold text-[var(--monomat-text-muted)]"
            >
                {AUTH_LABELS.NICKNAME}
            </label>
            <input
                id="guest-nickname"
                type="text"
                value={nickname}
                maxLength={GUEST_NICKNAME_POLICY.MAX_LENGTH}
                autoFocus
                disabled={isSubmitting}
                placeholder={AUTH_LABELS.NICKNAME_PLACEHOLDER}
                onChange={(event) => onNicknameChange(event.target.value)}
                className="h-11 w-full rounded-lg border border-[color:var(--monomat-border-input)] bg-[var(--monomat-page-bg)] px-4 text-sm text-[var(--monomat-text-strong)] outline-none transition placeholder:text-[var(--monomat-border-input)] focus:border-[color:var(--monomat-primary)] disabled:cursor-not-allowed disabled:opacity-60"
            />

            <ul className="mt-5 space-y-[6px] text-[13px] leading-5 text-[var(--monomat-text-muted)]">
                {GUEST_NICKNAME_GUIDE.map((guide) => (
                    <li key={guide} className="break-keep">
                        - {guide}
                    </li>
                ))}
            </ul>

            <button
                type="submit"
                disabled={isSubmitting}
                className="mt-8 min-h-12 w-full min-w-0 rounded-lg bg-[var(--monomat-primary)] px-3 text-[15px] font-bold leading-5 text-white transition hover:bg-[var(--monomat-primary-hover)] disabled:cursor-not-allowed disabled:bg-[var(--monomat-primary-disabled)]"
            >
                {isSubmitting
                    ? AUTH_LABELS.SUBMITTING
                    : AUTH_LABELS.SUBMIT}
            </button>
        </form>
    );
}
