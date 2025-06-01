import { useQuery } from "@tanstack/react-query";

import { getPageByUrl } from "./pageApi";
import { useEffect } from "react";

export default function Index() {
    const pageId = 'home';
    const { data, isLoading, isError } = useQuery({ queryKey: ['page', pageId], queryFn: () => getPageByUrl(pageId) });

    useEffect(() => {
        if (data?.title)
            document.title = data.title + ' - Wiki GO';
    }, [data?.title]);

    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error loading page</div>;
    return <div className="ck-content" dangerouslySetInnerHTML={{ __html: data || '' }}></div>;
}