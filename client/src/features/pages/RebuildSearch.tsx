import { useState } from "react";
import { rebuildSearchIndex } from "./pageApi";

export default function RebuildSearch() {
    const [message, setMessage] = useState<string>("");

    async function handleClick() {
        try {
            await rebuildSearchIndex();
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
            <p className="text-gray-600">
                This will rebuild the search index for all pages. It may take some time depending on the number of pages.
            </p>
            <button
                onClick={handleClick}
                className="bg-blue-500 text-white rounded-md py-2 px-4 hover:bg-blue-600"
            >
                Rebuild Search Index
            </button>
            {message && message.includes('successfully') && (
                <div className="mt-4 p-2 bg-green-100 text-green-800 rounded-md">
                    {message}
                </div>
            )}
            {message && !message.includes('successfully') && (
                <div className="mt-4 p-2 bg-red-100 text-red-800 rounded-md">
                    {message}
                </div>
            )}
        </div>
    );
}