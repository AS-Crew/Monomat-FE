import { useRef } from 'react';
import { MonomatInput } from '../components/common/MonomatInput';
import { useAuthStore } from '../store/useAuthStore'; // Zustand 전역 스토어 연결
import { STORAGE_KEYS } from '../constants/storage';

/**
 * [아키텍처 지식: UUID Fallback 생성기]
 * @description 브라우저 환경에 따라 최적의 UUID를 생성하는 유틸리티 함수입니다.
 * 보안 컨텍스트(HTTPS)가 아니거나 구형 브라우저에서는 crypto API가 없을 수 있으므로,
 * 서비스의 호환성을 높이기 위해 수동으로 난수를 조합하는 방어 로직입니다.
 */

const generateFallbackUUID = () => {
    // 1. Web Crypto API를 지원하는 환경 (최우선)
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = crypto.getRandomValues(new Uint8Array(1))[0] % 16;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }

    // 2. 극단적인 레거시 환경을 위한 최후의 보루 (Math.random 활용)
    // 백엔드 게스트 발급 API가 완성되면 지워질 로직
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

export const Home = () => {
    const inputRef = useRef<HTMLInputElement>(null);
    const setSession = useAuthStore((state) => state.setSession);

    /**
     * @description 사용자가 닉네임을 입력하고 게임 입장을 시도할 때 실행되는 함수
     */

    const handleNicknameSubmit = (nickname: string) => {
        const trimmedName = nickname.trim();

        if (!trimmedName) {
            alert('닉네임을 입력해주세요.');
            return;
        }

        // 1. UUID 발급 (클라이언트 임시 발급)
        const guestUuid =
            typeof crypto !== 'undefined' && crypto.randomUUID
                ? crypto.randomUUID()
                : generateFallbackUUID();

        const sessionData = {
            uuid: guestUuid,
            nickname: trimmedName,
            createdAt: Date.now(),
        };

        // 2. localStorage 세션 저장 및 예외 처리 (Graceful Degradation)
        try {
            // 정상적인 상황: 브라우저 스토리지에 데이터를 영구 저장하여 새로고침(Graceful Reconnect) 대비
            localStorage.setItem(STORAGE_KEYS.GUEST_SESSION, JSON.stringify(sessionData));
            console.log('게스트 세션 생성 완료:', sessionData);
        } catch (error) {
            // 예외 상황: iOS Safari 시크릿 모드 등에서는 스토리지 할당량이 0일 수 있어 에러가 발생함
            console.error('로컬 스토리지 저장 실패:', error);
            // 아키텍처 전략: 입장을 차단하지 않고, 유저에게 현재 상황(새로고침 시 데이터 증발)만 명확히 고지합니다.
            alert('브라우저의 시크릿 모드이거나 저장 공간이 부족합니다. 게임은 진행할 수 있으나 새로고침 시 접속이 끊어질 수 있습니다.');
        }

        // 3. Zustand 스토어 업데이트 (메모리 상태 변경)
        // 스토리지가 실패했더라도, Zustand 스토어(메모리)에 값을 세팅하면
        // App.tsx의 <ProtectedRoute>가 열리며 현재 브라우저 탭에서는 정상적으로 게임 플레이가 가능합니다.
        setSession(guestUuid, trimmedName);
    };

    const onButtonClick = () => {
        if (inputRef.current) {
            handleNicknameSubmit(inputRef.current.value);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white px-4">
            <div className="text-center mb-10">
                <h1 className="text-6xl font-black mb-4 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                    MONOMAT
                </h1>
                <p className="text-gray-400 text-lg">YouTube 음악 퀴즈를 실시간으로 즐기세요.</p>
            </div>

            <div className="w-full max-w-md flex flex-col gap-3">
                <div className="relative group">
                    <MonomatInput
                        ref={inputRef}
                        type="text"
                        placeholder="닉네임을 입력하세요"
                        maxLength={12}
                        autoFocus
                        onEnter={handleNicknameSubmit}
                        className="w-full px-5 py-4 text-xl bg-gray-900 border-2 border-gray-800 rounded-2xl outline-none focus:border-blue-500 transition-all text-white placeholder-gray-600"
                    />

                    <button
                        onClick={onButtonClick}
                        className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2 bg-blue-600 hover:bg-blue-500 active:scale-95 rounded-xl font-bold transition-all"
                        aria-label="게임 입장"
                    >
                        입장
                    </button>
                </div>

                <p className="text-center text-xs text-gray-500 mt-2">
                    별도의 회원가입 없이 즉시 플레이가 가능합니다.
                </p>
            </div>
        </div>
    );
};