import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

import { getPageByUrl } from "../../api/pageApi";
import { useEffect } from "react";

export default function Page() {
    const { id } = useParams();
    const pageId = id ? window.location.pathname.substring(3) : 'home';
    const { data, isLoading, isError } = useQuery({ queryKey: ['page', pageId], queryFn: () => getPageByUrl(pageId) });

    useEffect(() => {
        if (data?.title)
            document.title = data.title;
    }, [data?.title]);

    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error loading page</div>;
    if (!data) return <div>Page not found</div>;

    return <>
        <h1 className="text-3xl font-bold font-serif mb-2 border-b-2">{data.title}</h1>
        <div className="ck-content" dangerouslySetInnerHTML={{ __html: data.content || '' }}></div></>;
}