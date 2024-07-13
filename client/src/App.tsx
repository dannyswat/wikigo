import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Layout from "./components/Layout";

export default function App() {
  return (<BrowserRouter>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Layout><></></Layout>} />
      <Route path="/p/:id" element={<Layout><></></Layout>} />
    </Routes>
  </BrowserRouter>)
}
