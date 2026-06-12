import {
    type ChangeEvent,
    type FormEvent,
    type ReactNode,
    useEffect,
    useState,
} from 'react';
import {
    Clock,
    Cloud,
    Compass,
    LockKeyhole,
    Music,
    Pencil,
    Trash2,
} from 'lucide-react';

import {
    MAP_CATEGORY_OPTIONS,
    MAP_MANAGE_PAGE_COPY,
    MAP_PUBLIC_STATUS_META,
    MAP_UPDATE_POLICY,
} from '../../constants/map';
import {
    formatMapDescription,
    formatMapPlayCount,
    formatMapSongCount,
    formatMapUpdatedAt,
} from '../../utils/mapFormat';

import type {
    MapCategory,
    MapDetailResponse,
    UpdateMapRequest,
} from '../../types/map';

interface MapManageSummaryProps {
    map: MapDetailResponse;
    isUpdating: boolean;
    updateErrorMessage: string | null;
    onCreateLobby: () => void;
    onDelete: () => void;
    onSave: (request: UpdateMapRequest) => Promise<void>;
    onEditingChange: (isEditing: boolean) => void;
    editContent: ReactNode;
    isEditDisabled: boolean;
}

interface MapEditFormState {
    title: string;
    description: string;
    category: MapCategory;
    isPublic: boolean;
}

function createEditFormState(map: MapDetailResponse): MapEditFormState {
    return {
        title: map.title,
        description: map.description ?? '',
        category: map.category,
        isPublic: map.isPublic || map.pendingPublic,
    };
}

function getMapPublicStatusMeta(map: MapDetailResponse) {
    if (map.isPublic) {
        return {
            ...MAP_PUBLIC_STATUS_META.PUBLIC,
            Icon: Cloud,
        };
    }

    if (map.pendingPublic) {
        return {
            ...MAP_PUBLIC_STATUS_META.PENDING,
            Icon: Clock,
        };
    }

    return {
        ...MAP_PUBLIC_STATUS_META.PRIVATE,
        Icon: LockKeyhole,
    };
}

