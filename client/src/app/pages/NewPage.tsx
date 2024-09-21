import { MouseEvent, useState } from "react";
import { createPage, getAllPages, PageRequest } from "../../api/pageApi";
import { HtmlEditor } from "../../components/HtmlEditor";

import 'ckeditor5/ckeditor5.css';
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { queryClient } from "../../common/query";
import { clearCache, PageDropDown, pagesQueryKey } from "../../components/PageDropDown";
import { IconFidgetSpinner } from "@tabler/icons-react";

export default function NewPage() {
    const navigate = useNavigate();
    const [data, setData] = useState<PageRequest>({
        id: 0,
        parentID: undefined,
        url: '',
        title: '',
        shortDesc: '',
        content: '',
    });
    const { data: pageList } = useQuery({
        queryKey: pagesQueryKey,
        queryFn: getAllPages,
    });
    const createPageApi = useMutation({
        mutationFn: (page: PageRequest) => createPage(page),
        onSuccess: () => {
            queryClient.removeQueries({ queryKey: ['page', data.url] });
            clearCache();
            navigate('/p' + data.url);
        },
        onError: (err, ...args) => {
            alert(err);
            console.log(args);
        }
    })

    function handleSubmitClick(e: MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        createPageApi.mutate({ ...data, id: 0 });
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
                value={data.parentID} onChange={(value) => {
                    setData((prev) => {
                        const state = { ...prev, parentID: value };
                        if (value) state.url = pageList?.find((p) => p.id === value)?.url || '';
                        return state;
                    });
                }} />
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
            <button disabled={createPageApi.isPending} onClick={handleSubmitClick}
                className="basis-1/2 sm:basis-1/6 bg-lime-700 text-white rounded-md py-2 px-5">
                {createPageApi.isPending ? <IconFidgetSpinner className="animate-spin mx-auto" /> : 'Create'}
            </button>
            <button onClick={() => {
                if (!data.content || confirm('Are you sure to leave?'))
                    navigate('/')
            }} className="basis-1/2 sm:basis-1/6 bg-gray-700 text-white rounded-md py-2 px-5 ms-4">Cancel</button>
        </section>
    </div>;
}