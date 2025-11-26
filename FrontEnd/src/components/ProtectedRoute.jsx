import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import userApi from '../api/userApi'; // make sure path is correct

const ProtectedRoute = ({ allowedRoles }) => {
    const [loading, setLoading] = useState(true);
    const [hasAccess, setHasAccess] = useState(false);
    const [redirectPath, setRedirectPath] = useState("/login");

    useEffect(() => {
        const fetchUserRole = async () => {
            const userId = localStorage.getItem("userId");
            if (!userId) {
                setRedirectPath("/login");
                setLoading(false);
                return;
            }

            try {
                const user = await userApi.getUserByID(userId); // fetch user from API
                const userRole = user?.role;

                if (allowedRoles.includes(userRole)) {
                    setHasAccess(true);
                } else if (allowedRoles.includes("Seller") && userRole !== "Seller") {
                    setRedirectPath("/seller-registration");
                } else {
                    setRedirectPath("/");
                }
            } catch (err) {
                console.error("Error fetching user role:", err);
                setRedirectPath("/login");
            } finally {
                setLoading(false);
            }
        };

        fetchUserRole();
    }, [allowedRoles]);

    if (loading) return <div>Loading...</div>; // or a spinner

    return hasAccess ? <Outlet /> : <Navigate to={redirectPath} replace />;
};

export default ProtectedRoute;
