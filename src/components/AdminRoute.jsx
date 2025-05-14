import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = ({ isAdmin }) => {
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;