import { type ReactNode } from 'react';

import { BREAKPOINTS } from '../../constants/layout';

interface AppLayoutProps {
    children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
    return (
        <div
            className="min-h-screen w-full mx-auto bg-[#F5F5F7] text-[#333338]"
            style={{
                maxWidth: `${BREAKPOINTS.MAX_CONTENT}px`,
                minWidth: `${BREAKPOINTS.MIN_PC}px`,
            }}
        >
            {children}
        </div>
    );
}