import { useQuery } from "@tanstack/react-query";

import { getRootPages } from "../api/pageApi";
import { NavLink } from "react-router-dom";

export default function SideNav() {
    const { data, isLoading } = useQuery({
        queryKey: ['rootPages'],
        queryFn: getRootPages,
    })

    if (isLoading) {
        return <p>Loading...</p>;
    }

    return (
        <nav className="w-1/4 bg-gray-200 p-4">
            <ul className="space-y-2">
                {data && data.map && data.map((page) => (
                    <li key={page.id}>
                        <NavLink to={'/p' + page.url} className="block hover:bg-gray-300 py-2 px-5 rounded">
                            {page.title}
                        </NavLink>
                    </li>
                ))}
            </ul>
        </nav>
    );
}