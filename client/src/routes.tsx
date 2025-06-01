import { BrowserRouter, Route, Routes } from "react-router-dom";

import LoginPage from "./features/auth/LoginPage";
import Page from "./features/pages/Page";
import EditPage from "./features/pages/EditPage";
import NewPage from "./features/pages/NewPage";
import LayoutMain from "./features/layout/LayoutMain";
import GuardedRoute from "./features/auth/GuardedRoute";
import EditorRoute from "./features/auth/EditorRoute";
import LayoutEdit from "./features/layout/LayoutEdit";
import ChangePasswordPage from "./features/useraccount/ChangePasswordPage";
import AdminRoute from "./features/auth/AdminRoute";
import Users from "./features/users/Users";
import UsersCreate from "./features/users/UsersCreate";
import LayoutAdmin from "./features/layout/LayoutAdmin";
import UsersEdit from "./features/users/UsersEdit";
import EditorMenu from "./features/editors/EditorMenu";

export function WikiGoRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<LayoutMain isPage />}>
          <Route path="/" element={<Page />} />
          <Route path="/p/:id/:id2?/:id3?/:id4?/:id5?" element={<Page />} />
        </Route>
        <Route element={<GuardedRoute />}>
          <Route element={<EditorRoute />}>
            <Route element={<LayoutEdit customMenu={<EditorMenu />} />}>
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
          <Route path="/change-password" element={<ChangePasswordPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
