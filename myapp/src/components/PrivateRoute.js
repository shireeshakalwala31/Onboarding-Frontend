import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("authToken"); // adjust if needed

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
