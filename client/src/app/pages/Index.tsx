import { useQuery } from "@tanstack/react-query";

import { getPage } from "../../api/pageApi";

export default function Index() {
    const pageId = 'home';
    const { data, isLoading, isError } = useQuery({ queryKey: ['page', pageId], queryFn: () => getPage(pageId) });
    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error loading page</div>;
    return <div dangerouslySetInnerHTML={{ __html: data || '' }}></div>;
}