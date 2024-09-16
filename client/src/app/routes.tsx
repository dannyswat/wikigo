import { BrowserRouter, Route, Routes } from "react-router-dom";

import Login from "./pages/Login";
import Page from "./pages/Page";
import EditPage from "./pages/EditPage";
import NewPage from "./pages/NewPage";
import Layout2 from "../components/Layout2";
import { GuardedRoute } from "../components/GuardedRoute";
import Layout from "../components/Layout";
import { ChangePassword } from "./pages/ChangePassword";

export function WikiGoRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Layout2 isPage><Page /></Layout2>} />
                <Route path="/p/:id" element={<Layout2 isPage><Page /></Layout2>} />
                <Route element={<GuardedRoute />}>
                    <Route path="create" element={<Layout><NewPage /></Layout>} />
                    <Route path="edit/:id" element={<Layout><EditPage /></Layout>} />
                    <Route path="/change-password" element={<ChangePassword />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}