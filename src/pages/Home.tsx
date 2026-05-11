import { NicknameForm } from '../components/home/NicknameForm';
import {
    HOME_COPY,
    HOME_FEATURES,
} from '../constants/home';

export const Home = () => {
    return (
        <main className="grid min-h-screen grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)] bg-[#F5F5F7]">
            <section className="flex flex-col bg-[#202433] px-16 py-16 text-white">
                <div className="flex items-center gap-4">
                    <div
                        aria-hidden
                        className="h-12 w-12 rounded-xl bg-blue-500"
                    />
                    <span className="text-3xl font-bold">
                        {HOME_COPY.SERVICE_NAME}
                    </span>
                </div>

                <div className="mt-14 max-w-[520px] text-left">
                    <h1 className="whitespace-pre-line text-[44px] font-extrabold leading-[1.25] tracking-tight text-white">
                        {HOME_COPY.TITLE}
                    </h1>

                    <p className="mt-9 whitespace-pre-line text-base leading-relaxed text-gray-300">
                        {HOME_COPY.DESCRIPTION}
                    </p>

                    <ul className="mt-11 space-y-4">
                        {HOME_FEATURES.map((feature) => (
                            <li
                                key={feature.label}
                                className="flex h-12 items-center gap-3 rounded-lg bg-white/10 px-5 text-base text-gray-200"
                            >
                                <span aria-hidden>{feature.icon}</span>
                                <span>{feature.label}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            <section className="flex items-center justify-center bg-[#F5F5F7] px-10">
                <NicknameForm />
            </section>
        </main>
    );
};