import { useState } from "react";
import { rebuildSearchIndex } from "./pageApi";

export default function RebuildSearch() {
    const [message, setMessage] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);

    async function handleClick() {
        try {
            setIsLoading(true);
            await rebuildSearchIndex();
            setIsLoading(false);
            setMessage("Search index rebuilt successfully.");
        }
        catch (error) {
            console.error("Error rebuilding search index:", error);
            setMessage("Failed to rebuild search index. Please try again later.");
        }
    }

    return (
        <div className="w-full flex flex-col gap-4">
            <h1 className="text-2xl font-bold">Rebuild Search Index</h1>
            <p className="text-gray-600 dark:text-gray-400">
                This will rebuild the search index for all pages. It may take some time depending on the number of pages.
            </p>
            <button disabled={isLoading}
                onClick={handleClick}
                className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-md py-2 px-4"
            >
                {isLoading ? "Rebuilding..." : "Rebuild Search Index"}
            </button>
            {message && message.includes('successfully') && (
                <div className="mt-4 p-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-md">
                    {message}
                </div>
            )}
            {message && !message.includes('successfully') && (
                <div className="mt-4 p-2 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-md">
                    {message}
                </div>
            )}
        </div>
    );
}