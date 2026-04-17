import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<div />} />
      </Routes>
    </>
  );
}
