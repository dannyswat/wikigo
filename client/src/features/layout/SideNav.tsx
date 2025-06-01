import { useQuery } from "@tanstack/react-query";

import { getAllPages, PageMeta } from "../pages/pageApi";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { UserContext } from "../auth/UserProvider";

interface SideNavProps extends React.HTMLAttributes<HTMLDivElement> {
  headerComponent?: React.ReactNode;
  footerComponent?: React.ReactNode;
  navigate: (url: string) => void;
}

interface PageMetaObject extends PageMeta {
  children: PageMetaObject[];
}

function buildTree(pages: PageMeta[]): PageMetaObject[] {
  pages.sort(function (a, b) {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
  });
  const allPages: PageMetaObject[] = pages.map((page) => ({
    ...page,
    children: [],
  }));

  return buildTreeInternal(allPages, undefined);
}

function buildTreeInternal(
  allPages: PageMetaObject[],
  parent?: PageMetaObject
): PageMetaObject[] {
  const pages = allPages.filter(
    (page) => page.parentId === (parent ? parent.id : null)
  );
  for (const page of pages) {
    page.children = buildTreeInternal(allPages, page);
    parent?.children.push(page);
  }
  return pages;
}

export default function SideNav({
  className,
  headerComponent,
  footerComponent,
  navigate,
  ...props
}: SideNavProps) {
  const { id } = useParams();
  const pageId = id ? window.location.pathname.substring(3) : "home";
  const { isLoggedIn } = useContext(UserContext);
  const justNavigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ["pages", isLoggedIn],
    queryFn: getAllPages,
  });
  const menu = useMemo(() => (data ? buildTree(data) : []), [data]);
  const [root, setRoot] = useState<PageMetaObject>();
  const lastRoot = useRef<PageMetaObject[]>([]);

  useEffect(() => {
    if (menu.length === 0) return;
    const hierarchy = findItemInTree(menu, "/" + pageId);
    if (hierarchy.length) {
      lastRoot.current = [];
      for (let i = 0; i < hierarchy.length - 2; i++) {
        lastRoot.current.push(hierarchy[i]);
      }
      setRoot(hierarchy[hierarchy.length - 2]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menu]);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  function handleMenuItemClick(page: PageMetaObject) {
    if (!page.children?.length) {
      navigate("/p" + page.url);
      return;
    }
    if (root) lastRoot.current.push(root);
    setRoot(page);
    justNavigate("/p" + page.url);
  }

  return (
    <nav
      className={
        "w-1/4 bg-gray-200 p-4 overflow-y-auto" +
        (className ? " " + className : "")
      }
      {...props}
    >
      {headerComponent}
      {root && (
        <ul className="space-t-2 mt-4 sm:mt-0">
          <li>
            <button
              onClick={() =>
                setRoot(
                  lastRoot.current.length ? lastRoot.current.pop() : undefined
                )
              }
              className="w-full text-left box-border hover:bg-gray-300 py-2 px-5 rounded"
            >
              <i className="mr-2">&larr;</i>
              Back
            </button>
          </li>
          <li>
            <button
              onClick={() => navigate("/p" + root.url)}
              className="w-full text-left box-border font-bold hover:bg-gray-300 py-2 px-5 rounded"
            >
              {root.title}
            </button>
          </li>
        </ul>
      )}
      <ul className={"space-b-2" + (root ? "" : " mt-4 sm:mt-0")}>
        {(root ? root.children : menu).map((page) => (
          <li key={page.id}>
            <button
              onClick={() => handleMenuItemClick(page)}
              className="w-full text-left box-border hover:bg-gray-300 py-2 px-5 rounded"
            >
              {page.title}
              {page.children && page.children.length > 0 && (
                <i className="ml-2">&rarr;</i>
              )}
            </button>
          </li>
        ))}
        {isLoggedIn && <li>
          <button
            onClick={() =>
              navigate(
                "/create" +
                (root ? "?parent=" + encodeURIComponent(root.url) : "")
              )
            }
            className="w-full text-left text-gray-500 box-border hover:bg-gray-300 py-2 px-5 rounded"
          >
            + Create New Page
          </button>
        </li>}
      </ul>
      {footerComponent}
    </nav>
  );
}

function findItemInTree(tree: PageMetaObject[], url: string): PageMetaObject[] {
  for (const item of tree) {
    if (item.url === url) return [item];
    const found = findItemInTree(item.children, url);
    if (found.length) return [item, ...found];
  }
  return [];
}
