import { useState } from "react";
import { PageRequest } from "../../api/pageApi";
import { HtmlEditor } from "../../components/HtmlEditor";

import 'ckeditor5/ckeditor5.css';

export default function NewPage() {
    const [data, setData] = useState<PageRequest>({
        id: 0,
        parentID: undefined,
        url: '',
        title: '',
        shortDesc: '',
        content: '',
    });

    return <div className="w-full flex flex-col gap-4">
        <section className="flex flex-row items-center">
            <label className="basis-1/4">Title</label>
            <input className="basis-3/4 border-2 rounded-md p-2" type="text" placeholder="Title" value={data.title}
                onChange={(e) => setData((prev) => ({ ...prev, title: e.target.value }))} />
        </section>
        <section className="flex flex-row items-center">
            <label className="basis-1/4">URL</label>
            <input className="basis-3/4 border-2 rounded-md p-2" type="text" placeholder="URL" value={data.url}
                onChange={(e) => setData((prev) => ({ ...prev, url: e.target.value }))} />
        </section>
        <section className="flex flex-row items-center">
            <label className="basis-1/4">Short Description</label>
            <input className="basis-3/4 border-2 rounded-md p-2" type="text" placeholder="Short Description" value={data.shortDesc}
                onChange={(e) => setData((prev) => ({ ...prev, shortDesc: e.target.value }))}
            />
        </section>
        <section>
            <HtmlEditor content={data.content} onChange={(content) => setData((prev) => ({ ...prev, content }))} />
        </section>
        <section className="flex flex-row justify-items-end">
            <button className="basis-1/6 bg-amber-800 text-white rounded-md py-2 px-5">Create Page</button>
        </section>
    </div>;
}