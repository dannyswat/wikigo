import { ChangeEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { PageMeta, searchPages } from "./pageApi";
import { IconFidgetSpinner } from "@tabler/icons-react";

export default function Search() {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeSearchQuery, setActiveSearchQuery] = useState<string>('');
    const [searchResults, setSearchResults] = useState<PageMeta[]>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function handleSearchQueryChange(e: ChangeEvent<HTMLInputElement>) {
        setSearchQuery(e.target.value);
    }

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            setSearchResults(undefined);
            setActiveSearchQuery('');
            setError(null);
            return;
        }
        if (searchQuery === activeSearchQuery && searchResults) {
            return;
        }
        setLoading(true);
        setError(null);
        setActiveSearchQuery(searchQuery);
        try {
            const results = await searchPages(searchQuery);
            setSearchResults(results);
        } catch (err) {
            setError(t('Failed to fetch search results'));
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full flex flex-col gap-4">
            <section className="flex flex-row items-center">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchQueryChange}
                    placeholder={t("Enter search query")}
                    className="basis-3/4 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md p-2"
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <div className="basis-1/4 flex justify-end ps-2">
                    <button
                        onClick={handleSearch}
                        disabled={loading}
                        className="bg-lime-700 hover:bg-lime-800 dark:bg-lime-600 dark:hover:bg-lime-700 text-white rounded-md py-2 px-5 box-border"
                    >
                        {loading ? (
                            <IconFidgetSpinner className="animate-spin mx-auto" />
                        ) : (
                            t("Search")
                        )}
                    </button>
                </div>
            </section>

            {error && (
                <section className="flex flex-row">
                    <div className="w-full p-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 rounded-md">
                        {error}
                    </div>
                </section>
            )}

            {searchResults && searchResults.length > 0 && (
                <section>
                    <h2 className="text-lg font-semibold mb-4">
                        {t("Search Results for")} "{activeSearchQuery}" ({searchResults.length})
                    </h2>
                    <div className="space-y-3">
                        {searchResults.map((page) => (
                            <div key={page.id} className="border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-md p-4">
                                <a
                                    href={`/p${page.url}`}
                                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-lg"
                                >
                                    {page.title}
                                </a>
                                {page.url && (
                                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        {page.url}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {searchQuery && !loading && searchResults?.length === 0 && !error && (
                <section className="flex flex-row">
                    <div className="w-full text-center py-8 text-gray-500 dark:text-gray-400 border-2 border-gray-200 dark:border-gray-700 rounded-md">
                        {t("No pages found for")} "{activeSearchQuery}"
                    </div>
                </section>
            )}
        </div>
    );
}