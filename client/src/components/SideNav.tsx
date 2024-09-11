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

    if (!isLoading)
        console.log(data);

    return (
        <nav className="w-1/4">
            <ul className="space-y-2">
                {data && data.map && data.map((page) => (
                    <li key={page.id}>
                        <NavLink to={'/p' + page.url} className="text-blue-500 hover:underline">
                            {page.title}
                        </NavLink>
                    </li>
                ))}
            </ul>
        </nav>
    );
}