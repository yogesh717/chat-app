import React from "react";
import { Nav } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { FaTachometerAlt, FaComments, FaUser, FaSignOutAlt } from "react-icons/fa";
// import { useAuth } from "../../context/AuthContext"; 
import "bootstrap/dist/css/bootstrap.min.css";

import { useDispatch } from "react-redux";
import { logout } from "../../redux/slices/authSlice"; //  Redux logout action


const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // const { logout } = useAuth();
  const dispatch = useDispatch();

  const handleLogout = () => {
    // logout(); 
    // localStorage.removeItem("user");
    // localStorage.removeItem("userId");
    dispatch(logout()); //  Clear auth state from Redux
    navigate("/login");
  };




 

  return (
    <div
      className="bg-dark text-white d-flex flex-column p-4 position-fixed vh-100 shadow-lg"
      style={{ width: "270px", left: 0, top: 0 }}
    >
      <h4 className="text-center mb-4">Dashboard</h4>
      <Nav defaultActiveKey={location.pathname} className="flex-column">
        {[
          { path: "/dashboard", label: "Dashboard", icon: <FaTachometerAlt /> },
          { path: "/chat", label: "Chat", icon: <FaComments /> },
          { path: "/update-profile", label: "Profile", icon: <FaUser /> },
        ].map((item, index) => (
          <Nav.Item key={index}>
            <Nav.Link
              className={`text-white py-2 px-3 d-flex align-items-center rounded mb-2 ${
                location.pathname === item.path ? "bg-primary shadow-sm" : ""
              }`}
              onClick={() => navigate(item.path)}
              style={{ cursor: "pointer", transition: "0.3s", fontSize: "18px" }}
            >
              {item.icon} <span className="ms-2">{item.label}</span>
            </Nav.Link>
          </Nav.Item>
        ))}
        <Nav.Item>
          <Nav.Link
            className="text-white py-2 px-3 d-flex align-items-center rounded mb-2 bg-danger shadow-sm"
            onClick={handleLogout}
            style={{ cursor: "pointer", transition: "0.3s", fontSize: "18px" }}
          >
            <FaSignOutAlt /> <span className="ms-2">Logout</span>
          </Nav.Link>
        </Nav.Item>
      </Nav>
    </div>
  );
};

export default Sidebar;
