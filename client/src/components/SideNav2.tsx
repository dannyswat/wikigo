import { useQuery } from "@tanstack/react-query";

import { getAllPages, PageMeta } from "../api/pageApi";
import React, { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

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
        return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
    });
    const allPages: PageMetaObject[] = pages.map((page) => ({ ...page, children: [] }));

    return buildTreeInternal(allPages, undefined);
}

function buildTreeInternal(allPages: PageMetaObject[], parent?: PageMetaObject): PageMetaObject[] {
    const pages = allPages.filter((page) => page.parentId === (parent ? parent.id : null));
    for (const page of pages) {
        page.children = buildTreeInternal(allPages, page);
        parent?.children.push(page);
    }
    return pages;
}

export default function SideNav({ className, headerComponent, footerComponent, navigate, ...props }: SideNavProps) {
    const justNavigate = useNavigate();
    const { data, isLoading } = useQuery({
        queryKey: ['pages'],
        queryFn: getAllPages,
    })
    const menu = useMemo(() => data ? buildTree(data) : [], [data]);
    const [root, setRoot] = useState<PageMetaObject>();
    const lastRoot = useRef<PageMetaObject[]>([]);

    if (isLoading) {
        return <p>Loading...</p>;
    }

    function handleMenuItemClick(page: PageMetaObject) {
        if (!page.children?.length) {
            navigate('/p' + page.url);
            return;
        }
        if (root) lastRoot.current.push(root);
        setRoot(page);
        justNavigate('/p' + page.url);
    }

    return (
        <nav className={'w-1/4 bg-gray-200 p-4' + (className ? ' ' + className : '')} {...props}>
            {headerComponent}
            {root && <ul className="space-t-2 mt-4 sm:mt-0">
                <li>
                    <button onClick={() => setRoot(lastRoot.current.length ? lastRoot.current.pop() : undefined)}
                        className="w-full text-left box-border hover:bg-gray-300 py-2 px-5 rounded">
                        <i className="mr-2">&larr;</i>
                        Back
                    </button>
                </li>
                <li>
                    <button onClick={() => navigate('/p' + root.url)}
                        className="w-full text-left box-border font-bold hover:bg-gray-300 py-2 px-5 rounded">
                        {root.title}
                    </button>
                </li>
            </ul>}
            <ul className={'space-b-2' + (root ? '' : 'mt-4 sm:mt-0')}>
                {(root ? root.children : menu).map((page) => (
                    <li key={page.id}>
                        <button onClick={() => handleMenuItemClick(page)} className="w-full text-left box-border hover:bg-gray-300 py-2 px-5 rounded">
                            {page.title}
                            {page.children && page.children.length > 0 && (<i className="ml-2">&rarr;</i>)}
                        </button>
                    </li>
                ))}
            </ul>
            {footerComponent}
        </nav>
    );
}