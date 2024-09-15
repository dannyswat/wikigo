import { BrowserRouter, Route, Routes } from "react-router-dom";

import Login from "./pages/Login";
import Page from "./pages/Page";
import EditPage from "./pages/EditPage";
import NewPage from "./pages/NewPage";
import Layout2 from "../components/Layout2";
import { GuardedRoute } from "../components/GuardedRoute";

export function WikiGoRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Layout2 isPage><></></Layout2>} />
                <Route path="/p/:id" element={<Layout2 isPage><Page /></Layout2>} />
                <Route path="create" element={<GuardedRoute><Layout2><NewPage /></Layout2></GuardedRoute>} />
                <Route path="edit/:id" element={<GuardedRoute><Layout2><EditPage /></Layout2></GuardedRoute>} />
            </Routes>
        </BrowserRouter>
    );
}