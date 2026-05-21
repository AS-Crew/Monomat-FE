import {
    useCallback,
    useEffect,
    useState,
    type ChangeEvent,
    type FormEvent,
} from 'react';

import { createLobby } from '../../api/lobbyApi';
import { CREATE_LOBBY_POLICY } from '../../constants/lobby';
import type {
    CreateLobbyRequest,
    CreateLobbyResponse,
} from '../../types/lobby';
import { MonomatInput } from '../common/MonomatInput';

interface CreateLobbyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreated: (response: CreateLobbyResponse) => void;
}

const MAX_PLAYER_OPTIONS = Array.from(
    {
        length:
            CREATE_LOBBY_POLICY.MAX_PLAYERS -
            CREATE_LOBBY_POLICY.MIN_PLAYERS +
            1,
    },
    (_, index) => CREATE_LOBBY_POLICY.MIN_PLAYERS + index,
);

interface CreateLobbyFormState {
    title: string;
    maxPlayers: number;
    isPrivate: boolean;
    roundCount: string;
    timeLimitSeconds: string;
}

const DEFAULT_FORM_STATE: CreateLobbyFormState = {
    title: '',
    maxPlayers: CREATE_LOBBY_POLICY.DEFAULT_MAX_PLAYERS,
    isPrivate: false,
    roundCount: '',
    timeLimitSeconds: '',
};

function parseOptionalInteger(value: string) {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
        return undefined;
    }

    const parsedValue = Number(trimmedValue);

    return Number.isInteger(parsedValue) ? parsedValue : null;
}

function validateOptionalIntegerRange(
    value: string,
    min: number,
    max: number,
    label: string,
) {
    const parsedValue = parseOptionalInteger(value);

    if (parsedValue === undefined) {
        return {
            value: undefined,
            message: null,
        };
    }

    if (parsedValue === null || parsedValue < min || parsedValue > max) {
        return {
            value: null,
            message: `${label}은 ${min}~${max} 범위로 입력해주세요.`,
        };
    }

    return {
        value: parsedValue,
        message: null,
    };
}

function createRequestFromFormState(
    formState: CreateLobbyFormState,
): CreateLobbyRequest | string {
    const title = formState.title.trim();

    if (!title) {
        return '로비 제목을 입력해주세요.';
    }

    if (title.length > CREATE_LOBBY_POLICY.TITLE_MAX_LENGTH) {
        return `로비 제목은 최대 ${CREATE_LOBBY_POLICY.TITLE_MAX_LENGTH}자까지 입력할 수 있습니다.`;
    }

    if (
        formState.maxPlayers < CREATE_LOBBY_POLICY.MIN_PLAYERS ||
        formState.maxPlayers > CREATE_LOBBY_POLICY.MAX_PLAYERS
    ) {
        return `최대 인원은 ${CREATE_LOBBY_POLICY.MIN_PLAYERS}~${CREATE_LOBBY_POLICY.MAX_PLAYERS}명 중에서 선택해주세요.`;
    }

    const roundCountResult = validateOptionalIntegerRange(
        formState.roundCount,
        CREATE_LOBBY_POLICY.MIN_ROUND_COUNT,
        CREATE_LOBBY_POLICY.MAX_ROUND_COUNT,
        '라운드 수',
    );

    if (roundCountResult.message) {
        return roundCountResult.message;
    }

    const timeLimitResult = validateOptionalIntegerRange(
        formState.timeLimitSeconds,
        CREATE_LOBBY_POLICY.MIN_TIME_LIMIT_SECONDS,
        CREATE_LOBBY_POLICY.MAX_TIME_LIMIT_SECONDS,
        '제한 시간',
    );

    if (timeLimitResult.message) {
        return timeLimitResult.message;
    }

    return {
        title,
        maxPlayers: formState.maxPlayers,
        isPrivate: formState.isPrivate,
        mapId: null,
        roundCount: roundCountResult.value,
        timeLimitSeconds: timeLimitResult.value,
    };
}

