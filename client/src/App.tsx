import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Layout from "./components/Layout";
import Page from "./pages/Page";

export default function App() {
  return (<BrowserRouter>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Layout><></></Layout>} />
      <Route path="/p/:id" element={<Layout><Page /></Layout>} />
    </Routes>
  </BrowserRouter>)
}
