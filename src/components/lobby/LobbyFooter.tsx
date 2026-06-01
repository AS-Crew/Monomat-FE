export function LobbyFooter() {
    return (
        <footer className="shrink-0 border border-[color:var(--monomat-border-default)] bg-white text-sm leading-none text-[var(--monomat-text-muted)]">
            <div className="mx-auto flex min-h-10 w-full max-w-[1440px] flex-col gap-3 px-4 py-3 sm:px-6 md:flex-row md:items-center md:justify-between md:gap-4 md:py-0 lg:px-8 xl:px-10">
                <span>© 2026 Monomat. 실시간 멀티플레이 퀴즈.</span>

                <div className="flex flex-wrap items-center gap-x-[30px] gap-y-2">
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
