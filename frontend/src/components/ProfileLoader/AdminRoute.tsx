// AdminRoute.tsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";

interface AdminRouteProps {
  element: JSX.Element;
}

// Ez a komponens a kapott 'element'-et csak akkor rendereli, ha a user Admin
const AdminRoute: React.FC<AdminRouteProps> = ({ element }) => {
  const { user } = useUser();

  // Ha nincs user, vagy a role nem Admin, redirect pl. a főoldalra
  if (!user || user.role !== "Admin") {
    return <Navigate to="/" replace />;
  }

  // Ha Admin, akkor megjelenítjük a kért komponenst
  return element;
};

export default AdminRoute;
