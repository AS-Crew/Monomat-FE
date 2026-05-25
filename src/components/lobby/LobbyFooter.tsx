export function LobbyFooter() {
    return (
        <footer className="h-[41px] shrink-0 border border-[color:var(--monomat-border-default)] bg-white text-sm leading-none text-[var(--monomat-text-muted)]">
            <div className="mx-auto flex h-full w-[1440px] items-center justify-between px-[35px]">
                <span>© 2026 Monomat. 실시간 멀티플레이 퀴즈.</span>

                <div className="flex items-center gap-[30px]">
                    <button type="button" className="hover:text-[var(--monomat-text-strong)]">
                        문의
                    </button>
                    <button type="button" className="hover:text-[var(--monomat-text-strong)]">
                        문제 신고
                    </button>
                    <button type="button" className="hover:text-[var(--monomat-text-strong)]">
                        이용약관
                    </button>
                    <button type="button" className="hover:text-[var(--monomat-text-strong)]">
                        개인정보처리방침
                    </button>
                </div>
            </div>
        </footer>
    );
}
