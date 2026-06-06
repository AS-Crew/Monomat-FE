const ANSWER_METADATA_PATTERN =
    /\[[^\]]*\]|\([^)]*\)|(official\s+video|official\s+audio|official\s+mv|official\s+music\s+video|official|mv|audio)/giu;
const ANSWER_REMOVED_CHARACTER_PATTERN = /[\p{White_Space}\u00A0\u3000,，]/gu;

export function cleanAnswerMetadata(raw: string | null | undefined) {
    if (raw == null) {
        return '';
    }

    return raw.replace(ANSWER_METADATA_PATTERN, '').trim();
}

export function normalizeAnswer(raw: string | null | undefined) {
    if (raw == null) {
        return '';
    }

    const compactAnswer = cleanAnswerMetadata(raw)
        .normalize('NFC')
        .replace(ANSWER_REMOVED_CHARACTER_PATTERN, '');

    // BE의 Character.toLowerCase(codePoint)처럼 문자별 단순 소문자화를 적용한다.
    return Array.from(compactAnswer, (character) =>
        character === '\u0130' ? 'i' : character.toLowerCase(),
    ).join('');
}

export function normalizeAnswerList(
    raw: ReadonlyArray<string | null | undefined> | null | undefined,
) {
    if (!raw) {
        return [];
    }

    const normalizedAnswers = new Set<string>();

    raw.forEach((answer) => {
        const normalizedAnswer = normalizeAnswer(answer);

        if (normalizedAnswer) {
            normalizedAnswers.add(normalizedAnswer);
        }
    });

    return [...normalizedAnswers];
}
