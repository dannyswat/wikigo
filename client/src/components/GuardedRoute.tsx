import { ReactElement, useContext } from "react";
import { Navigate } from "react-router-dom";

import { UserContext } from "../providers/UserProvider";

interface Props {
    children: ReactElement;
}

export function GuardedRoute({ children }: Props) {
    const { isLoggedIn } = useContext(UserContext);
    if (!isLoggedIn) {
        return <Navigate to="/login" />;
    }

    return <>{children}</>;
}