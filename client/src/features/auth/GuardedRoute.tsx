import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";

import { UserContext } from "./UserProvider";

export default function GuardedRoute() {
    const { isLoggedIn } = useContext(UserContext);
    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />
}