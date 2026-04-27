// 게임 진입점 페이지의 레이아웃과 구조만 담당한다.
// 닉네임 입력 UI를 렌더링하고, useGuestSession 훅을 통해 세션 생성을 위임한다.
// 입력 및 세션 로직은 NicknameForm 컴포넌트에 위임한다.

import { NicknameForm } from '../components/home/NicknameForm';

/**
 * [홈 페이지 컴포넌트]
 *
 * 이 컴포넌트의 책임:
 *   - 서비스 타이틀, 설명 문구, NicknameForm의 레이아웃 구성
 *
 * 이 컴포넌트가 하지 않는 것:
 *   - 닉네임 입력값 처리, 세션 생성, 훅 직접 호출
 *     → NicknameForm과 useGuestSession 훅이 담당한다.
 */

export const Home = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white px-4">

            {/* 서비스 헤더 영역: 타이틀과 설명 문구 */}
            <div className="text-center mb-10">
                <h1 className="text-6xl font-black mb-4 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                    MONOMAT
                </h1>
                <p className="text-gray-400 text-lg">
                    YouTube 음악 퀴즈를 실시간으로 즐기세요.
                </p>
            </div>

            {/*
             * 닉네임 입력 폼 영역
             * 입력 UI, 버튼 핸들러, 세션 생성 로직이 모두 이 컴포넌트 안에 있다.
             * Home은 이 컴포넌트를 "어디에 배치할지"만 결정한다.
             */}
            <NicknameForm />
        </div>
    );
};