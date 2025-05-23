import { BrowserRouter, Route, Routes } from "react-router-dom";

import Login from "./pages/Login";
import Page from "./pages/Page";
import EditPage from "./pages/EditPage";
import NewPage from "./pages/NewPage";
import Layout2 from "../components/Layout2";
import { GuardedRoute } from "../components/GuardedRoute";
import EditorRoute from "../components/EditorRoute";
import Layout from "../components/Layout";
import { ChangePassword } from "./pages/ChangePassword";
import AdminRoute from "../components/AdminRoute";
import Users from "./pages/Users";
import UsersCreate from "./pages/UsersCreate";
import LayoutAdmin from "../components/LayoutAdmin";
import UsersEdit from "./pages/UsersEdit";
import EditorMenu from "../components/EditorMenu";

export function WikiGoRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Layout2 isPage />}>
          <Route path="/" element={<Page />} />
          <Route path="/p/:id/:id2?/:id3?/:id4?/:id5?" element={<Page />} />
        </Route>
        <Route element={<GuardedRoute />}>
          <Route element={<EditorRoute />}>
            <Route element={<Layout customMenu={<EditorMenu />} />}>
              <Route path="create" element={<NewPage />} />
              <Route
                path="edit/:id/:id2?/:id3?/:id4?/:id5?"
                element={<EditPage />}
              />
            </Route>
          </Route>
          <Route element={<AdminRoute />}>
            <Route element={<LayoutAdmin />}>
              <Route path="/users" element={<Users />} />
              <Route path="/users/create" element={<UsersCreate />} />
              <Route path="/users/:id" element={<UsersEdit />} />
            </Route>
          </Route>
          <Route path="/change-password" element={<ChangePassword />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
