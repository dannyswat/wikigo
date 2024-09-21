import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { deletePage, getPageByUrl, PageRequest, updatePage } from "../../api/pageApi";
import { HtmlEditor } from "../../components/HtmlEditor";
import { queryClient } from "../../common/query";
import { useEffect, useState, MouseEvent } from "react";
import { clearCache, PageDropDown } from "../../components/PageDropDown";
import { IconFidgetSpinner } from "@tabler/icons-react";

export default function EditPage() {
    const { id } = useParams();
    const pageId = id ? window.location.pathname.substring(6) : 'home';
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
        enabled: !!pageId,
        queryKey: ['page', pageId],
        queryFn: () => getPageByUrl(pageId)
    });

    const updatePageApi = useMutation({
        mutationFn: (page: PageRequest) => updatePage(page),
        onSuccess: () => {
            queryClient.removeQueries({ queryKey: ['page', pageId] });
            clearCache();
            navigate('/p' + data.url);
        }
    });

    const deletePageApi = useMutation({
        mutationFn: (page: PageRequest) => deletePage(page.id),
        onSuccess: () => {
            queryClient.removeQueries({ queryKey: ['page', pageId] });
            clearCache();
            navigate('/');
        }
    });

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
            <label className="basis-1/4">Parent Page</label>
            <PageDropDown className="basis-3/4 border-2 rounded-md p-2"
                value={data.parentID} onChange={(value) => setData((prev) => ({ ...prev, parentID: value }))} />
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
            <button onClick={handleSubmitClick}
                className="basis-1/2 sm:basis-1/6 bg-lime-700 text-white rounded-md py-2 px-5">
                {updatePageApi.isPending ? <IconFidgetSpinner className="animate-spin mx-auto" /> : 'Save'}
            </button>
            <button onClick={() => {
                if (data.content === initialData?.content || confirm('Are you sure to leave? Unsaved content will be lost.'))
                    navigate(initialData ? '/p' + initialData.url : '/');
            }}
                className="basis-1/2 sm:basis-1/6 bg-gray-700 text-white rounded-md py-2 px-5 ms-4">Cancel</button>
            <button onClick={() => { if (confirm('Are you sure to delete the page?')) deletePageApi.mutate(data) }}
                className="basis-1/4 sm:basis-1/12 bg-red-700 self-end text-white rounded-md py-2 px-5 ms-4">Delete</button>
        </section>
    </div>;
}