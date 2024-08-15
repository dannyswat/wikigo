import { BrowserRouter, Route, Routes } from "react-router-dom";

import Layout from "../components/Layout";
import Login from "./pages/Login";
import Page from "./pages/Page";

export function WikiGoRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Layout><></></Layout>} />
                <Route path="/p/:id" element={<Layout><Page /></Layout>} />
            </Routes>
        </BrowserRouter>
    );
}