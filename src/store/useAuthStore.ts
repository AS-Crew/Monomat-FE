import { create } from 'zustand';

interface AuthState {
    uuid: string | null;
    nickname: string | null;
    isGuest: boolean;

    // 상태 변경 액션
    setSession: (uuid: string, nickname: string) => void;
    clearSession: () => void;

    // 초기 로드 시 localStorage를 확인하여 스토어를 업데이트하는 함수
    initializeSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    uuid: null,
    nickname: null,
    isGuest: false,

    setSession: (uuid, nickname) =>
        set({ uuid, nickname, isGuest: true }),

    clearSession: () => {
        localStorage.removeItem('monomat_guest_session');
        set({ uuid: null, nickname: null, isGuest: false });
    },

    initializeSession: () => {
        try {
            const storedData = localStorage.getItem('monomat_guest_session');
            if (storedData) {
                const parsed = JSON.parse(storedData);
                // 저장된 데이터가 유효한지 검증
                if (parsed.uuid && parsed.nickname) {
                    set({
                        uuid: parsed.uuid,
                        nickname: parsed.nickname,
                        isGuest: true
                    });
                    console.log('세션 복구 완료:', parsed.nickname);
                }
            }
        } catch (error) {
            console.error('세션 파싱 중 오류 발생:', error);
            // 데이터가 오염되었을 경우 초기화
            localStorage.removeItem('monomat_guest_session');
        }
    }
}));