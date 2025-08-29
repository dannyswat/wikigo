import { useState } from "react";
import { rebuildThumbnails } from "./uploadApi";
import { useTranslation } from "react-i18next";

export default function RebuildThumbnail() {
    const { t } = useTranslation();
    const [message, setMessage] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);

    async function handleClick() {
        try {
            setIsLoading(true);
            await rebuildThumbnails();
            setIsLoading(false);
            setMessage(t('Thumbnails rebuilt successfully.'));
        }
        catch (error) {
            console.error("Error rebuilding thumbnails:", error);
            setMessage(t("Failed to rebuild thumbnails. Please try again later."));
        }
    }

    return (
        <div className="w-full flex flex-col gap-4">
            <h1 className="text-2xl font-bold">{t('Rebuild Thumbnails')}</h1>
            <p className="text-gray-600 dark:text-gray-400">
                {t('This will rebuild the thumbnails for all images. It may take some time depending on the number of images.')}
            </p>
            <button disabled={isLoading}
                onClick={handleClick}
                className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-md py-2 px-4"
            >
                {isLoading ? t("Rebuilding...") : t("Rebuild Thumbnails")}
            </button>
            {message && message === t('Thumbnails rebuilt successfully.') && (
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