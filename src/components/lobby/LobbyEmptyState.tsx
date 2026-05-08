export function LobbyEmptyState() {
    return (
        <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 flex h-40 items-center justify-center text-gray-400">
                현재 조건에 맞는 로비가 없습니다.
            </div>
        </div>
    );
}