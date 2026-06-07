import {
    type FormEvent,
    useState,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { createMapWithItems } from '../api/mapApi';
import { MonomatInput } from '../components/common/MonomatInput';
import { NavigationBar } from '../components/common/NavigationBar';
import { LobbyFooter } from '../components/lobby/LobbyFooter';
import { MapCreateGuide } from '../components/map/MapCreateGuide';
import { MapCreateSongCard } from '../components/map/MapCreateSongCard';
import {
    MAP_CATEGORY_OPTIONS,
    MAP_CREATE_PAGE_COPY,
    MAP_CREATE_POLICY,
    MAP_ROUTES,
} from '../constants/map';
import { generateUUID } from '../utils/uuid';
import {
    createMapItemRequestFromSong,
    isValidMapSongForm,
} from '../utils/mapSongForm';

import type {
    CreateMapFormState,
    CreateMapSongFormState,
} from '../types/map';

const inputClassName =
    'h-11 w-full rounded-lg border border-[color:var(--monomat-border-input)] bg-[var(--monomat-page-bg)] px-[14px] text-sm text-[var(--monomat-text-strong)] outline-none transition placeholder:text-[var(--monomat-text-muted)] focus:border-[var(--monomat-primary)] disabled:cursor-not-allowed disabled:opacity-60';

function createEmptySong(): CreateMapSongFormState {
    return {
        id: generateUUID(),
        youtubeUrl: '',
        hint: '',
        startTime: '',
        videoDurationSeconds: null,
        answers: [''],
    };
}

function createInitialFormState(): CreateMapFormState {
    return {
        title: '',
        description: '',
        category: MAP_CREATE_POLICY.DEFAULT_CATEGORY,
        isPublic: MAP_CREATE_POLICY.DEFAULT_IS_PUBLIC,
        songs: [createEmptySong()],
    };
}

function getErrorMessage(error: unknown) {
    if (error instanceof Error && error.message) {
        return error.message;
    }

    return MAP_CREATE_PAGE_COPY.CREATE_ERROR;
}

function StatusBadge({
    label,
    isComplete,
}: {
    label: string;
    isComplete: boolean;
}) {
    return (
        <span
            className={`inline-flex h-[30px] items-center gap-1.5 rounded-full border px-3 text-xs font-semibold ${
                isComplete
                    ? 'border-[#9BDBBD] bg-[#D9F0E5] text-[#33A659]'
                    : 'border-[#E4E5E9] bg-[#F1F2F5] text-[var(--monomat-text-secondary)]'
            }`}
        >
            <span
                className={`h-2 w-2 rounded-full ${
                    isComplete ? 'bg-[#33A659]' : 'bg-[#B7B9C1]'
                }`}
                aria-hidden="true"
            />
            {label}
        </span>
    );
}

export function MapCreate() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [formState, setFormState] = useState(createInitialFormState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const hasValidTitle =
        formState.title.trim().length > 0 &&
        formState.title.trim().length <=
            MAP_CREATE_POLICY.TITLE_MAX_LENGTH;
    const registeredSongCount =
        formState.songs.filter(isValidMapSongForm).length;
    const hasValidSongs =
        formState.songs.length >= MAP_CREATE_POLICY.MIN_SONG_COUNT &&
        registeredSongCount === formState.songs.length;
    const isFormValid =
        hasValidTitle &&
        formState.description.length <=
            MAP_CREATE_POLICY.DESCRIPTION_MAX_LENGTH &&
        MAP_CATEGORY_OPTIONS.includes(formState.category) &&
        hasValidSongs;
    const isFormLocked = isSubmitting;

    const updateFormState = <TKey extends keyof Omit<
        CreateMapFormState,
        'songs'
    >>(
        key: TKey,
        value: CreateMapFormState[TKey],
    ) => {
        setFormState((current) => ({
            ...current,
            [key]: value,
        }));
        setErrorMessage(null);
    };

    const updateSong = (
        songId: string,
        field: 'youtubeUrl' | 'hint' | 'startTime',
        value: string,
    ) => {
        setFormState((current) => ({
            ...current,
            songs: current.songs.map((song) =>
                song.id === songId
                    ? {
                          ...song,
                          [field]: value,
                          ...(field === 'youtubeUrl'
                              ? { videoDurationSeconds: null }
                              : {}),
                      }
                    : song,
            ),
        }));
        setErrorMessage(null);
    };

    const updateSongDuration = (
        songId: string,
        videoDurationSeconds: number | null,
    ) => {
        setFormState((current) => ({
            ...current,
            songs: current.songs.map((song) =>
                song.id === songId
                    ? { ...song, videoDurationSeconds }
                    : song,
            ),
        }));
    };

    const updateAnswer = (
        songId: string,
        answerIndex: number,
        value: string,
    ) => {
        setFormState((current) => ({
            ...current,
            songs: current.songs.map((song) => {
                if (song.id !== songId) {
                    return song;
                }

                return {
                    ...song,
                    answers: song.answers.map((answer, index) =>
                        index === answerIndex ? value : answer,
                    ),
                };
            }),
        }));
        setErrorMessage(null);
    };

    const addSong = () => {
        setFormState((current) => {
            if (
                current.songs.length >= MAP_CREATE_POLICY.MAX_SONG_COUNT
            ) {
                return current;
            }

            return {
                ...current,
                songs: [...current.songs, createEmptySong()],
            };
        });
        setErrorMessage(null);
    };

    const deleteSong = (songId: string) => {
        setFormState((current) => {
            if (
                current.songs.length <= MAP_CREATE_POLICY.MIN_SONG_COUNT
            ) {
                return current;
            }

            return {
                ...current,
                songs: current.songs.filter((song) => song.id !== songId),
            };
        });
        setErrorMessage(null);
    };

    const moveSong = (
        songId: string,
        direction: -1 | 1,
    ) => {
        setFormState((current) => {
            const currentIndex = current.songs.findIndex(
                (song) => song.id === songId,
            );
            const targetIndex = currentIndex + direction;

            if (
                currentIndex < 0 ||
                targetIndex < 0 ||
                targetIndex >= current.songs.length
            ) {
                return current;
            }

            const songs = [...current.songs];
            [songs[currentIndex], songs[targetIndex]] = [
                songs[targetIndex],
                songs[currentIndex],
            ];

            return {
                ...current,
                songs,
            };
        });
        setErrorMessage(null);
    };

    const addAnswer = (songId: string) => {
        setFormState((current) => ({
            ...current,
            songs: current.songs.map((song) => {
                if (
                    song.id !== songId ||
                    song.answers.length >=
                        MAP_CREATE_POLICY.MAX_ANSWER_COUNT
                ) {
                    return song;
                }

                return {
                    ...song,
                    answers: [...song.answers, ''],
                };
            }),
        }));
        setErrorMessage(null);
    };

    const deleteAnswer = (songId: string, answerIndex: number) => {
        setFormState((current) => ({
            ...current,
            songs: current.songs.map((song) => {
                if (
                    song.id !== songId ||
                    song.answers.length <=
                        MAP_CREATE_POLICY.MIN_ANSWER_COUNT
                ) {
                    return song;
                }

                return {
                    ...song,
                    answers: song.answers.filter(
                        (_, index) => index !== answerIndex,
                    ),
                };
            }),
        }));
        setErrorMessage(null);
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!isFormValid || isFormLocked) {
            return;
        }

        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            await createMapWithItems({
                title: formState.title.trim(),
                description: formState.description.trim() || null,
                category: formState.category,
                isPublic: formState.isPublic,
                items: formState.songs.map((song, index) =>
                    createMapItemRequestFromSong(song, index + 1),
                ),
            });

            await queryClient.invalidateQueries({
                queryKey: ['myMaps'],
            });
            navigate(MAP_ROUTES.MY_MAPS);
        } catch (error) {
            setErrorMessage(getErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col bg-[var(--monomat-page-bg)] text-left">
            <NavigationBar />

            <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 pb-8 pt-6 sm:px-6 lg:px-8 xl:px-10 xl:pt-[30px]">
                <form
                    noValidate
                    onSubmit={(event) => void handleSubmit(event)}
                    className="mx-auto w-full max-w-[1030px]"
                >
                    <button
                        type="button"
                        onClick={() => navigate(MAP_ROUTES.MY_MAPS)}
                        disabled={isSubmitting}
                        className="text-sm font-semibold leading-5 text-[var(--monomat-text-muted)] transition hover:text-[var(--monomat-text-strong)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {MAP_CREATE_PAGE_COPY.BACK_TO_MAPS}
                    </button>

                    <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <h1 className="!m-0 !text-[36px] !font-extrabold !leading-[43px] !text-[var(--monomat-text-strong)]">
                                {MAP_CREATE_PAGE_COPY.TITLE}
                            </h1>
                            <p className="mt-2 text-sm font-medium leading-5 text-[var(--monomat-text-muted)]">
                                {MAP_CREATE_PAGE_COPY.DESCRIPTION(
                                    registeredSongCount,
                                )}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2 lg:justify-end">
                            <StatusBadge
                                label={MAP_CREATE_PAGE_COPY.STATUS_TITLE}
                                isComplete={hasValidTitle}
                            />
                            <StatusBadge
                                label={MAP_CREATE_PAGE_COPY.STATUS_SONG}
                                isComplete={registeredSongCount >= 1}
                            />
                            <StatusBadge
                                label={
                                    MAP_CREATE_PAGE_COPY.STATUS_RECOMMENDED_SONG
                                }
                                isComplete={registeredSongCount >= 5}
                            />
                        </div>
                    </div>

                    <div className="mt-[30px]">
                        <MapCreateGuide />
                    </div>

                    <section className="mt-[30px] rounded-2xl bg-white p-5 shadow-[0_4px_16px_rgba(0,0,0,0.16)] sm:p-6">
                        <h2 className="!m-0 !text-lg !font-bold !leading-6 !text-black">
                            {MAP_CREATE_PAGE_COPY.MAP_INFO_TITLE}
                        </h2>

                        <label className="mt-4 block">
                            <div className="mb-1 flex items-center justify-between text-sm text-[var(--monomat-text-muted)]">
                                <span>
                                    {MAP_CREATE_PAGE_COPY.MAP_TITLE_LABEL}
                                </span>
                                <span>
                                    {formState.title.length}/
                                    {MAP_CREATE_POLICY.TITLE_MAX_LENGTH}
                                </span>
                            </div>
                            <MonomatInput
                                value={formState.title}
                                maxLength={
                                    MAP_CREATE_POLICY.TITLE_MAX_LENGTH
                                }
                                placeholder={
                                    MAP_CREATE_PAGE_COPY.MAP_TITLE_PLACEHOLDER
                                }
                                disabled={isFormLocked}
                                onChange={(event) =>
                                    updateFormState(
                                        'title',
                                        event.target.value,
                                    )
                                }
                                className={inputClassName}
                            />
                        </label>

                        <label className="mt-4 block">
                            <div className="mb-1 flex items-center justify-between text-sm text-[var(--monomat-text-muted)]">
                                <span>
                                    {MAP_CREATE_PAGE_COPY.DESCRIPTION_LABEL}
                                </span>
                                <span>
                                    {formState.description.length}/
                                    {
                                        MAP_CREATE_POLICY.DESCRIPTION_MAX_LENGTH
                                    }
                                </span>
                            </div>
                            <textarea
                                value={formState.description}
                                maxLength={
                                    MAP_CREATE_POLICY.DESCRIPTION_MAX_LENGTH
                                }
                                placeholder={
                                    MAP_CREATE_PAGE_COPY.DESCRIPTION_PLACEHOLDER
                                }
                                disabled={isFormLocked}
                                onChange={(event) =>
                                    updateFormState(
                                        'description',
                                        event.target.value,
                                    )
                                }
                                className="h-[95px] w-full resize-none rounded-lg border border-[color:var(--monomat-border-input)] bg-[var(--monomat-page-bg)] px-[14px] py-3 text-sm leading-5 text-[var(--monomat-text-strong)] outline-none transition placeholder:text-[var(--monomat-text-muted)] focus:border-[var(--monomat-primary)] disabled:cursor-not-allowed disabled:opacity-60"
                            />
                        </label>

                        <div className="mt-4 grid gap-4 lg:grid-cols-[370px_minmax(0,1fr)] lg:gap-6">
                            <label className="block">
                                <span className="mb-1 block text-sm text-[var(--monomat-text-muted)]">
                                    {MAP_CREATE_PAGE_COPY.CATEGORY_LABEL}
                                </span>
                                <select
                                    value={formState.category}
                                    disabled={isFormLocked}
                                    onChange={(event) =>
                                        updateFormState(
                                            'category',
                                            event.target
                                                .value as CreateMapFormState['category'],
                                        )
                                    }
                                    className="h-[45px] w-full rounded-lg border border-[color:var(--monomat-border-input)] bg-[#FBFCFE] px-4 text-center text-base font-semibold text-black outline-none focus:border-[var(--monomat-primary)] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {MAP_CATEGORY_OPTIONS.map((category) => (
                                        <option
                                            key={category}
                                            value={category}
                                        >
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <fieldset>
                                <legend className="mb-1 text-sm text-[var(--monomat-text-muted)]">
                                    {MAP_CREATE_PAGE_COPY.VISIBILITY_LABEL}
                                </legend>
                                <div className="grid grid-cols-2 gap-3">
                                    {[true, false].map((isPublic) => {
                                        const isSelected =
                                            formState.isPublic === isPublic;

                                        return (
                                            <button
                                                key={String(isPublic)}
                                                type="button"
                                                disabled={isFormLocked}
                                                aria-pressed={isSelected}
                                                onClick={() =>
                                                    updateFormState(
                                                        'isPublic',
                                                        isPublic,
                                                    )
                                                }
                                                className={`h-[45px] rounded-lg border text-base font-semibold text-black transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                                    isSelected
                                                        ? 'border-[var(--monomat-primary)] bg-[var(--monomat-primary-light)]'
                                                        : 'border-[color:var(--monomat-border-input)] bg-white hover:border-[var(--monomat-primary)]'
                                                }`}
                                            >
                                                {isPublic
                                                    ? MAP_CREATE_PAGE_COPY.PUBLIC
                                                    : MAP_CREATE_PAGE_COPY.PRIVATE}
                                            </button>
                                        );
                                    })}
                                </div>
                            </fieldset>
                        </div>
                    </section>

                    <section className="mt-[30px] rounded-2xl bg-white p-5 shadow-[0_4px_16px_rgba(0,0,0,0.16)] sm:p-6">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <h2 className="!m-0 !text-lg !font-bold !leading-6 !text-black">
                                    {MAP_CREATE_PAGE_COPY.SONG_LIST_TITLE}
                                </h2>
                                <p className="mt-1 text-sm font-medium leading-5 text-[var(--monomat-text-muted)]">
                                    {
                                        MAP_CREATE_PAGE_COPY.SONG_LIST_DESCRIPTION
                                    }
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={addSong}
                                disabled={
                                    isFormLocked ||
                                    formState.songs.length >=
                                        MAP_CREATE_POLICY.MAX_SONG_COUNT
                                }
                                className="h-[45px] shrink-0 rounded-lg border border-[color:var(--monomat-border-input)] bg-white px-5 text-[15px] font-semibold text-black transition hover:border-[var(--monomat-primary)] disabled:cursor-not-allowed disabled:opacity-45"
                            >
                                {MAP_CREATE_PAGE_COPY.ADD_SONG}
                            </button>
                        </div>

                        <div className="mt-5 space-y-4">
                            {formState.songs.map((song, index) => (
                                <MapCreateSongCard
                                    key={song.id}
                                    index={index}
                                    song={song}
                                    canDeleteSong={
                                        formState.songs.length >
                                        MAP_CREATE_POLICY.MIN_SONG_COUNT
                                    }
                                    canMoveUp={index > 0}
                                    canMoveDown={
                                        index < formState.songs.length - 1
                                    }
                                    disabled={isFormLocked}
                                    onChange={updateSong}
                                    onAnswerChange={updateAnswer}
                                    onDurationChange={updateSongDuration}
                                    onAddAnswer={addAnswer}
                                    onDeleteAnswer={deleteAnswer}
                                    onDeleteSong={deleteSong}
                                    onMoveUp={(songId) =>
                                        moveSong(songId, -1)
                                    }
                                    onMoveDown={(songId) =>
                                        moveSong(songId, 1)
                                    }
                                />
                            ))}
                        </div>
                    </section>

                    {errorMessage && (
                        <div
                            role="alert"
                            className="mt-5 rounded-lg border border-[var(--monomat-danger)] bg-[var(--monomat-danger-light)] px-4 py-3 text-sm font-medium leading-5 text-[var(--monomat-danger)]"
                        >
                            <p>{errorMessage}</p>
                        </div>
                    )}

                    <div className="mt-[30px] flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => navigate(MAP_ROUTES.MY_MAPS)}
                            disabled={isSubmitting}
                            className="h-[45px] min-w-[85px] rounded-lg border border-[color:var(--monomat-border-input)] bg-white px-5 text-[15px] font-bold text-black transition hover:bg-[var(--monomat-page-bg)] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {MAP_CREATE_PAGE_COPY.CANCEL}
                        </button>
                        <button
                            type="submit"
                            disabled={!isFormValid || isSubmitting}
                            className="h-[45px] min-w-[110px] rounded-lg bg-[var(--monomat-primary)] px-5 text-[15px] font-bold text-white transition hover:bg-[var(--monomat-primary-hover)] disabled:cursor-not-allowed disabled:bg-[var(--monomat-primary-disabled)]"
                        >
                            {isSubmitting
                                ? MAP_CREATE_PAGE_COPY.SUBMITTING
                                : MAP_CREATE_PAGE_COPY.SUBMIT}
                        </button>
                    </div>
                </form>
            </main>

            <LobbyFooter />
        </div>
    );
}
