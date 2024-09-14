import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
    BlockQuote, Bold, ClassicEditor, Code, CodeBlock,
    Essentials, Heading, Italic, Link, List, Paragraph,
    Strikethrough, Undo, Image, ImageUpload, SimpleUploadAdapter
} from "ckeditor5";

interface Props {
    content: string;
    onChange: (content: string) => void;
}

export function HtmlEditor({ content, onChange }: Props) {
    return <CKEditor editor={ClassicEditor} data={content}
        config={{
            toolbar: ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', 'strikethrough', 'code', 'codeBlock', 'undo', 'image', 'imageupload'],
            plugins: [
                Essentials, Bold, Italic, Paragraph, Undo,
                Heading, Link, List, Image, ImageUpload, BlockQuote,
                Strikethrough, Code, CodeBlock, SimpleUploadAdapter
            ],
            simpleUpload: {
                uploadUrl: '/api/admin/ckeditor/upload',
                withCredentials: true,
            },
        }}
        onChange={(_, editor) => onChange(editor.data.get())} />;
}