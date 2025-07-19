import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

import { getPageByUrl } from "./pageApi";
import { useEffect } from "react";
import TableOfContent from "../../components/TableOfContent";

export default function Page() {
  const { id } = useParams();
  const pageId = id ? window.location.pathname.substring(3) : "home";
  const { data, isLoading, isError } = useQuery({
    queryKey: ["page", pageId],
    queryFn: () => getPageByUrl(pageId),
  });

  useEffect(() => {
    if (data?.title) document.title = data.title + " - Wiki GO";
  }, [data?.title]);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading page</div>;
  if (!data) return <div>Page not found</div>;

  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0">
        <h1 className="text-3xl font-bold font-serif mb-2 border-b-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">
          {data.title}
        </h1>
        <p className="text-sm font-serif px-1 mb-4 text-gray-700 dark:text-gray-300">{data.shortDesc}</p>
        <div
          className="ck-content"
          dangerouslySetInnerHTML={{ __html: data.content || "" }}
        ></div>
      </div>
      {data.content && (
        <div className="hidden lg:block flex-shrink-0">
          <TableOfContent title={data.title} content={data.content} />
        </div>
      )}
    </div>
  );
}
