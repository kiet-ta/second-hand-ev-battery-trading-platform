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

    // 1. Check for token/authentication
    if (!token || !userRole) {
        // Not logged in or token is invalid -> Redirect to login
        return <Navigate to="/login" replace />;
    }

    // 2. Check for role authorization
    if (allowedRoles.includes(userRole)) {
        // User has an allowed role -> Render the child routes
        return <Outlet />;
    } else {
        // User is logged in but has the wrong role -> Redirect to a relevant path (e.g., homepage)
        // You can customize this redirect based on your application flow.
        return <Navigate to="/" replace />;
    }
};

export default ProtectedRoute;