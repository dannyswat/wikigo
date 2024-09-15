import { useQuery } from "@tanstack/react-query";

import { getRootPages } from "../api/pageApi";
import React from "react";

interface SideNavProps extends React.HTMLAttributes<HTMLDivElement> {
    headerComponent?: React.ReactNode;
    footerComponent?: React.ReactNode;
    navigate: (url: string) => void;
}

export default function SideNav({ className, headerComponent, footerComponent, navigate, ...props }: SideNavProps) {
    const { data, isLoading } = useQuery({
        queryKey: ['rootPages'],
        queryFn: getRootPages,
    })

    if (isLoading) {
        return <p>Loading...</p>;
    }

    return (
        <nav className={'w-1/4 bg-gray-200 p-4' + (className ? ' ' + className : '')} {...props}>
            {headerComponent}
            <ul className="space-y-2 mt-6">
                {data && data.map && data.map((page) => (
                    <li key={page.id}>
                        <button onClick={() => navigate('/p' + page.url)} className="w-full text-left box-border hover:bg-gray-300 py-2 px-5 rounded">
                            {page.title}
                        </button>
                    </li>
                ))}
            </ul>
            {footerComponent}
        </nav>
    );
}