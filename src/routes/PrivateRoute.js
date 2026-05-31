// routes/PrivateRoute.js
import { Navigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

export default function PrivateRoute({ children }) {
  const { user, loading } = useApp();
  if (loading) return <div>Loading...</div>;
  if (!user) {
    return <Navigate to="/auth" />;
  }

  // // Role check
  // if (allowedRoles && !allowedRoles.includes(user.usertype)) {
  //   return <Navigate to="/unauthorized" />;
  // }

  return children;
}