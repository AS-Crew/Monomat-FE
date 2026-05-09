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
        <div className="mb-5 flex gap-2">
            {categories.map((category) => (
                <button
                    key={category}
                    type="button"
                    onClick={() => onChange(category)}
                    className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                        selectedCategory === category
                            ? 'bg-blue-500 text-white'
                            : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                >
                    {category}
                </button>
            ))}
        </div>
    );
}