import { create } from 'zustand';

interface CounterState {
    count: number;
    increment: () => void;
}

// 뼈대 확인용 카운터 스토어
export const useStore = create<CounterState>((set) => ({
    count: 0,
    increment: () => set((state) => ({ count: state.count + 1 })),
}));