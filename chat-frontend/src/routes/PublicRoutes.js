import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "../components/layout/home";
import Signup from "../components/layout/signup";
import Login from "../components/layout/login";
import ForgotPassword from "../components/layout/forgotpassword";

const PublicRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
    </Routes>
  );
};

export default PublicRoutes;
