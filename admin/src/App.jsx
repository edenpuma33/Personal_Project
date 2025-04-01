import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Add from "./pages/Add";
import List from "./pages/List";
import Orders from "./pages/Order";
import Login from "./components/Login";
import Edit from "./pages/Edit"; 
import Users from "./pages/User";
import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const backendUrl = import.meta.env.VITE_BACKEND_URL;
export const currency = "£";

const App = () => {
  const [token, setToken] = useState(
    localStorage.getItem("adminToken") || ""
  );
  const navigate = useNavigate();

  const handleLogout = () => {
    setToken("");
    localStorage.removeItem("adminToken");
    navigate("/");
  };

  useEffect(() => {
    if (token) {
        // ถ้ามี token: บันทึกใน localStorage ภายใต้ key "adminToken"
      localStorage.setItem("adminToken", token);
    } else {
      // ถ้าไม่มี: ลบ "adminToken" ออกจาก localStorage
      localStorage.removeItem("adminToken");
    }
  }, [token]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <ToastContainer />
      {!token ? (
        <Login setToken={setToken} />
      ) : (
        <>
          <Navbar setToken={handleLogout} />
          <hr />
          <div className="flex w-full">
            <Sidebar />
            <div className="w-[70%] mx-auto ml-[max(5vw,25px)] my-8 text-gray-600 text-base">
              <Routes>
                <Route path="/add" element={<Add token={token} />} />
                <Route path="/list" element={<List token={token} />} />
                <Route path="/edit" element={<Edit token={token} />} />
                <Route path="/orders" element={<Orders token={token} />} />
                <Route path="/users" element={<Users token={token} />} />
                <Route path="/" element={<Navigate to="/list" />} />
              </Routes>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
export default App;