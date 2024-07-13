import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

import { getPage } from "../api/pageApi";

export default function Page() {
    const { id } = useParams();
    const pageId = id || 'home';
    const { data, isLoading, isError } = useQuery({ queryKey: ['page', pageId], queryFn: () => getPage(pageId) });
    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error loading page</div>;
    return <div dangerouslySetInnerHTML={{ __html: data || '' }}></div>;
}