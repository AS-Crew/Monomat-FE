import {
    Clock3,
    Link2,
    ListChecks,
    Music2,
    Sparkles,
} from 'lucide-react';

import {
    MAP_CREATE_GUIDE_STEPS,
    MAP_CREATE_PAGE_COPY,
} from '../../constants/map';

const guideIcons = [Music2, Link2, ListChecks, Clock3] as const;

export function MapCreateGuide() {
    return (
        <section className="rounded-lg border border-[var(--monomat-primary)] bg-[rgba(56,115,229,0.1)] px-4 py-4 shadow-[0_4px_16px_rgba(0,0,0,0.14)] sm:px-6">
            <div className="flex items-center gap-2 text-base font-semibold text-[var(--monomat-text-primary)]">
                <Sparkles
                    size={21}
                    className="text-[var(--monomat-primary)]"
                    aria-hidden="true"
                />
                <h2 className="!m-0 !text-base !font-semibold !leading-6 !text-[var(--monomat-text-primary)]">
                    {MAP_CREATE_PAGE_COPY.GUIDE_TITLE}
                </h2>
            </div>

            <ol className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
                {MAP_CREATE_GUIDE_STEPS.map((step, index) => {
                    const Icon = guideIcons[index];

                    return (
                        <li
                            key={step.title}
                            className="min-h-[110px] rounded-lg border border-[color:var(--monomat-border-input)] bg-white p-3"
                        >
                            <div className="flex items-center gap-2">
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--monomat-primary)] text-sm font-semibold text-white">
                                    {index + 1}
                                </span>
                                <Icon
                                    size={21}
                                    className="shrink-0 text-[var(--monomat-primary)]"
                                    aria-hidden="true"
                                />
                                <h3 className="text-base font-bold leading-6 text-black">
                                    {step.title}
                                </h3>
                            </div>
                            <div className="flex min-h-[52px] items-center">
                                <p className="text-xs font-medium leading-[17px] text-[var(--monomat-text-secondary)]">
                                    {step.description}
                                </p>
                            </div>
                        </li>
                    );
                })}
            </ol>

            <p className="mt-2 text-[13px] leading-5 text-[var(--monomat-text-secondary)]">
                {MAP_CREATE_PAGE_COPY.GUIDE_TIP}
            </p>
        </section>
    );
}
