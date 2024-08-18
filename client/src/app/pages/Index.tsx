import { useQuery } from "@tanstack/react-query";

import { getPageContent } from "../../api/pageApi";

export default function Index() {
    const pageId = 'home';
    const { data, isLoading, isError } = useQuery({ queryKey: ['page', pageId], queryFn: () => getPageContent(pageId) });
    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error loading page</div>;
    return <div className="ck-content" dangerouslySetInnerHTML={{ __html: data || '' }}></div>;
}