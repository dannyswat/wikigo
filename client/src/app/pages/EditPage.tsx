import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { getPageByUrl, PageRequest, updatePage } from "../../api/pageApi";
import { HtmlEditor } from "../../components/HtmlEditor";
import { queryClient } from "../../common/query";
import { useEffect, useState, MouseEvent } from "react";

export default function EditPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState<PageRequest>({
        id: 0,
        parentID: undefined,
        url: '',
        title: '',
        shortDesc: '',
        content: '',
    });
    const { data: initialData, isLoading, isError } = useQuery({
        enabled: !!id,
        queryKey: ['page', id],
        queryFn: () => getPageByUrl(id!)
    });

    const updatePageApi = useMutation({
        mutationFn: (page: PageRequest) => updatePage(page),
        onSuccess: () => {
            queryClient.removeQueries({ queryKey: ['rootPages'] });
            queryClient.removeQueries({ queryKey: ['page', id] });
            navigate('/p' + data.url);
        }
    })

    useEffect(() => {
        if (initialData) {
            setData(initialData);
        }
    }, [initialData]);

    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Page does not exist...</div>;

    function handleSubmitClick(e: MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        updatePageApi.mutate(data);
    }

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
            <button onClick={handleSubmitClick} className="basis-1/6 bg-amber-800 text-white rounded-md py-2 px-5">Update Page</button>
        </section>
    </div>;
}