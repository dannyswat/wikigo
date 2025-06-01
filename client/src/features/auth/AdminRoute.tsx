import { useContext } from "react";
import { Outlet } from "react-router-dom";

import { UserContext } from "./UserProvider";
import Forbidden from "./Forbidden";

export default function AdminRoute() {
    const { isAdmin } = useContext(UserContext);
    if (!isAdmin) {
        return <Forbidden />;
    }

    return <Outlet />
}