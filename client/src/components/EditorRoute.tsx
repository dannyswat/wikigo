import { useContext } from "react";
import { Outlet } from "react-router-dom";

import { UserContext } from "../providers/UserProvider";
import Forbidden from "./Forbidden";

export default function EditorRoute() {
    const { canEdit } = useContext(UserContext);
    if (!canEdit) {
        return <Forbidden />;
    }

    return <Outlet />
}