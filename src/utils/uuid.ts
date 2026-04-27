// UUID v4를 브라우저 환경에 따라 안전하게 생성하는 유틸리티 함수를 제공한다.

/**
 * 브라우저 환경에 따라 최적의 방법으로 UUID v4를 생성한다.
 *
 * [우선순위 전략]
 * 1순위 - crypto.randomUUID()
 *         최신 브라우저 + 보안 컨텍스트(HTTPS)에서만 사용 가능.
 *         가장 안전하고 명세에 맞는 UUID를 반환한다.
 *
 * 2순위 - crypto.getRandomValues()
 *         crypto API는 있지만 randomUUID가 없는 구형 브라우저용 폴백.
 *         암호학적으로 안전한 난수를 직접 조합하여 UUID 형식을 만든다.
 *
 * 3순위 - Math.random()
 *         crypto API 자체가 없는 극단적 레거시 환경용 최후의 수단.
 *         암호학적으로 안전하지 않으므로 경고 로그를 남긴다.
 *         백엔드 게스트 UUID 발급 API 완성 시 이 분기는 제거될 예정입니다.
 *
 * @returns UUID v4 형식의 문자열 (예: '550e8400-e29b-41d4-a716-446655440000')
 */

export function generateUUID(): string {
    // 1순위: crypto.randomUUID() 지원 여부 확인
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }

    // 2순위: crypto.getRandomValues() 지원 여부 확인
    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
        // UUID v4 형식: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
        // '4'는 버전 4를 의미하며, 'y'는 variant 자리로 8, 9, a, b 중 하나여야 한다.
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
            // 암호학적으로 안전한 0~255 범위의 난수 1개를 생성한다.
            const randomByte = crypto.getRandomValues(new Uint8Array(1))[0];

            // 0~15 범위로 좁힌다. (UUID 한 자리는 16진수 1자리이므로)
            const randomNibble = randomByte % 16;

            // 'x' 자리: 그대로 사용
            // 'y' 자리: UUID v4 명세에 따라 상위 2비트를 '10'으로 고정 (0x8 ~ 0xb)
            const value = char === 'x' ? randomNibble : (randomNibble & 0x3) | 0x8;

            return value.toString(16);
        });
    }

    // 3순위: Math.random() 폴백 (레거시 환경 전용)
    console.warn(
        '[generateUUID] crypto API를 사용할 수 없는 환경입니다. ' +
        'Math.random() 기반의 UUID를 생성합니다. ' +
        '이 UUID는 암호학적으로 안전하지 않습니다.',
    );

    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
        const randomNibble = Math.floor(Math.random() * 16);
        const value = char === 'x' ? randomNibble : (randomNibble & 0x3) | 0x8;
        return value.toString(16);
    });
}