export function CreateLobbyModal({
                                     isOpen,
                                     onClose,
                                     onCreated,
                                 }: CreateLobbyModalProps) {
    const [formState, setFormState] =
        useState<CreateLobbyFormState>(DEFAULT_FORM_STATE);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const resetState = useCallback(() => {
        setFormState(DEFAULT_FORM_STATE);
        setErrorMessage(null);
        setIsSubmitting(false);
    }, []);

    useEffect(() => {
        if (!isOpen) {
            resetState();
        }
    }, [isOpen, resetState]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key !== 'Escape' || isSubmitting) {
                return;
            }

            resetState();
            onClose();
        };

        window.addEventListener('keydown', handleEscapeKey);

        return () => {
            window.removeEventListener('keydown', handleEscapeKey);
        };
    }, [isOpen, isSubmitting, onClose, resetState]);

    if (!isOpen) {
        return null;
    }

    const updateFormState = <TKey extends keyof CreateLobbyFormState>(
        key: TKey,
        value: CreateLobbyFormState[TKey],
    ) => {
        setFormState((currentFormState) => ({
            ...currentFormState,
            [key]: value,
        }));
        setErrorMessage(null);
    };

    const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
        updateFormState('title', event.target.value);
    };

    const handleMaxPlayersChange = (event: ChangeEvent<HTMLSelectElement>) => {
        updateFormState('maxPlayers', Number(event.target.value));
    };

    const handleRoundCountChange = (event: ChangeEvent<HTMLInputElement>) => {
        updateFormState('roundCount', event.target.value);
    };

    const handleTimeLimitChange = (event: ChangeEvent<HTMLInputElement>) => {
        updateFormState('timeLimitSeconds', event.target.value);
    };

    const handleClose = () => {
        if (isSubmitting) {
            return;
        }

        resetState();
        onClose();
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (isSubmitting) {
            return;
        }

        const request = createRequestFromFormState(formState);

        if (typeof request === 'string') {
            setErrorMessage(request);
            return;
        }

        try {
            setIsSubmitting(true);
            setErrorMessage(null);

            const response = await createLobby(request);

            resetState();
            onClose();
            onCreated(response);
        } catch (error) {
            if (error instanceof Error && error.message) {
                setErrorMessage(error.message);
                return;
            }

            setErrorMessage('로비 생성에 실패했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-lobby-modal-title"
        >
            <div className="relative w-[520px] rounded-2xl bg-white px-9 py-8 text-[#333338] shadow-xl">
                <button
                    type="button"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="absolute right-6 top-6 text-3xl leading-none text-[#808085] hover:text-[#333338] disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="로비 만들기 모달 닫기"
                >
                    ×
                </button>

                <h2
                    id="create-lobby-modal-title"
                    className="mb-3 text-center text-2xl font-bold text-[#333338]"
                >
                    로비 만들기
                </h2>

                <p className="mb-8 text-center text-sm text-[#808085]">
                    기본 설정만 입력하면 바로 대기실로 이동합니다.
                </p>

                <form onSubmit={handleSubmit}>
                    <section className="mb-5">
                        <label
                            htmlFor="create-lobby-title"
                            className="mb-3 block text-sm font-bold text-[#333338]"
                        >
                            로비 제목
                        </label>

                        <MonomatInput
                            id="create-lobby-title"
                            type="text"
                            value={formState.title}
                            maxLength={CREATE_LOBBY_POLICY.TITLE_MAX_LENGTH}
                            autoFocus
                            disabled={isSubmitting}
                            preventEnterSubmit={false}
                            onChange={handleTitleChange}
                            placeholder="로비 제목을 입력해주세요"
                            className="h-12 w-full rounded-lg border border-[#CCCCD1] bg-[#F5F5F7] px-4 text-sm font-semibold text-[#333338] outline-none transition placeholder:text-[#B5B5BA] focus:border-[#3873E6] disabled:cursor-not-allowed disabled:opacity-60"
                        />

                        <p className="mt-2 text-right text-xs text-[#808085]">
                            {formState.title.length}/
                            {CREATE_LOBBY_POLICY.TITLE_MAX_LENGTH}
                        </p>
                    </section>

                    <section className="mb-5 grid grid-cols-2 gap-4">
                        <div>
                            <label
                                htmlFor="create-lobby-max-players"
                                className="mb-3 block text-sm font-bold text-[#333338]"
                            >
                                최대 인원
                            </label>

                            <select
                                id="create-lobby-max-players"
                                value={formState.maxPlayers}
                                disabled={isSubmitting}
                                onChange={handleMaxPlayersChange}
                                className="h-12 w-full rounded-lg border border-[#CCCCD1] bg-[#F5F5F7] px-4 text-sm font-semibold text-[#333338] outline-none transition focus:border-[#3873E6] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {MAX_PLAYER_OPTIONS.map((maxPlayers) => (
                                    <option
                                        key={maxPlayers}
                                        value={maxPlayers}
                                    >
                                        {maxPlayers}명
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <span className="mb-3 block text-sm font-bold text-[#333338]">
                                공개 설정
                            </span>

                            <div className="grid h-12 grid-cols-2 rounded-lg border border-[#CCCCD1] bg-[#F5F5F7] p-1">
                                <button
                                    type="button"
                                    disabled={isSubmitting}
                                    onClick={() => updateFormState(
                                        'isPrivate',
                                        false,
                                    )}
                                    className={`rounded-md text-sm font-bold transition disabled:cursor-not-allowed ${
                                        !formState.isPrivate
                                            ? 'bg-[#3873E6] text-white shadow-sm'
                                            : 'text-[#808085] hover:text-[#333338]'
                                    }`}
                                >
                                    공개
                                </button>

                                <button
                                    type="button"
                                    disabled={isSubmitting}
                                    onClick={() => updateFormState(
                                        'isPrivate',
                                        true,
                                    )}
                                    className={`rounded-md text-sm font-bold transition disabled:cursor-not-allowed ${
                                        formState.isPrivate
                                            ? 'bg-[#3873E6] text-white shadow-sm'
                                            : 'text-[#808085] hover:text-[#333338]'
                                    }`}
                                >
                                    비공개
                                </button>
                            </div>
                        </div>
                    </section>

                    <section className="mb-5 grid grid-cols-2 gap-4">
                        <div>
                            <label
                                htmlFor="create-lobby-round-count"
                                className="mb-3 block text-sm font-bold text-[#333338]"
                            >
                                라운드 수
                            </label>

                            <input
                                id="create-lobby-round-count"
                                type="number"
                                min={CREATE_LOBBY_POLICY.MIN_ROUND_COUNT}
                                max={CREATE_LOBBY_POLICY.MAX_ROUND_COUNT}
                                value={formState.roundCount}
                                disabled={isSubmitting}
                                onChange={handleRoundCountChange}
                                placeholder="기본값"
                                className="h-12 w-full rounded-lg border border-[#CCCCD1] bg-[#F5F5F7] px-4 text-sm font-semibold text-[#333338] outline-none transition placeholder:text-[#B5B5BA] focus:border-[#3873E6] disabled:cursor-not-allowed disabled:opacity-60"
                            />

                            <p className="mt-2 text-xs text-[#808085]">
                                {CREATE_LOBBY_POLICY.MIN_ROUND_COUNT}~
                                {CREATE_LOBBY_POLICY.MAX_ROUND_COUNT}, 비우면
                                서버 기본값
                            </p>
                        </div>

                        <div>
                            <label
                                htmlFor="create-lobby-time-limit"
                                className="mb-3 block text-sm font-bold text-[#333338]"
                            >
                                제한 시간(초)
                            </label>

                            <input
                                id="create-lobby-time-limit"
                                type="number"
                                min={
                                    CREATE_LOBBY_POLICY.MIN_TIME_LIMIT_SECONDS
                                }
                                max={
                                    CREATE_LOBBY_POLICY.MAX_TIME_LIMIT_SECONDS
                                }
                                value={formState.timeLimitSeconds}
                                disabled={isSubmitting}
                                onChange={handleTimeLimitChange}
                                placeholder="기본값"
                                className="h-12 w-full rounded-lg border border-[#CCCCD1] bg-[#F5F5F7] px-4 text-sm font-semibold text-[#333338] outline-none transition placeholder:text-[#B5B5BA] focus:border-[#3873E6] disabled:cursor-not-allowed disabled:opacity-60"
                            />

                            <p className="mt-2 text-xs text-[#808085]">
                                {CREATE_LOBBY_POLICY.MIN_TIME_LIMIT_SECONDS}~
                                {CREATE_LOBBY_POLICY.MAX_TIME_LIMIT_SECONDS}초,
                                비우면 서버 기본값
                            </p>
                        </div>
                    </section>

                    {errorMessage && (
                        <div
                            role="alert"
                            className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-500"
                        >
                            {errorMessage}
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="h-12 flex-1 rounded-lg border border-[#CCCCD1] font-bold text-[#333338] hover:bg-[#F5F5F7] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            취소
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="h-12 flex-1 rounded-lg bg-[#3873E6] font-bold text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-blue-300"
                        >
                            {isSubmitting ? '생성 중...' : '생성하기'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
