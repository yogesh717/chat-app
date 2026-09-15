import React, { useState } from "react";
import { Nav } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { FaTachometerAlt, FaComments, FaUser, FaSignOutAlt, FaBars, FaTimes } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";

import { useDispatch } from "react-redux";
import { logout } from "../../redux/slices/authSlice";
import "./sidebar.css";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Dashboard", icon: <FaTachometerAlt /> },
  { path: "/chat", label: "Chat", icon: <FaComments /> },
  { path: "/update-profile", label: "Profile", icon: <FaUser /> },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    setIsOpen(false);
    dispatch(logout());
    navigate("/login");
  };

  const goTo = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  return (
    <>
      <div className="sidebar-topbar d-md-none">
        <button
          className="sidebar-toggle-btn"
          aria-label={isOpen ? "Close menu" : "Open menu"}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
        <span className="sidebar-topbar-title">Chat App</span>
      </div>

      {isOpen && <div className="sidebar-backdrop d-md-none" onClick={() => setIsOpen(false)} />}

      <div className={`sidebar bg-dark text-white d-flex flex-column p-4 shadow-lg ${isOpen ? "sidebar-open" : ""}`}>
        <h4 className="text-center mb-4 d-none d-md-block">Dashboard</h4>
        <Nav defaultActiveKey={location.pathname} className="flex-column">
          {NAV_ITEMS.map((item) => (
            <Nav.Item key={item.path}>
              <Nav.Link
                className={`text-white py-2 px-3 d-flex align-items-center rounded mb-2 ${
                  location.pathname === item.path ? "bg-primary shadow-sm" : ""
                }`}
                onClick={() => goTo(item.path)}
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
    </>
  );
};

export default Sidebar;
