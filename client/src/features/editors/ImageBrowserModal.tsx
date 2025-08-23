import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { IconX, IconPhoto, IconLoader, IconSearch, IconFolderOpen } from '@tabler/icons-react';

interface ImageBrowserModalProps {
    onClose: (selectedImageUrl?: string) => void;
}

interface ImageItem {
    name: string;
    url: string;
    thumbnailUrl: string;
    size?: number;
    lastModified?: string;
}

export default function ImageBrowserModal({ onClose }: ImageBrowserModalProps) {
    const [images, setImages] = useState<ImageItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredImages, setFilteredImages] = useState<ImageItem[]>([]);

    useEffect(() => {
        loadImages();
    }, []);

    useEffect(() => {
        // Filter images based on search term
        if (searchTerm) {
            const filtered = images.filter(image =>
                image.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredImages(filtered);
        } else {
            setFilteredImages(images);
        }
    }, [images, searchTerm]);

    const loadImages = async () => {
        try {
            setLoading(true);
            setError(null);

            // First, get list of thumbnail images
            const response = await fetch('/api/editor/files/list?path=uploads/thumbnails', {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to load images');
            }

            const data = await response.json();

            if (data.files) {
                const imageItems: ImageItem[] = data.files
                    .filter((file: any) => !file.isDir && isImageFile(file.name))
                    .map((file: any) => ({
                        name: file.name,
                        url: `/media/uploads/${file.name}`, // Full size image
                        thumbnailUrl: `/media/uploads/thumbnails/${file.name}`, // Thumbnail
                        size: file.size,
                        lastModified: file.lastModified
                    }));

                setImages(imageItems);
            }
        } catch (err) {
            console.error('Error loading images:', err);
            setError(err instanceof Error ? err.message : 'Failed to load images');
        } finally {
            setLoading(false);
        }
    };

    const isImageFile = (filename: string): boolean => {
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.bmp'];
        const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
        return imageExtensions.includes(ext);
    };

    const formatFileSize = (bytes?: number): string => {
        if (!bytes || bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString?: string): string => {
        if (!dateString) return '';
        try {
            return new Date(dateString).toLocaleDateString();
        } catch {
            return '';
        }
    };

    const handleImageSelect = (image: ImageItem) => {
        setSelectedImage(image);
    };

    const handleInsertImage = () => {
        if (selectedImage) {
            onClose(selectedImage.url);
        }
    };

    const handleClose = () => {
        onClose();
    };

    const handleBackgroundClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    return createPortal(
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[10000]"
            onClick={handleBackgroundClick}
        >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                        <IconPhoto className="text-blue-500" size={24} />
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            Browse Images
                        </h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                        <IconX size={20} className="text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="relative">
                        <IconSearch
                            size={20}
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        />
                        <input
                            type="text"
                            placeholder="Search images..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex min-h-0">
                    {/* Image Grid */}
                    <div className="flex-1 p-4 overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="flex items-center gap-2 text-gray-500">
                                    <IconLoader className="animate-spin" size={20} />
                                    <span>Loading images...</span>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    <IconFolderOpen size={48} className="mx-auto mb-2 text-gray-400" />
                                    <p className="text-red-500 dark:text-red-400">{error}</p>
                                    <button
                                        onClick={loadImages}
                                        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                    >
                                        Retry
                                    </button>
                                </div>
                            </div>
                        ) : filteredImages.length === 0 ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center text-gray-500 dark:text-gray-400">
                                    <IconFolderOpen size={48} className="mx-auto mb-2 opacity-50" />
                                    <p>No images found</p>
                                    {searchTerm && (
                                        <p className="text-sm mt-1">Try adjusting your search term</p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {filteredImages.map((image) => (
                                    <div
                                        key={image.name}
                                        className={`cursor-pointer border-2 rounded-lg p-2 transition-all hover:shadow-md ${selectedImage?.name === image.name
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                            }`}
                                        onClick={() => handleImageSelect(image)}
                                    >
                                        <div className="aspect-square mb-2 overflow-hidden rounded bg-gray-100 dark:bg-gray-700">
                                            <img
                                                src={image.thumbnailUrl}
                                                alt={image.name}
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                                onError={(e) => {
                                                    // Fallback to full-size image if thumbnail fails
                                                    (e.target as HTMLImageElement).src = image.url;
                                                }}
                                            />
                                        </div>
                                        <div className="text-xs text-gray-600 dark:text-gray-400">
                                            <p className="truncate font-medium" title={image.name}>
                                                {image.name}
                                            </p>
                                            {image.size && (
                                                <p className="text-gray-500 dark:text-gray-500">
                                                    {formatFileSize(image.size)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Image Preview */}
                    {selectedImage && (
                        <div className="w-80 border-l border-gray-200 dark:border-gray-700 p-4 flex flex-col">
                            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                                Preview
                            </h3>
                            <div className="flex-1 flex flex-col">
                                <div className="aspect-square mb-4 overflow-hidden rounded bg-gray-100 dark:bg-gray-700">
                                    <img
                                        src={selectedImage.url}
                                        alt={selectedImage.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = selectedImage.url;
                                        }}
                                    />
                                </div>
                                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                    <div>
                                        <span className="font-medium">Name:</span>
                                        <p className="break-words">{selectedImage.name}</p>
                                    </div>
                                    {selectedImage.size && (
                                        <div>
                                            <span className="font-medium">Size:</span>
                                            <p>{formatFileSize(selectedImage.size)}</p>
                                        </div>
                                    )}
                                    {selectedImage.lastModified && (
                                        <div>
                                            <span className="font-medium">Modified:</span>
                                            <p>{formatDate(selectedImage.lastModified)}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 text-white rounded"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleInsertImage}
                        disabled={!selectedImage}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Insert Image
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
