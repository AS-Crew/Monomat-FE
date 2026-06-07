interface LobbyCategoryFilterProps<TCategory extends string> {
    categories: readonly TCategory[];
    selectedCategory: TCategory;
    onChange: (value: TCategory) => void;
    className?: string;
}

export function LobbyCategoryFilter<TCategory extends string>({
    categories,
    selectedCategory,
    onChange,
    className = 'mb-[18px]',
}: LobbyCategoryFilterProps<TCategory>) {
    return (
        <div
            className={`${className} flex min-w-0 flex-wrap items-center gap-[9px]`}
        >
            {categories.map((category) => (
                <button
                    key={category}
                    type="button"
                    onClick={() => onChange(category)}
                    aria-pressed={selectedCategory === category}
                    className={`h-8 shrink-0 rounded-full px-[15px] text-[13px] leading-none transition ${
                        selectedCategory === category
                            ? 'bg-[var(--monomat-primary)] font-semibold text-white'
                            : 'border border-[color:var(--monomat-border-input)] bg-white font-normal text-[var(--monomat-text-muted)] hover:bg-[var(--monomat-page-bg)]'
                    }`}
                >
                    {category}
                </button>
            ))}
        </div>
    );
}
