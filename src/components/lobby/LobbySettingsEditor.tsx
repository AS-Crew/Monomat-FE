import {
    type ChangeEvent,
    type FormEvent,
    useState,
} from 'react';

import {
    CREATE_LOBBY_POLICY,
    LOBBY_ROOM_COPY,
} from '../../constants/lobby';
import { updateLobbySettingsRequestSchema } from '../../schemas/lobbySchema';
import type { UpdateLobbySettingsRequest } from '../../types/lobby';
import {
    clampLobbyQuestionCount,
    getLobbyQuestionCountMax,
    hasValidLobbyMapSongCount,
} from '../../utils/lobbyQuestionCount';

interface LobbySettingsEditorProps extends UpdateLobbySettingsRequest {
    mapNumOfSong: number | null;
    currentPlayers: number;
    isEditable: boolean;
    isSaving: boolean;
    onSubmit: (request: UpdateLobbySettingsRequest) => void;
}

interface LobbySettingsRangeProps {
    id: string;
    label: string;
    value: number;
    unit?: string;
    min: number;
    max: number;
    disabled: boolean;
    onChange: (value: number) => void;
}

function getRangeBackground(value: number, min: number, max: number) {
    if (max <= min) {
        return 'var(--monomat-primary)';
    }

    const progress = ((value - min) / (max - min)) * 100;

    return `linear-gradient(to right, var(--monomat-primary) ${progress}%, var(--monomat-border-input) ${progress}%)`;
}

function LobbySettingsRange({
    id,
    label,
    value,
    unit = '',
    min,
    max,
    disabled,
    onChange,
}: LobbySettingsRangeProps) {
    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        onChange(Number(event.target.value));
    };

    return (
        <label htmlFor={id} className="block min-w-0">
            <span className="mb-[9px] block text-base leading-5 text-[var(--monomat-text-muted)]">
                {label} :{' '}
                <strong className="font-semibold text-[var(--monomat-text-strong)]">
                    {value}
                    {unit}
                </strong>
            </span>

            <input
                id={id}
                type="range"
                min={min}
                max={max}
                value={value}
                disabled={disabled}
                onChange={handleChange}
                style={{
                    background: getRangeBackground(value, min, max),
                }}
                className="block h-[7px] w-full cursor-pointer appearance-none rounded-[3px] border border-[var(--monomat-border-input)] outline-none transition disabled:cursor-not-allowed disabled:opacity-50 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[var(--monomat-primary)] [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--monomat-primary)]"
            />
        </label>
    );
}

