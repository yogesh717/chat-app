import React from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Dashboard from "../components/pages/dashboard";
import Chat from "../components/pages/chat";
import UpdateProfile from "../components/profile/updateProfile";
import Profile from "../components/profile/profilePage";
import ChangePassword from "../components/profile/changePassword";

const PrivateRoutes = () => {
  return (
    <Routes>
      <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
      <Route path="/chat" element={<ProtectedRoute element={<Chat />} />} />
      <Route path="/update-profile" element={<ProtectedRoute element={<UpdateProfile />} />} />
      <Route path="/profile-page" element={<ProtectedRoute element={<Profile />} />} />
      <Route path="/change-password" element={<ProtectedRoute element={<ChangePassword />} />} />
    </Routes>
  );
};

export default PrivateRoutes;
