import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import RegisterPage from "./pages/RegisterPage";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<div />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </>
  );
}
