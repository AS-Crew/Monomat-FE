interface LobbyCategoryFilterProps<TCategory extends string> {
    categories: readonly TCategory[];
    selectedCategory: TCategory;
    onChange: (value: TCategory) => void;
}

export function LobbyCategoryFilter<TCategory extends string>({
                                                                  categories,
                                                                  selectedCategory,
                                                              onChange,
                                                          }: LobbyCategoryFilterProps<TCategory>) {
    return (
        <div className="mb-[18px] flex h-8 items-center gap-[9px]">
            {categories.map((category) => (
                <button
                    key={category}
                    type="button"
                    onClick={() => onChange(category)}
                    className={`h-8 rounded-full px-[15px] text-[13px] leading-none transition ${
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
