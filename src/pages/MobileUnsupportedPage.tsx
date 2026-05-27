import { MonomatLogo } from '../components/common/MonomatLogo';

const MOBILE_UNSUPPORTED_COPY = {
    TITLE: 'Monomat은 현재 데스크톱 환경에 최적화되어 있습니다.',
    TITLE_PREFIX: 'Monomat은 현재 ',
    TITLE_HIGHLIGHT: '데스크톱',
    TITLE_SUFFIX: ' 환경에',
    TITLE_SECOND_LINE: '최적화되어 있습니다.',
    DESCRIPTION:
        '원활한 실시간 음악 퀴즈 플레이를 위해 PC 또는 태블릿 가로 화면에서 접속해주세요.',
    DESCRIPTION_FIRST_LINE: '원활한 실시간 음악 퀴즈 플레이를 위해',
    DESCRIPTION_SECOND_LINE: 'PC 또는 태블릿 가로 화면에서 접속해주세요.',
    FOOTER: '© 2026 Monomat. 실시간 멀티플레이 퀴즈.',
} as const;

export function MobileUnsupportedPage() {
    return (
        <div className="flex min-h-screen flex-col bg-[var(--monomat-page-bg)] text-[var(--monomat-text-strong)]">
            <header className="h-[75px] shrink-0 border border-[color:var(--monomat-border-default)] bg-white">
                <div className="mx-auto flex h-full w-full max-w-[768px] items-center px-6 sm:px-[42px]">
                    <MonomatLogo className="h-[37px] w-[170px]" />
                </div>
            </header>

            <main className="relative min-h-[640px] flex-1 text-center">
                <section
                    className="absolute left-1/2 top-[243px] flex h-[188px] w-full max-w-[768px] -translate-x-1/2 items-center justify-center px-6"
                    aria-labelledby="mobile-unsupported-title"
                >
                    <div
                        id="mobile-unsupported-title"
                        role="heading"
                        aria-level={1}
                        aria-label={MOBILE_UNSUPPORTED_COPY.TITLE}
                        className="text-[30px] font-extrabold leading-[1.28] tracking-normal text-[var(--monomat-text-strong)] sm:text-[37px] sm:leading-normal"
                    >
                        <span>{MOBILE_UNSUPPORTED_COPY.TITLE_PREFIX}</span>
                        <span className="text-[33px] text-[var(--monomat-primary)] sm:text-[40px]">
                            {MOBILE_UNSUPPORTED_COPY.TITLE_HIGHLIGHT}
                        </span>
                        <span>{MOBILE_UNSUPPORTED_COPY.TITLE_SUFFIX}</span>
                        <br />
                        <span>{MOBILE_UNSUPPORTED_COPY.TITLE_SECOND_LINE}</span>
                    </div>
                </section>

                <div
                    aria-label={MOBILE_UNSUPPORTED_COPY.DESCRIPTION}
                    className="absolute left-1/2 top-[431px] flex h-[73px] w-full max-w-[768px] -translate-x-1/2 flex-col items-center justify-center px-6 text-[18px] font-medium leading-normal text-[var(--monomat-text-muted)] sm:text-xl"
                >
                    <span className="block">
                        {MOBILE_UNSUPPORTED_COPY.DESCRIPTION_FIRST_LINE}
                    </span>
                    <span className="block">
                        {MOBILE_UNSUPPORTED_COPY.DESCRIPTION_SECOND_LINE}
                    </span>
                </div>
            </main>

            <footer className="h-10 shrink-0 border border-[color:var(--monomat-border-default)] bg-white text-left text-sm leading-none text-[var(--monomat-text-muted)]">
                <div className="mx-auto flex h-full w-full max-w-[768px] items-center px-6 sm:px-[42px]">
                    <span>{MOBILE_UNSUPPORTED_COPY.FOOTER}</span>
                </div>
            </footer>
        </div>
    );
}
