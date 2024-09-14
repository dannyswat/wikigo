import { BrowserRouter, Route, Routes } from "react-router-dom";

import Layout from "../components/Layout";
import Login from "./pages/Login";
import Page from "./pages/Page";
import EditPage from "./pages/EditPage";
import NewPage from "./pages/NewPage";
import Layout2 from "../components/Layout2";

export function WikiGoRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Layout><></></Layout>} />
                <Route path="/p/:id" element={<Layout2><Page /></Layout2>} />
                <Route path="/edit/:id" element={<Layout><EditPage /></Layout>} />
                <Route path="/create" element={<Layout><NewPage /></Layout>} />
            </Routes>
        </BrowserRouter>
    );
}