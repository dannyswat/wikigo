import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";

import { UserContext } from "../providers/UserProvider";

export function GuardedRoute() {
    const { isLoggedIn } = useContext(UserContext);
    if (!isLoggedIn) {
        return <Navigate to="/login" />;
    }

    return <Outlet />
}