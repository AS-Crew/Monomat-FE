import { useRef } from 'react';

import { MonomatInput } from '../common/MonomatInput';
import { useGuestSession } from '../../hooks/useGuestSession';
import {
    AUTH_LABELS,
    GUEST_NICKNAME_GUIDE,
} from '../../constants/auth';

export function NicknameForm() {
    const inputRef = useRef<HTMLInputElement>(null);

    const {
        createGuestSession,
        isSubmitting,
        errorMessage,
        clearErrorMessage,
    } = useGuestSession();

    const handleSubmit = () => {
        const nickname = inputRef.current?.value ?? '';
        void createGuestSession(nickname);
    };

    return (
        <div className="w-full max-w-[480px] rounded-2xl bg-white px-10 py-16 shadow-2xl">
            <header className="mb-7 text-center">
                <h2 className="mb-4 text-3xl font-extrabold !text-[#333338]">
                    {AUTH_LABELS.GUEST_LOGIN}
                </h2>

                <p className="text-sm text-[#808085]">
                    닉네임만 입력하면 바로 게임에 참가할 수 있습니다
                </p>
            </header>

            <div className="mb-7 flex rounded-xl bg-[#F5F5F7] p-1">
                <button
                    type="button"
                    disabled
                    className="h-10 flex-1 rounded-lg text-sm font-medium text-[#808085] disabled:cursor-not-allowed"
                >
                    {AUTH_LABELS.MEMBER_LOGIN}
                </button>

                <button
                    type="button"
                    className="h-10 flex-1 rounded-lg bg-white text-sm font-semibold text-[#333338] shadow"
                >
                    {AUTH_LABELS.GUEST_LOGIN}
                </button>
            </div>

            {errorMessage && (
                <div
                    role="alert"
                    className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-500"
                >
                    {errorMessage}
                </div>
            )}

            <div className="mb-5 text-left">
                <label
                    htmlFor="guest-nickname"
                    className="mb-2 block text-sm font-medium text-[#808085]"
                >
                    {AUTH_LABELS.NICKNAME}
                </label>

                <MonomatInput
                    id="guest-nickname"
                    ref={inputRef}
                    type="text"
                    placeholder={AUTH_LABELS.NICKNAME_PLACEHOLDER}
                    maxLength={12}
                    autoFocus
                    disabled={isSubmitting}
                    onChange={clearErrorMessage}
                    onEnter={(value) => {
                        void createGuestSession(value);
                    }}
                    className="h-12 w-full rounded-lg border border-[#CCCCD1] bg-[#F5F5F7] px-4 text-left text-sm text-[#333338] outline-none transition placeholder:text-[#B5B5BA] focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                />
            </div>

            <ul className="mb-12 list-disc space-y-2 pl-5 text-left text-sm text-[#808085]">
                {GUEST_NICKNAME_GUIDE.map((guide) => (
                    <li key={guide}>{guide}</li>
                ))}
            </ul>

            <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="h-14 w-full rounded-lg bg-blue-500 text-base font-bold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
                {isSubmitting
                    ? AUTH_LABELS.SUBMITTING
                    : AUTH_LABELS.SUBMIT}
            </button>

            <footer className="mt-10 flex items-center justify-between text-sm">
                <span className="text-[#808085]">
                    {AUTH_LABELS.CREATE_MAP_HINT}
                </span>

                <button
                    type="button"
                    disabled
                    className="font-semibold text-blue-500 underline disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {AUTH_LABELS.MEMBER_LOGIN}
                </button>
            </footer>
        </div>
    );
}