import { type ReactNode } from 'react';

import { BREAKPOINTS } from '../../constants/layout';
import { useWindowSize } from '../../hooks/useWindowSize';
import { MobileUnsupportedPage } from '../../pages/MobileUnsupportedPage';

interface ViewportGuardProps {
    children: ReactNode;
}

export function ViewportGuard({ children }: ViewportGuardProps) {
    const { width } = useWindowSize();
    const isUnsupportedViewport = width < BREAKPOINTS.MIN_PC;

    if (isUnsupportedViewport) {
        return <MobileUnsupportedPage />;
    }

    return children;
}
