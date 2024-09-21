import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
    BlockQuote, Bold, ClassicEditor, Code, CodeBlock,
    Essentials, Heading, Italic, Link, List, Paragraph,
    Strikethrough, Undo, Image, ImageUpload, SimpleUploadAdapter,
    Table, TableProperties, TableToolbar,
    FontColor, ImageInsert, ImageBlock,
    Underline, WordCount, FontSize,
    TodoList,
    Alignment,
    ImageCaption,
} from "ckeditor5";

interface Props {
    content: string;
    onChange: (content: string) => void;
}

export function HtmlEditor({ content, onChange }: Props) {
    return <CKEditor editor={ClassicEditor} data={content}
        config={{
            toolbar: {
                items: ['heading', 'fontSize',
                    '|', 'fontcolor', 'bold', 'italic', 'underline', 'strikethrough', 'link', 'alignment',
                    '|', 'imageUpload',
                    '|', 'bulletedList', 'numberedList', 'todoList',
                    '|', 'insertTable',
                    '|', 'blockQuote', 'code', 'codeBlock',
                    '|', 'undo', 'redo'],
                shouldNotGroupWhenFull: true
            },
            plugins: [
                Essentials, Bold, Italic, Paragraph, Undo, Underline, FontSize, Alignment,
                Heading, Link, List, Image, ImageUpload, BlockQuote, WordCount,
                Strikethrough, Code, CodeBlock, SimpleUploadAdapter, ImageBlock, ImageCaption,
                Table, TableProperties, TableToolbar, FontColor, ImageInsert, TodoList
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
            },
            image: {
                toolbar: ['imageTextAlternative', '|', 'imageStyle:alignLeft', 'imageStyle:full', 'imageStyle:alignRight'],
                styles: {
                    options: ['full', 'alignLeft', 'alignRight']
                }
            },
            fontColor: {
                colorPicker: {
                    format: 'hex'
                }
            }
        }}
        onChange={(_, editor) => onChange(editor.data.get())} />;
}