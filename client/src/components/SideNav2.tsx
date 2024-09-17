import { useQuery } from "@tanstack/react-query";

import { getAllPages, PageMeta } from "../api/pageApi";
import React, { useMemo, useState } from "react";

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

    const rootPages: PageMetaObject[] = pages.filter((page) => page.parentId === null).map((page) => ({ ...page, children: [] }));

    rootPages.forEach((page) => {
        const pageChilds = pages.filter((child) => page.id === child.parentId);
        pageChilds.forEach((child) => {
            page.children!.push({ ...child, children: [] });
        });
    });

    return rootPages;
}

export default function SideNav({ className, headerComponent, footerComponent, navigate, ...props }: SideNavProps) {
    const { data, isLoading } = useQuery({
        queryKey: ['pages'],
        queryFn: getAllPages,
    })
    const menu = useMemo(() => data ? buildTree(data) : [], [data]);
    const [root, setRoot] = useState<PageMetaObject>();

    if (isLoading) {
        return <p>Loading...</p>;
    }

    function handleMenuItemClick(page: PageMetaObject) {
        if (page.children && page.children.length > 0) {
            setRoot(page);
        }
        navigate('/p' + page.url);
    }

    return (
        <nav className={'w-1/4 bg-gray-200 p-4' + (className ? ' ' + className : '')} {...props}>
            {headerComponent}
            <ul className="space-y-2 mt-6">
                {root && <><li key="back">
                    <button onClick={() => setRoot(undefined)} className="w-full text-left box-border hover:bg-gray-300 py-2 px-5 rounded">
                        <i className="mr-2">&larr;</i>
                        Back
                    </button>
                </li>
                    <li key={root.id}>
                        <button onClick={() => navigate('/p' + root.url)} className="w-full text-left box-border font-bold hover:bg-gray-300 py-2 px-5 rounded">
                            {root.title}
                        </button>
                    </li>
                </>}
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