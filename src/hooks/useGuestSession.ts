import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { generateUUID } from '../utils/uuid';
import { STORAGE_KEYS } from '../constants/storage';

interface UseGuestSessionReturn {
    createGuestSession: (nickname: string) => void;
}

export function useGuestSession(): UseGuestSessionReturn {
    const setSession = useAuthStore((state) => state.setSession);
    const navigate = useNavigate();

    const createGuestSession = (nickname: string) => {
        const trimmedNickname = nickname.trim();

        if (!trimmedNickname) {
            alert('닉네임을 입력해주세요.');
            return;
        }

        const guestUuid = generateUUID();
        const sessionData = {
            uuid: guestUuid,
            nickname: trimmedNickname,
            createdAt: Date.now(),
        };

        try {
            localStorage.setItem(
                STORAGE_KEYS.GUEST_SESSION,
                JSON.stringify(sessionData),
            );
            console.log('[useGuestSession] 게스트 세션 생성 완료:', trimmedNickname);
        } catch (error) {
            console.error('[useGuestSession] localStorage 저장 실패:', error);
            alert(
                '브라우저의 시크릿 모드이거나 저장 공간이 부족합니다.\n' +
                '게임은 진행할 수 있으나 새로고침 시 접속이 끊어질 수 있습니다.',
            );
        }

        setSession(guestUuid, trimmedNickname);
        navigate('/lobbies');
    };

    return { createGuestSession };
}