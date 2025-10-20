// src/pages/ManagerDashboard.jsx

import React, { useEffect, useMemo, useState } from "react";
import { DollarSign, Users, PackageSearch, TrendingUp, UserCheck, ShieldAlert, Ban } from "lucide-react";
import { managerAPI } from "../hooks/managerApi";
import { AnimatePresence } from "framer-motion";
import { Outlet, useNavigate, useLocation } from "react-router-dom"; // Import Outlet, useNavigate, useLocation
import ManagerLayout from "../layout/ManagerLayout"; 

// Helper functions (kept outside for cleanliness)
function currencyVND(x) {
    try {
        return x.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
    } catch {
        return `${x}`;
    }
}


export default function ManagerDashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    
    // User Management State (for UsersContent component)
    const [users, setUsers] = useState([]);
    const [userPage, setUserPage] = useState(1);
    const [pageSize] = useState(20);
    const [userTotalPages, setUserTotalPages] = useState(1);
    
    // Dashboard Data State
    const [metrics, setMetrics] = useState(null);
    const [revenueByMonth, setRevenueByMonth] = useState([]);
    const [ordersByMonth, setOrdersByMonth] = useState([]);
    const [distribution, setDistribution] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [approvals, setApprovals] = useState([]);

    // Other Tabs State
    const [products, setProducts] = useState([]); // Used by ProductModeration
    
    // Modal state
    const [showAddStaffModal, setShowAddStaffModal] = useState(false);
    const [newStaff, setNewStaff] = useState({ fullName: "", email: "", role: "staff", tasks: [] });
    const currentUserId = localStorage.getItem("userId");


    // Unified Fetch Function
    const fetchData = async (scope, page = userPage) => {
        setLoading(true);
        try {
            if (scope === 'dashboard' || scope === 'all') {
                const [m, rev, ord, dist, tx, aps] = await Promise.all([
                    managerAPI.getMetrics(),
                    managerAPI.getRevenueByMonth(),
                    managerAPI.getOrdersByMonth(),
                    managerAPI.getProductDistribution(),
                    managerAPI.getTransactions(),
                    managerAPI.getPendingSellerApprovals(),
                ]);
                setMetrics(m);
                setRevenueByMonth(rev);
                setOrdersByMonth(ord);
                setDistribution(dist);
                setTransactions(tx);
                setApprovals(aps);
            }
            
            if (scope === 'users' || scope === 'all') {
                const data = await managerAPI.getUsersPaginated(page, pageSize);
                setUsers(data.items || data);
                setUserTotalPages(data.totalPages || 1);
            }

            if (scope === 'products' || scope === 'all') {
                 // Simplified the complex fetch logic here for brevity; assume managerAPI.getProductsWithSeller() exists
                 const productData = await managerAPI.getProducts(); 
                 setProducts(productData);
            }

        } catch (e) {
            console.error(`❌ Lỗi khi tải dữ liệu ${scope}:`, e);
        } finally {
            setLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        fetchData('all');
    }, []);

    // Re-fetch users on page change
    useEffect(() => {
        fetchData('users', userPage);
    }, [userPage]);


    const handleLogoutConfirm = () => {
        localStorage.clear();
        navigate("/login");
    };
    
    // Handle user status change
    const handleStatusChange = async (userId, status) => {
        try {
            await managerAPI.updateUserStatus(userId, status);
            alert(`✅ User status changed to ${status}`);
            setUsers((prev) =>
                prev.map((u) =>
                    u.userId === userId ? { ...u, accountStatus: status } : u
                )
            );
        } catch (err) {
            alert("❌ Failed to update user status");
        }
    };
    
    // Handle approval status change
    const handleApprovalAction = async (id, action) => {
        try {
            if (action === 'approve') {
                await managerAPI.approveSeller(id);
                alert(`✅ Seller ${id} approved.`);
            } else {
                await managerAPI.rejectSeller(id);
                alert(`🚫 Seller ${id} rejected.`);
            }
            setApprovals(prev => prev.filter(a => a.id !== id));
            // Re-fetch metrics if needed
            fetchData('dashboard'); 
        } catch (e) {
            alert(`❌ Lỗi khi ${action} seller.`);
        }
    };


    // Context value passed to Outlet
    const contextValue = {
        // Data
        metrics, revenueByMonth, ordersByMonth, distribution, transactions, approvals, users, products,
        loading, currentUserId, currencyVND,
        // User Pagination
        userPage, setUserPage, userTotalPages, pageSize,
        // Modals & Handlers
        setShowLogoutConfirm, showAddStaffModal, setShowAddStaffModal, newStaff, setNewStaff,
        handleStatusChange, handleApprovalAction,
        fetchData // Pass the full fetcher for refresh buttons
    };


   // In ManagerDashboard.jsx:
// ...
const handleRefresh = () => fetchData('all');
const handleLogout = () => setShowLogoutConfirm(true);
const handleAddStaff = () => setShowAddStaffModal(true);

return (
    <ManagerLayout 
        onRefresh={handleRefresh} 
        onLogout={handleLogout} 
        onAddStaff={handleAddStaff}
    >
    </ManagerLayout>
);
}
