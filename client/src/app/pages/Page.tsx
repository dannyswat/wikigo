import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

import { getPageByUrl } from "../../api/pageApi";

export default function Page() {
    const { id } = useParams();
    const pageId = id || 'home';
    const { data, isLoading, isError } = useQuery({ queryKey: ['page', pageId], queryFn: () => getPageByUrl(pageId) });
    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error loading page</div>;
    if (!data) return <div>Page not found</div>;
    console.log(data);
    return <>
        <h1 className="text-3xl font-bold font-serif mb-2 border-b-2">{data.title}</h1>
        <div className="ck-content" dangerouslySetInnerHTML={{ __html: data.content || '' }}></div></>;
}