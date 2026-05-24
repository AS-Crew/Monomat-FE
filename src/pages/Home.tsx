import { useEffect, useState } from 'react';
import {
    Music,
    Rocket,
    Users,
    type LucideIcon,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import {
    NicknameForm,
    type AuthMode,
} from '../components/home/NicknameForm';
import {
    HOME_COPY,
    HOME_FEATURES,
} from '../constants/home';
import { useAuthStore } from '../store/useAuthStore';

const FEATURE_ICON: Record<
    (typeof HOME_FEATURES)[number]['iconName'],
    LucideIcon
> = {
    music: Music,
    rocket: Rocket,
    users: Users,
};

function MonomatLogoMark() {
    return (
        <svg
            aria-hidden
            className="h-10 w-10 shrink-0 lg:h-12 lg:w-12"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <rect
                x="1.5"
                y="1.5"
                width="45"
                height="45"
                rx="11"
                fill="#FEFEFE"
                stroke="#3873E5"
                strokeWidth="3"
            />
            <path
                d="M20.25 8.95C18.75 8.08 16.88 9.16 16.88 10.89V25.11C16.88 26.84 18.75 27.92 20.25 27.05L32.58 19.94C34.08 19.07 34.08 16.93 32.58 16.06L20.25 8.95Z"
                fill="#3873E5"
            />
            <rect x="11" y="31" width="3.5" height="9" rx="1.75" fill="#3873E5" />
            <rect x="18" y="28" width="3.5" height="12" rx="1.75" fill="#3873E5" />
            <rect x="26" y="32" width="3.5" height="9" rx="1.75" fill="#3873E5" />
            <rect x="33.75" y="30" width="3.5" height="10" rx="1.75" fill="#3873E5" />
        </svg>
    );
}

export const Home = () => {
    const navigate = useNavigate();
    const accessToken = useAuthStore((state) => state.accessToken);
    const isHydrated = useAuthStore((state) => state.isHydrated);
    const [authMode, setAuthMode] = useState<AuthMode>('member');
    const isRegisterMode = authMode === 'register';

    const description =
        authMode === 'member'
            ? HOME_COPY.LOGIN_DESCRIPTION
            : HOME_COPY.GUEST_DESCRIPTION;

    useEffect(() => {
        if (isHydrated && accessToken) {
            navigate('/lobbies', { replace: true });
        }
    }, [accessToken, isHydrated, navigate]);

    if (!isHydrated || accessToken) {
        return null;
    }

    if (isRegisterMode) {
        return (
            <main className="flex min-h-screen min-w-0 items-start justify-center bg-[var(--monomat-page-bg)] px-5 pt-[124px]">
                <NicknameForm
                    mode={authMode}
                    onModeChange={setAuthMode}
                />
            </main>
        );
    }

    return (
        <main className="grid min-h-screen min-w-0 grid-cols-1 bg-[var(--monomat-page-bg)] md:grid-cols-[minmax(300px,42vw)_minmax(0,1fr)] lg:grid-cols-[minmax(380px,42vw)_minmax(0,1fr)] xl:grid-cols-[600px_minmax(0,1fr)]">
            <section className="flex min-w-0 flex-col bg-[#1F2433] px-6 py-10 text-white sm:px-10 md:px-8 md:py-14 lg:px-12 lg:py-20 xl:px-[60px] xl:py-[106px]">
                <div className="flex min-w-0 items-center gap-3 lg:gap-[13px]">
                    <MonomatLogoMark />
                    <span className="min-w-0 text-[24px] font-extrabold leading-none lg:text-[28px]">
                        {HOME_COPY.SERVICE_NAME}
                    </span>
                </div>

                <div className="mt-10 min-w-0 max-w-[440px] text-left sm:mt-14 md:mt-16 lg:mt-20 xl:mt-[98px]">
                    <h1 className="m-0 whitespace-pre-line break-keep text-[32px] font-extrabold leading-[44px] tracking-normal !text-white sm:text-[36px] sm:leading-[50px] md:text-[34px] md:leading-[48px] lg:text-[40px] lg:leading-[56px]">
                        {HOME_COPY.TITLE}
                    </h1>

                    <p className="mt-5 whitespace-pre-line break-keep text-[15px] font-medium leading-[25px] text-[#B8B8C7] lg:mt-[23px] lg:text-base lg:leading-[26px]">
                        {description}
                    </p>

                    <ul className="mt-9 w-full max-w-[440px] space-y-3 sm:mt-10 lg:mt-[58px] lg:space-y-5">
                        {HOME_FEATURES.map((feature) => {
                            const FeatureIcon = FEATURE_ICON[feature.iconName];

                            return (
                                <li
                                    key={feature.label}
                                    className="flex min-h-10 w-full min-w-0 items-center gap-[9px] rounded-lg bg-white/10 px-3 py-2 text-[15px] font-medium leading-5 text-[#E5E5F0]"
                                >
                                    <FeatureIcon
                                        aria-hidden
                                        className="shrink-0"
                                        size={24}
                                        strokeWidth={1.7}
                                    />
                                    <span className="min-w-0 break-keep">
                                        {feature.label}
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </section>

            <section className="flex min-w-0 items-start justify-center bg-[var(--monomat-page-bg)] px-5 py-8 sm:px-8 sm:py-10 md:px-6 md:pt-14 lg:px-8 lg:pt-20 xl:px-10 xl:pt-[106px]">
                <NicknameForm
                    mode={authMode}
                    onModeChange={setAuthMode}
                />
            </section>
        </main>
    );
};
