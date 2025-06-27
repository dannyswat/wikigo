import { ChangeEvent } from "react";
import { uploadImage } from "../features/editors/uploadApi";

interface ImageInputProps {
    value: string;
    onChange: (value: string) => void;
}

export default function ImageInput({ value, onChange }: ImageInputProps) {
    const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const { imageUrl } = await uploadImage(file, crypto.randomUUID());
            onChange(imageUrl);
        }
    };

    return (
        <div className="flex flex-col items-center">
            {value && (
                <img src={value} alt="Preview" className="mb-4 max-w-full h-auto rounded" />
            )}
            <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mb-2 w-full"
            />
            <button
                type="button"
                onClick={() => onChange('')}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
                Clear Image
            </button>
        </div>
    );

}