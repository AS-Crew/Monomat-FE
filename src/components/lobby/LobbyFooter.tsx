export function LobbyFooter() {
    return (
        <footer className="flex h-10 shrink-0 items-center justify-between border-t border-gray-200 bg-white px-10 text-sm text-gray-500">
            <span>© 2026 Monomat. 실시간 멀티플레이 퀴즈.</span>

            <div className="flex items-center gap-6">
                <button type="button" className="hover:text-gray-700">
                    문제 신고
                </button>
                <button type="button" className="hover:text-gray-700">
                    이용약관
                </button>
                <button type="button" className="hover:text-gray-700">
                    개인정보처리방침
                </button>
            </div>
        </footer>
    );
}