import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getPageContent } from "../../api/pageApi";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import { ClassicEditor } from "ckeditor5";

export default function EditPage() {
    const { id } = useParams();
    const { data, isLoading, isError } = useQuery({
        enabled: !!id,
        queryKey: ['page', id],
        queryFn: () => getPageContent(id!)
    });
    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Page does not exist...</div>;
    return <div className="w-full flex flex-col gap-1">
        <section>
            <label>Title</label>
            <input type="text" placeholder="Title" />
        </section>
        <section>
            <label>Short Description</label>
            <input type="text" placeholder="Short Description" />
        </section>
        <section className="h-[500px]">
            <CKEditor editor={ClassicEditor} data={data} />
        </section>
        <button className="btn">Save</button>
    </div>;
}