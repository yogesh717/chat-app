import { Route } from "react-router-dom";
import Home from "../components/layout/home";
import Signup from "../components/layout/signup";
import Login from "../components/layout/login";
import ForgotPassword from "../components/layout/forgotpassword";

const PublicRoutes = [
  <Route key="home" path="/" element={<Home />} />,
  <Route key="login" path="/login" element={<Login />} />,
  <Route key="signup" path="/signup" element={<Signup />} />,
  <Route key="forgot-password" path="/forgot-password" element={<ForgotPassword />} />,
];

export default PublicRoutes;
