import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

// Helper function to decode JWT (reused from LoginPage.jsx)
const parseJwt = (token) => {
    try {
        const payload = token.split('.')[1];
        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64).split('').map(
                (c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
            ).join('')
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
};

/**
 * Component to protect routes based on user role.
 * @param {string[]} allowedRoles - Array of roles allowed to access this route (e.g., ['manager', 'staff']).
 */
const ProtectedRoute = ({ allowedRoles }) => {
    const token = localStorage.getItem("token");
    const decodedToken = token ? parseJwt(token) : null;
    const userRole = decodedToken?.role?.toLowerCase();

    if (!token || !userRole) {
        return <Navigate to="/login" replace />;
    }
    if (allowedRoles =="Seller" && userRole !="Seller"){
        return <Navigate to="/seller-registration" replace/>
    }
    if (allowedRoles.includes(userRole)) {
        return <Outlet />;
    } else {
        return <Navigate to="/" replace />;
    }
};

export default ProtectedRoute;