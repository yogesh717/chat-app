import { Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Dashboard from "../components/pages/dashboard";
import Chat from "../components/pages/chat";
import UpdateProfile from "../components/profile/updateProfile";
import Profile from "../components/profile/profilePage";
import ChangePassword from "../components/profile/changePassword";
import StarredMessages from "../components/pages/starredMessages";

const PrivateRoutes = [
  <Route key="dashboard" path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />,
  <Route key="chat" path="/chat" element={<ProtectedRoute element={<Chat />} />} />,
  <Route key="update-profile" path="/update-profile" element={<ProtectedRoute element={<UpdateProfile />} />} />,
  <Route key="profile-page" path="/profile-page" element={<ProtectedRoute element={<Profile />} />} />,
  <Route key="change-password" path="/change-password" element={<ProtectedRoute element={<ChangePassword />} />} />,
  <Route key="starred-messages" path="/starred-messages" element={<ProtectedRoute element={<StarredMessages />} />} />,
];

export default PrivateRoutes;
