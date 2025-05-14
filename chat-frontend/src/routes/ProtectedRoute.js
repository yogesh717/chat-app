
import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ element }) => {
  const token = useSelector((state) => state.auth.token);

  return token ? element : <Navigate to="/login" />;
};

export default ProtectedRoute;







// import { useAuth } from "../context/AuthContext";

// const ProtectedRoute = ({ element }) => {
//   const { token } = useAuth();
  
//   return token ? element : <Navigate to="/login" />;
// };

// export default ProtectedRoute;