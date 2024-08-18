import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

import { getPageContent } from "../../api/pageApi";

export default function Page() {
    const { id } = useParams();
    const pageId = id || 'home';
    const { data, isLoading, isError } = useQuery({ queryKey: ['page', pageId], queryFn: () => getPageContent(pageId) });
    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error loading page</div>;
    return <div className="ck-content" dangerouslySetInnerHTML={{ __html: data || '' }}></div>;
}