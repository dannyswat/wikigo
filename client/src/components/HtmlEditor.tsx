import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
    BlockQuote, Bold, ClassicEditor, Code, CodeBlock,
    Essentials, Heading, Italic, Link, List, Paragraph,
    Strikethrough, Undo, Image, ImageUpload, SimpleUploadAdapter,
    Table,
    TableProperties,
    TableToolbar,
    FontColor,
    ImageInsertViaUrl,
    ImageInsert
} from "ckeditor5";

interface Props {
    content: string;
    onChange: (content: string) => void;
}

export function HtmlEditor({ content, onChange }: Props) {
    return <CKEditor editor={ClassicEditor} data={content}
        config={{
            toolbar: ['heading', '|', 'fontcolor', 'bold', 'italic', 'strikethrough', 'link', '|',
                'bulletedList', 'numberedList', 'insertTable', '|', 'blockQuote', 'code', 'codeBlock', 'undo', 'imageUpload'],
            plugins: [
                Essentials, Bold, Italic, Paragraph, Undo,
                Heading, Link, List, Image, ImageUpload, BlockQuote,
                Strikethrough, Code, CodeBlock, SimpleUploadAdapter,
                Table, TableProperties, TableToolbar, FontColor, ImageInsertViaUrl, ImageInsert
            ],
            simpleUpload: {
                uploadUrl: '/api/admin/ckeditor/upload',
                withCredentials: true,
            },
            link: {
                addTargetToExternalLinks: true,
                decorators: {
                    openInNewTab: {
                        attributes: {
                            "target": "_blank"
                        },
                        label: "Open in a new tab",
                        mode: "manual"
                    }
                }
            },
            table: {
                contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells'],
            }
        }}
        onChange={(_, editor) => onChange(editor.data.get())} />;
}