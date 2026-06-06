import { MapCreateSongCard } from './MapCreateSongCard';
import {
    MAP_CREATE_POLICY,
    MAP_MANAGE_PAGE_COPY,
} from '../../constants/map';

import type { ManageMapSongFormState } from '../../types/map';

interface MapManageSongEditorProps {
    songs: ManageMapSongFormState[];
    disabled: boolean;
    onAddSong: () => void;
    onChange: (
        songId: string,
        field: 'youtubeUrl' | 'hint' | 'startTime',
        value: string,
    ) => void;
    onAnswerChange: (
        songId: string,
        answerIndex: number,
        value: string,
    ) => void;
    onDurationChange: (
        songId: string,
        videoDurationSeconds: number | null,
    ) => void;
    onAddAnswer: (songId: string) => void;
    onDeleteAnswer: (songId: string, answerIndex: number) => void;
    onDeleteSong: (songId: string) => void;
    onMoveUp: (songId: string) => void;
    onMoveDown: (songId: string) => void;
}

export function MapManageSongEditor({
    songs,
    disabled,
    onAddSong,
    onChange,
    onAnswerChange,
    onDurationChange,
    onAddAnswer,
    onDeleteAnswer,
    onDeleteSong,
    onMoveUp,
    onMoveDown,
}: MapManageSongEditorProps) {
    return (
        <section className="mt-[30px] rounded-2xl bg-white p-5 shadow-[0_4px_16px_rgba(0,0,0,0.16)] sm:p-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="!m-0 !text-lg !font-bold !leading-6 !text-black">
                        {MAP_MANAGE_PAGE_COPY.SONG_LIST_TITLE}
                    </h2>
                    <p className="mt-1 text-sm font-medium leading-5 text-[var(--monomat-text-muted)]">
                        {MAP_MANAGE_PAGE_COPY.EDIT_SONG_LIST_DESCRIPTION}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onAddSong}
                    disabled={
                        disabled ||
                        songs.length >= MAP_CREATE_POLICY.MAX_SONG_COUNT
                    }
                    className="h-[45px] shrink-0 rounded-lg border border-[color:var(--monomat-border-input)] bg-white px-5 text-[15px] font-semibold text-black transition hover:border-[var(--monomat-primary)] disabled:cursor-not-allowed disabled:opacity-45"
                >
                    {MAP_MANAGE_PAGE_COPY.EDIT_ADD_SONG}
                </button>
            </div>

            <div className="mt-5 space-y-4">
                {songs.map((song, index) => (
                    <MapCreateSongCard
                        key={song.id}
                        index={index}
                        song={song}
                        canDeleteSong={
                            songs.length >
                            MAP_CREATE_POLICY.MIN_SONG_COUNT
                        }
                        canMoveUp={index > 0}
                        canMoveDown={index < songs.length - 1}
                        disabled={disabled}
                        onChange={onChange}
                        onAnswerChange={onAnswerChange}
                        onDurationChange={onDurationChange}
                        onAddAnswer={onAddAnswer}
                        onDeleteAnswer={onDeleteAnswer}
                        onDeleteSong={onDeleteSong}
                        onMoveUp={onMoveUp}
                        onMoveDown={onMoveDown}
                    />
                ))}
            </div>
        </section>
    );
}
