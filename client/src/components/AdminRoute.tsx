import { useContext } from "react";
import { Outlet } from "react-router-dom";

import { UserContext } from "../providers/UserProvider";
import Forbidden from "./Forbidden";

export default function AdminRoute() {
    const { isAdmin } = useContext(UserContext);
    if (!isAdmin) {
        return <Forbidden />;
    }

    return <Outlet />
}