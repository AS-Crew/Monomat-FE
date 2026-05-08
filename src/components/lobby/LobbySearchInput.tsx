interface LobbySearchInputProps {
    value: string;
    onChange: (value: string) => void;
}

export function LobbySearchInput({
                                     value,
                                     onChange,
                                 }: LobbySearchInputProps) {
    return (
        <input
            type="text"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="로비 제목 검색"
            className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 shadow-sm focus:border-blue-400 focus:outline-none"
        />
    );
}