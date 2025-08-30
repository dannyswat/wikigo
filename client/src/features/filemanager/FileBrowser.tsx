import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
    IconFolder,
    IconFile,
    IconArrowLeft,
    IconHome,
    IconFidgetSpinner,
    IconFileText,
    IconPhoto,
    IconFileZip,
    IconCode,
    IconFileMusic,
    IconVideo
} from "@tabler/icons-react";
import { listFiles, readFile, FileItem, ListFilesResponse } from "./fileManagerApi";

interface FileBrowserProps {
    className?: string;
    onFileSelect?: (file: FileItem) => void;
    allowedExtensions?: string[];
    showFileContent?: boolean;
}

export default function FileBrowser({
    className = "",
    onFileSelect,
    allowedExtensions,
    showFileContent = false
}: FileBrowserProps) {
    const { t } = useTranslation();
    const [currentPath, setCurrentPath] = useState("/");
    const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
    const [fileContent, setFileContent] = useState<string>("");
    const [isLoadingContent, setIsLoadingContent] = useState(false);

    const { data, isLoading, error, refetch } = useQuery<ListFilesResponse>({
        queryKey: ["fileList", currentPath],
        queryFn: () => listFiles(currentPath),
        refetchOnWindowFocus: false,
    });

    const getFileIcon = (file: FileItem) => {
        if (file.isDir) {
            return <IconFolder className="text-blue-500 dark:text-blue-400" size={20} />;
        }

        const extension = file.extension?.toLowerCase();
        switch (extension) {
            case ".txt":
            case ".md":
            case ".doc":
            case ".docx":
                return <IconFileText className="text-gray-600 dark:text-gray-400" size={20} />;
            case ".jpg":
            case ".jpeg":
            case ".png":
            case ".gif":
            case ".svg":
            case ".webp":
                return <IconPhoto className="text-green-500 dark:text-green-400" size={20} />;
            case ".zip":
            case ".rar":
            case ".tar":
            case ".gz":
                return <IconFileZip className="text-yellow-500 dark:text-yellow-400" size={20} />;
            case ".js":
            case ".ts":
            case ".jsx":
            case ".tsx":
            case ".html":
            case ".css":
            case ".json":
            case ".xml":
            case ".go":
            case ".py":
            case ".java":
            case ".cpp":
            case ".c":
            case ".cs":
                return <IconCode className="text-purple-500 dark:text-purple-400" size={20} />;
            case ".mp3":
            case ".wav":
            case ".flac":
            case ".aac":
                return <IconFileMusic className="text-pink-500 dark:text-pink-400" size={20} />;
            case ".mp4":
            case ".avi":
            case ".mkv":
            case ".mov":
            case ".webm":
                return <IconVideo className="text-red-500 dark:text-red-400" size={20} />;
            default:
                return <IconFile className="text-gray-500 dark:text-gray-400" size={20} />;
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return `0 ${t('Bytes')}`;
        const k = 1024;
        const sizes = [t('Bytes'), t('KB'), t('MB'), t('GB')];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const navigateToPath = (path: string) => {
        setCurrentPath(path);
        setSelectedFile(null);
        setFileContent("");
    };

    const navigateUp = () => {
        if (currentPath === "/") return;
        const parentPath = currentPath.split("/").slice(0, -1).join("/") || "/";
        navigateToPath(parentPath);
    };

    const handleFileClick = async (file: FileItem) => {
        if (file.isDir) {
            navigateToPath(file.path);
            return;
        }

        // Check if file extension is allowed
        if (allowedExtensions && file.extension) {
            const isAllowed = allowedExtensions.some(ext =>
                ext.toLowerCase() === file.extension?.toLowerCase()
            );
            if (!isAllowed) {
                alert(t('File type {{extension}} is not allowed', { extension: file.extension }));
                return;
            }
        }

        setSelectedFile(file);

        if (onFileSelect) {
            onFileSelect(file);
        }

        // Load file content if requested and it's a text file
        if (showFileContent && file.extension) {
            const textExtensions = [".txt", ".md", ".json", ".xml", ".html", ".css", ".js", ".ts", ".jsx", ".tsx", ".go", ".py", ".java", ".cpp", ".c", ".cs"];
            const isTextFile = textExtensions.some(ext =>
                ext.toLowerCase() === file.extension?.toLowerCase()
            );

            if (isTextFile) {
                setIsLoadingContent(true);
                try {
                    const fileData = await readFile(file.name, currentPath);
                    setFileContent(fileData.content);
                } catch (error) {
                    console.error("Failed to load file content:", error);
                    setFileContent(t('Error loading file content'));
                } finally {
                    setIsLoadingContent(false);
                }
            }
        }
    };

    const getBreadcrumbs = () => {
        if (currentPath === "/") return [];
        return currentPath.split("/").filter(Boolean);
    };

    if (isLoading) {
        return (
            <div className={`flex justify-center items-center h-64 ${className}`}>
                <IconFidgetSpinner className="animate-spin text-gray-500" size={24} />
                <span className="ml-2 text-gray-600 dark:text-gray-400">{t('Loading files')}</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`p-4 text-red-600 dark:text-red-400 ${className}`}>
                {t('Error loading files')}: {(error as Error).message}
                <button
                    onClick={() => refetch()}
                    className="ml-2 px-2 py-1 bg-red-100 dark:bg-red-900 rounded text-sm hover:bg-red-200 dark:hover:bg-red-800"
                >
                    {t('Retry')}
                </button>
            </div>
        );
    }

    return (
        <div className={`bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg ${className}`}>
            {/* Header with navigation */}
            <div className="p-4 border-b border-gray-300 dark:border-gray-600">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {t('File Browser')}
                    </h3>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => navigateToPath("/")}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                            title={t('Go to root')}
                        >
                            <IconHome size={18} className="text-gray-600 dark:text-gray-400" />
                        </button>
                        {currentPath !== "/" && (
                            <button
                                onClick={navigateUp}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                title={t('Go up')}
                            >
                                <IconArrowLeft size={18} className="text-gray-600 dark:text-gray-400" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Breadcrumbs */}
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <button
                        onClick={() => navigateToPath("/")}
                        className="hover:text-blue-600 dark:hover:text-blue-400"
                    >
                        {t('root')}
                    </button>
                    {getBreadcrumbs().map((segment, index) => {
                        const path = "/" + getBreadcrumbs().slice(0, index + 1).join("/");
                        return (
                            <span key={index} className="flex items-center">
                                <span className="mx-1">/</span>
                                <button
                                    onClick={() => navigateToPath(path)}
                                    className="hover:text-blue-600 dark:hover:text-blue-400"
                                >
                                    {segment}
                                </button>
                            </span>
                        );
                    })}
                </div>
            </div>

            {/* File list */}
            <div className="max-h-96 overflow-y-auto">
                {data?.files && data.files.length > 0 ? (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {data.files.map((file, index) => (
                            <div
                                key={index}
                                onClick={() => handleFileClick(file)}
                                className={`p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer flex items-center justify-between ${selectedFile?.name === file.name ? "bg-blue-50 dark:bg-blue-900/30" : ""
                                    }`}
                            >
                                <div className="flex items-center flex-1 min-w-0">
                                    <div className="flex-shrink-0 mr-3">
                                        {getFileIcon(file)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                            {file.name}
                                        </p>
                                        {!file.isDir && file.size !== undefined && file.size > 0 && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {formatFileSize(file.size)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                {file.isDir && (
                                    <IconArrowLeft
                                        size={16}
                                        className="text-gray-400 dark:text-gray-500 rotate-180"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        <IconFolder size={48} className="mx-auto mb-2 opacity-50" />
                        <p>{t('No files found in this directory')}</p>
                    </div>
                )}
            </div>

            {/* File content preview */}
            {showFileContent && selectedFile && !selectedFile.isDir && (
                <div className="border-t border-gray-300 dark:border-gray-600 p-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                        {t('Preview')}: {selectedFile.name}
                    </h4>
                    {isLoadingContent ? (
                        <div className="flex items-center justify-center h-32">
                            <IconFidgetSpinner className="animate-spin text-gray-500" size={20} />
                            <span className="ml-2 text-gray-600 dark:text-gray-400">{t('Loading content')}</span>
                        </div>
                    ) : (
                        <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded border max-h-48 overflow-y-auto">
                            <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                {fileContent || t('No content available')}
                            </pre>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