export function LobbySettingsEditor({
    maxPlayers,
    questionCount,
    timeLimitSeconds,
    mapNumOfSong,
    currentPlayers,
    isEditable,
    isSaving,
    onSubmit,
}: LobbySettingsEditorProps) {
    const questionCountMax = getLobbyQuestionCountMax(mapNumOfSong);
    const hasValidMapSongCount =
        hasValidLobbyMapSongCount(mapNumOfSong);
    const hasEmptySelectedMap =
        mapNumOfSong !== null && !hasValidMapSongCount;
    const [formState, setFormState] = useState<UpdateLobbySettingsRequest>({
        maxPlayers,
        questionCount: clampLobbyQuestionCount(
            questionCount,
            mapNumOfSong,
        ),
        timeLimitSeconds,
    });
    const [validationMessage, setValidationMessage] = useState<string | null>(
        null,
    );

    const isDirty =
        formState.maxPlayers !== maxPlayers ||
        formState.questionCount !== questionCount ||
        formState.timeLimitSeconds !== timeLimitSeconds;
    const isDisabled = !isEditable || isSaving;
    const hasPlayerCountConflict = formState.maxPlayers < currentPlayers;

    const updateFormState = (
        key: keyof UpdateLobbySettingsRequest,
        value: number,
    ) => {
        setFormState((currentFormState) => ({
            ...currentFormState,
            [key]: value,
        }));
        setValidationMessage(null);
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (isDisabled) {
            return;
        }

        if (!isDirty) {
            setValidationMessage(LOBBY_ROOM_COPY.SETTINGS_UNCHANGED);
            return;
        }

        if (hasPlayerCountConflict) {
            setValidationMessage(
                LOBBY_ROOM_COPY.SETTINGS_MAX_PLAYERS_CONFLICT,
            );
            return;
        }

        if (hasEmptySelectedMap) {
            setValidationMessage(
                LOBBY_ROOM_COPY.SETTINGS_QUESTION_COUNT_EMPTY_MAP,
            );
            return;
        }

        const request = {
            ...formState,
            questionCount: clampLobbyQuestionCount(
                formState.questionCount,
                mapNumOfSong,
            ),
        };
        const parsed = updateLobbySettingsRequestSchema.safeParse(request);

        if (!parsed.success) {
            setValidationMessage('설정값의 허용 범위를 확인해주세요.');
            return;
        }

        setValidationMessage(null);
        onSubmit(parsed.data);
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="rounded-2xl bg-white px-[25px] py-5 text-left shadow-[0_4px_16px_rgba(0,0,0,0.16)]"
        >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h2 className="!m-0 !text-lg !font-bold !leading-6 !text-[var(--monomat-text-strong)]">
                        {LOBBY_ROOM_COPY.GAME_SETTING_TITLE}
                    </h2>
                    <p className="mt-1 text-xs font-medium leading-5 text-[var(--monomat-text-muted)]">
                        현재 참가자 {currentPlayers}명 · 저장 후 서버 설정으로 다시 동기화됩니다.
                    </p>
                </div>

                {!isEditable && (
                    <p className="break-keep text-xs font-bold leading-5 text-amber-700">
                        {LOBBY_ROOM_COPY.SETTINGS_NOT_WAITING}
                    </p>
                )}
            </div>

            <div className="mt-[15px] grid gap-5 md:grid-cols-3 md:gap-[60px]">
                <LobbySettingsRange
                    id="lobby-settings-max-players"
                    label={LOBBY_ROOM_COPY.MAX_PLAYERS}
                    value={formState.maxPlayers}
                    unit="명"
                    min={CREATE_LOBBY_POLICY.MIN_PLAYERS}
                    max={CREATE_LOBBY_POLICY.MAX_PLAYERS}
                    disabled={isDisabled}
                    onChange={(value) =>
                        updateFormState('maxPlayers', value)
                    }
                />
                <LobbySettingsRange
                    id="lobby-settings-question-count"
                    label={LOBBY_ROOM_COPY.QUESTION_COUNT}
                    value={formState.questionCount}
                    min={CREATE_LOBBY_POLICY.MIN_QUESTION_COUNT}
                    max={questionCountMax}
                    disabled={isDisabled || !hasValidMapSongCount}
                    onChange={(value) =>
                        updateFormState('questionCount', value)
                    }
                />
                <LobbySettingsRange
                    id="lobby-settings-time-limit"
                    label={LOBBY_ROOM_COPY.TIME_LIMIT}
                    value={formState.timeLimitSeconds}
                    unit="초"
                    min={CREATE_LOBBY_POLICY.MIN_TIME_LIMIT_SECONDS}
                    max={CREATE_LOBBY_POLICY.MAX_TIME_LIMIT_SECONDS}
                    disabled={isDisabled}
                    onChange={(value) =>
                        updateFormState('timeLimitSeconds', value)
                    }
                />
            </div>

            <p className="mt-3 break-keep text-xs font-medium leading-5 text-[var(--monomat-text-muted)]">
                {hasValidMapSongCount
                    ? mapNumOfSong > questionCountMax
                        ? `이 맵은 최대 ${mapNumOfSong}곡이지만, 로비는 최대 ${questionCountMax}라운드까지 설정할 수 있습니다.`
                        : `이 맵은 최대 ${questionCountMax}라운드까지 진행할 수 있습니다.`
                    : hasEmptySelectedMap
                        ? LOBBY_ROOM_COPY.SETTINGS_QUESTION_COUNT_EMPTY_MAP
                        : LOBBY_ROOM_COPY.SETTINGS_QUESTION_COUNT_MAP_REQUIRED}
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-h-5">
                    {(validationMessage || hasPlayerCountConflict) && (
                        <p
                            role="alert"
                            className="break-keep text-xs font-bold leading-5 text-[var(--monomat-danger)]"
                        >
                            {validationMessage ??
                                LOBBY_ROOM_COPY.SETTINGS_MAX_PLAYERS_CONFLICT}
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={
                        isDisabled ||
                        !isDirty ||
                        hasPlayerCountConflict ||
                        hasEmptySelectedMap
                    }
                    className="h-10 w-full rounded-lg bg-[var(--monomat-primary)] px-5 text-sm font-bold text-white transition hover:bg-[var(--monomat-primary-hover)] disabled:cursor-not-allowed disabled:bg-[var(--monomat-primary-disabled)] sm:w-auto"
                >
                    {isSaving
                        ? LOBBY_ROOM_COPY.SETTINGS_SAVE_PENDING
                        : LOBBY_ROOM_COPY.SETTINGS_SAVE}
                </button>
            </div>
        </form>
    );
}
