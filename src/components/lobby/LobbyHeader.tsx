import { LobbyCategoryFilter } from './LobbyCategoryFilter';
import { LobbySearchInput } from './LobbySearchInput';
import {
    LobbySortDropdown,
    type LobbySortOption,
} from './LobbySortDropdown';

interface LobbyHeaderProps<TCategory extends string> {
    searchKeyword: string;
    onSearchKeywordChange: (value: string) => void;
    categories: readonly TCategory[];
    selectedCategory: TCategory;
    onSelectedCategoryChange: (value: TCategory) => void;
    sortOption: LobbySortOption;
    onSortOptionChange: (value: LobbySortOption) => void;
}

export function LobbyHeader<TCategory extends string>({
                                                          searchKeyword,
                                                          onSearchKeywordChange,
                                                          categories,
                                                          selectedCategory,
                                                          onSelectedCategoryChange,
                                                          sortOption,
                                                          onSortOptionChange,
}: LobbyHeaderProps<TCategory>) {
    return (
        <header className="mb-[18px]">
            <div className="mb-3 flex flex-col gap-2 sm:flex-row">
                <LobbySearchInput
                    value={searchKeyword}
                    onChange={onSearchKeywordChange}
                />

                <LobbySortDropdown
                    value={sortOption}
                    onChange={onSortOptionChange}
                />
            </div>

            <LobbyCategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onChange={onSelectedCategoryChange}
            />
        </header>
    );
}