export function MapManageSummary({
    map,
    isUpdating,
    updateErrorMessage,
    onCreateLobby,
    onDelete,
    onSave,
    onEditingChange,
    editContent,
    isEditDisabled,
}: MapManageSummaryProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [formState, setFormState] = useState(() =>
        createEditFormState(map),
    );
    const [validationMessage, setValidationMessage] =
        useState<string | null>(null);

    useEffect(() => {
        if (!isEditing) {
            setFormState(createEditFormState(map));
        }
    }, [isEditing, map]);

    const statusMeta = getMapPublicStatusMeta(map);
    const StatusIcon = statusMeta.Icon;

    const handleEditClick = () => {
        setFormState(createEditFormState(map));
        setValidationMessage(null);
        onEditingChange(true);
        setIsEditing(true);
    };

    const handleCancel = () => {
        if (isUpdating) {
            return;
        }

        setFormState(createEditFormState(map));
        setValidationMessage(null);
        onEditingChange(false);
        setIsEditing(false);
    };

    const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
        setFormState((current) => ({
            ...current,
            title: event.target.value,
        }));
        setValidationMessage(null);
    };

    const handleDescriptionChange = (
        event: ChangeEvent<HTMLTextAreaElement>,
    ) => {
        setFormState((current) => ({
            ...current,
            description: event.target.value,
        }));
        setValidationMessage(null);
    };

    const handleCategoryChange = (event: ChangeEvent<HTMLSelectElement>) => {
        setFormState((current) => ({
            ...current,
            category: event.target.value as MapCategory,
        }));
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const title = formState.title.trim();

        if (!title) {
            setValidationMessage('맵 제목을 입력해주세요.');
            return;
        }

        if (title.length > MAP_UPDATE_POLICY.TITLE_MAX_LENGTH) {
            setValidationMessage(
                `맵 제목은 ${MAP_UPDATE_POLICY.TITLE_MAX_LENGTH}자를 초과할 수 없습니다.`,
            );
            return;
        }

        if (
            formState.description.length >
            MAP_UPDATE_POLICY.DESCRIPTION_MAX_LENGTH
        ) {
            setValidationMessage(
                `맵 설명은 ${MAP_UPDATE_POLICY.DESCRIPTION_MAX_LENGTH}자를 초과할 수 없습니다.`,
            );
            return;
        }

        try {
            await onSave({
                title,
                description: formState.description.trim() || null,
                category: formState.category,
                isPublic: formState.isPublic,
            });
            onEditingChange(false);
            setIsEditing(false);
        } catch {
            // Mutation error is rendered by the parent without discarding edits.
        }
    };

    if (isEditing) {
        return (
            <form
                onSubmit={handleSubmit}
                noValidate
            >
                <section className="rounded-2xl bg-white p-[30px] shadow-[0_4px_16px_rgba(0,0,0,0.18)]">
                    <h1 className="!m-0 !text-xl !font-extrabold !leading-7 !text-black">
                        {MAP_MANAGE_PAGE_COPY.EDIT}
                    </h1>

                    <div className="mt-5 grid gap-5 md:grid-cols-2">
                        <label className="block md:col-span-2">
                            <span className="mb-2 block text-sm font-semibold text-[var(--monomat-text-secondary)]">
                                {MAP_MANAGE_PAGE_COPY.TITLE_LABEL}
                            </span>
                            <input
                                type="text"
                                value={formState.title}
                                maxLength={MAP_UPDATE_POLICY.TITLE_MAX_LENGTH}
                                disabled={isUpdating}
                                onChange={handleTitleChange}
                                className="h-11 w-full rounded-lg border border-[var(--monomat-border-input)] bg-[var(--monomat-page-bg)] px-4 text-sm font-medium text-[var(--monomat-text-strong)] outline-none transition focus:border-[var(--monomat-primary)] disabled:cursor-not-allowed disabled:opacity-60"
                            />
                        </label>

                        <label className="block md:col-span-2">
                            <span className="mb-2 block text-sm font-semibold text-[var(--monomat-text-secondary)]">
                                {MAP_MANAGE_PAGE_COPY.DESCRIPTION_LABEL}
                            </span>
                            <textarea
                                value={formState.description}
                                maxLength={
                                    MAP_UPDATE_POLICY.DESCRIPTION_MAX_LENGTH
                                }
                                disabled={isUpdating}
                                onChange={handleDescriptionChange}
                                rows={3}
                                className="w-full resize-none rounded-lg border border-[var(--monomat-border-input)] bg-[var(--monomat-page-bg)] px-4 py-3 text-sm font-medium leading-5 text-[var(--monomat-text-strong)] outline-none transition focus:border-[var(--monomat-primary)] disabled:cursor-not-allowed disabled:opacity-60"
                            />
                        </label>

                        <label className="block">
                            <span className="mb-2 block text-sm font-semibold text-[var(--monomat-text-secondary)]">
                                {MAP_MANAGE_PAGE_COPY.CATEGORY_LABEL}
                            </span>
                            <select
                                value={formState.category}
                                disabled={isUpdating}
                                onChange={handleCategoryChange}
                                className="h-11 w-full rounded-lg border border-[var(--monomat-border-input)] bg-white px-4 text-sm font-medium text-[var(--monomat-text-strong)] outline-none transition focus:border-[var(--monomat-primary)] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {MAP_CATEGORY_OPTIONS.map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <fieldset>
                            <legend className="mb-2 text-sm font-semibold text-[var(--monomat-text-secondary)]">
                                {MAP_MANAGE_PAGE_COPY.VISIBILITY_LABEL}
                            </legend>
                            <div className="grid grid-cols-2 gap-2">
                                {[true, false].map((isPublic) => (
                                    <button
                                        key={String(isPublic)}
                                        type="button"
                                        disabled={isUpdating}
                                        aria-pressed={
                                            formState.isPublic === isPublic
                                        }
                                        onClick={() =>
                                            setFormState((current) => ({
                                                ...current,
                                                isPublic,
                                            }))
                                        }
                                        className={`h-11 rounded-lg border text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                            formState.isPublic === isPublic
                                                ? 'border-[var(--monomat-primary)] bg-[var(--monomat-primary-light)] text-[var(--monomat-primary)]'
                                                : 'border-[var(--monomat-border-input)] bg-white text-[var(--monomat-text-muted)] hover:bg-[var(--monomat-page-bg)]'
                                        }`}
                                    >
                                        {isPublic
                                            ? MAP_MANAGE_PAGE_COPY.PUBLIC
                                            : MAP_MANAGE_PAGE_COPY.PRIVATE}
                                    </button>
                                ))}
                            </div>
                        </fieldset>
                    </div>
                </section>

                {editContent}

                {(validationMessage || updateErrorMessage) && (
                    <p
                        role="alert"
                        className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 ring-1 ring-red-100"
                    >
                        {validationMessage ?? updateErrorMessage}
                    </p>
                )}

                <div className="mt-[30px] flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={handleCancel}
                        disabled={isUpdating}
                        className="h-[45px] min-w-[85px] rounded-lg border border-[var(--monomat-border-input)] bg-white px-5 text-[15px] font-bold text-black transition hover:bg-[var(--monomat-page-bg)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {MAP_MANAGE_PAGE_COPY.CANCEL}
                    </button>
                    <button
                        type="submit"
                        disabled={isUpdating}
                        className="h-[45px] min-w-[110px] rounded-lg bg-[var(--monomat-primary)] px-5 text-[15px] font-bold text-white transition hover:bg-[var(--monomat-primary-hover)] disabled:cursor-not-allowed disabled:bg-[var(--monomat-primary-disabled)]"
                    >
                        {isUpdating
                            ? MAP_MANAGE_PAGE_COPY.SAVING
                            : MAP_MANAGE_PAGE_COPY.SAVE}
                    </button>
                </div>
            </form>
        );
    }

    return (
        <section className="rounded-2xl bg-white p-[30px] shadow-[0_4px_16px_rgba(0,0,0,0.18)]">
            <div className="flex min-w-0 items-start gap-[30px]">
                <span className="flex h-[100px] w-[100px] shrink-0 items-center justify-center rounded-2xl bg-[#C9DBFF] text-[#2B3F6C]">
                    <Music size={40} strokeWidth={1.8} aria-hidden="true" />
                </span>

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="inline-flex h-[22px] items-center rounded-full bg-[var(--monomat-primary-light)] px-2.5 text-[11px] font-semibold text-[var(--monomat-primary)]">
                            {map.category}
                        </span>
                        <span className={`inline-flex h-[22px] items-center gap-1 rounded-full border px-2 text-xs font-medium ${statusMeta.badgeClassName}`}>
                            <StatusIcon
                                size={13}
                                strokeWidth={2}
                                aria-hidden="true"
                            />
                            {statusMeta.label}
                        </span>
                    </div>

                    <h1 className="!mb-0 !mt-2 break-words !text-xl !font-extrabold !leading-7 !text-black">
                        {map.title}
                    </h1>
                    <p className="mt-1 min-h-10 whitespace-pre-wrap break-keep text-sm font-medium leading-5 text-[var(--monomat-text-secondary)] [overflow-wrap:anywhere]">
                        {formatMapDescription(map.description)}
                    </p>
                    <p className="mt-1 text-sm text-[var(--monomat-text-secondary)]">
                        {formatMapSongCount(map.numOfSong)} |{' '}
                        {formatMapPlayCount(map.playCount)}{' '}
                        {MAP_MANAGE_PAGE_COPY.PLAY_SUFFIX} |{' '}
                        {MAP_MANAGE_PAGE_COPY.UPDATED_PREFIX}{' '}
                        {formatMapUpdatedAt(map.updatedAt)}
                    </p>
                </div>
            </div>

            <div className="mt-[19px] flex items-center gap-[14px]">
                <button
                    type="button"
                    onClick={onCreateLobby}
                    className="flex h-[45px] w-[200px] items-center justify-center gap-2 rounded-lg bg-[var(--monomat-primary)] text-[15px] font-bold text-white transition hover:bg-[var(--monomat-primary-hover)]"
                >
                    <Compass size={21} strokeWidth={2} aria-hidden="true" />
                    {MAP_MANAGE_PAGE_COPY.CREATE_LOBBY}
                </button>
                <button
                    type="button"
                    onClick={handleEditClick}
                    disabled={isEditDisabled}
                    className="flex h-[45px] min-w-20 items-center justify-center gap-1.5 rounded-lg border border-[var(--monomat-border-input)] bg-white px-4 text-[15px] font-bold text-black transition hover:bg-[var(--monomat-page-bg)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <Pencil size={16} strokeWidth={2} aria-hidden="true" />
                    {MAP_MANAGE_PAGE_COPY.EDIT}
                </button>
                <button
                    type="button"
                    onClick={onDelete}
                    aria-label={MAP_MANAGE_PAGE_COPY.DELETE_ARIA_LABEL(
                        map.title,
                    )}
                    className="ml-auto flex h-[45px] min-w-20 items-center justify-center gap-1.5 rounded-lg border border-[var(--monomat-border-input)] bg-white px-4 text-[15px] font-bold text-black transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                >
                    <Trash2 size={17} strokeWidth={2} aria-hidden="true" />
                    {MAP_MANAGE_PAGE_COPY.DELETE}
                </button>
            </div>
        </section>
    );
}
