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
import { MonomatLogo } from '../components/common/MonomatLogo';

const FEATURE_ICON: Record<
    (typeof HOME_FEATURES)[number]['iconName'],
    LucideIcon
> = {
    music: Music,
    rocket: Rocket,
    users: Users,
};

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
            <main className="flex min-h-screen min-w-0 items-start justify-center bg-[var(--monomat-page-bg)] px-5 py-8 sm:py-[72px] lg:pt-[105px]">
                <NicknameForm
                    mode={authMode}
                    onModeChange={setAuthMode}
                />
            </main>
        );
    }

    return (
        <main className="grid min-h-screen min-w-0 grid-cols-1 bg-[var(--monomat-page-bg)] md:grid-cols-[minmax(360px,39vw)_minmax(0,1fr)] xl:grid-cols-[560px_minmax(0,1fr)]">
            <section className="flex min-w-0 flex-col bg-[#0F172A] px-5 py-8 text-white sm:px-10 sm:py-12 md:px-8 md:py-14 lg:px-12 lg:py-20 xl:px-[60px] xl:py-[140px]">
                <MonomatLogo
                    variant="white"
                    className="min-w-0"
                />

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

            <section className="flex min-w-0 items-start justify-center bg-[var(--monomat-page-bg)] px-5 py-8 sm:px-8 sm:py-12 md:px-6 md:pt-[72px] lg:px-8 lg:pt-[105px] xl:px-10">
                <NicknameForm
                    mode={authMode}
                    onModeChange={setAuthMode}
                />
            </section>
        </main>
    );
};
