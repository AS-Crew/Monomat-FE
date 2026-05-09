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
        <>
            <div className="mb-4 flex items-center gap-3">
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
        </>
    );
}