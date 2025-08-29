import { IconLock } from "@tabler/icons-react";
import { PageMetaObject } from "./pageTree";
import { useTranslation } from "react-i18next";

interface PageListProps {
    pages: PageMetaObject[];
    onPageClick: (page: PageMetaObject) => void;
}

export default function PageList({ pages, onPageClick }: PageListProps) {
    const { t } = useTranslation();
    if (pages.length === 0) {
        return null;
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                        <svg className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        {t('List of Pages')}
                    </h3>
                </div>
            </div>

            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {pages.map((page, _) => (
                    <li key={page.id} className="group">
                        <a
                            href={"/p" + page.url}
                            className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 ease-in-out focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-700/50 focus:ring-2 focus:ring-inset focus:ring-blue-500 dark:focus:ring-blue-400"
                            onClick={(e) => {
                                e.preventDefault();
                                onPageClick(page);
                            }}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3 min-w-0 flex-1">
                                    <div className="flex-shrink-0">
                                        <div className="w-2 h-2 bg-teal-500 dark:bg-teal-400 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-200"></div>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors duration-200">
                                            {page.title} {page.isProtected && <IconLock className="inline-block ml-1 text-gray-400 dark:text-gray-500" />}
                                        </h4>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3 flex-shrink-0">
                                    <svg
                                        className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-teal-500 dark:group-hover:text-teal-400 transition-colors duration-200 transform group-hover:translate-x-0.5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}