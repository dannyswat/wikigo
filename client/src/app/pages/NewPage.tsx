import { CKEditor } from "@ckeditor/ckeditor5-react";
import { Bold, ClassicEditor, Essentials, Italic, Paragraph } from "ckeditor5";
import { useState } from "react";
import { PageRequest } from "../../api/pageApi";

export default function NewPage() {
    const [data, setData] = useState<PageRequest>({
        id: 0,
        parentID: undefined,
        url: '',
        title: '',
        shortDesc: '',
        content: '',
    });

    return <div className="w-full flex flex-col gap-1">
        <section>
            <label>Title</label>
            <input type="text" placeholder="Title" value={data.title}
                onChange={(e) => setData((prev) => ({ ...prev, title: e.target.value }))} />
        </section>
        <section>
            <label>Short Description</label>
            <input type="text" placeholder="Short Description" value={data.shortDesc}
                onChange={(e) => setData((prev) => ({ ...prev, shortDesc: e.target.value }))}
            />
        </section>
        <section className="h-[500px]">
            <CKEditor editor={ClassicEditor} data={data.content}
                config={{
                    toolbar: ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote'],
                    plugins: [Essentials, Bold, Italic, Paragraph]
                }}
                onChange={(_, editor) => setData((prev) => ({ ...prev, content: editor.data.get() }))} />
        </section>
        <button className="bg-amber-800 text-white rounded-md">Create Page</button>
    </div>;
}