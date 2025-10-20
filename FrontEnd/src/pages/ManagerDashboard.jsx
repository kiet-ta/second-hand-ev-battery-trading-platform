// src/pages/ManagerDashboard.jsx

import React, { useEffect, useState } from "react";
import { DollarSign, Users, PackageSearch, TrendingUp, UserCheck, ShieldAlert, Ban } from "lucide-react";
import { managerAPI } from "../hooks/managerApi";
import { AnimatePresence } from "framer-motion";
import { Outlet, useNavigate, useLocation } from "react-router-dom"; 
import ManagerLayout from "../layout/ManagerLayout"; 

// Helper function (assuming it's defined elsewhere or in the same file)
function currencyVND(x) {
    try {
        // Assuming x is a number or can be converted to one
        if (typeof x === 'number') {
             return x.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
        }
        return `${x}`;
    } catch {
        return `${x}`;
    }
}

// NOTE: You must define LogoutConfirmationModal and AddStaffModal elsewhere and import them.
// Example placeholders for clarity:
function LogoutConfirmationModal({ onCancel, onConfirm }) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl">
                <p>Are you sure you want to log out?</p>
                <div className="mt-4 flex justify-end gap-3">
                    <button onClick={onCancel} className="px-4 py-2 border rounded">Cancel</button>
                    <button onClick={onConfirm} className="px-4 py-2 bg-red-500 text-white rounded">Logout</button>
                </div>
            </div>
        </div>
    );
}

function AddStaffModal({ onClose }) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl">
                <h3 className="text-lg font-bold">Add New Staff</h3>
                <p className="mt-2">Staff form goes here...</p>
                <div className="mt-4 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-blue-500 text-white rounded">Close</button>
                </div>
            </div>
        </div>
    );
}
// END PLACEHOLDERS


export default function ManagerDashboard() {
    const navigate = useNavigate();
    const location = useLocation(); // Keep for potential route-based data fetching logic if needed
    
    const [loading, setLoading] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    
    // User Management State 
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
    const [products, setProducts] = useState([]); 
    
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
        // Ensure we don't refetch on initial load if fetchData('all') already ran
        if (location.pathname.includes('/users') || userPage > 1) {
            fetchData('users', userPage);
        }
    }, [userPage, location.pathname]);


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


    const handleRefresh = () => fetchData('all');
    const handleLogout = () => setShowLogoutConfirm(true);
    const handleAddStaff = () => setShowAddStaffModal(true);

    return (
        <ManagerLayout 
            onRefresh={handleRefresh} 
            onLogout={handleLogout} 
            onAddStaff={handleAddStaff}
            loading={loading} // Pass loading state to layout if it handles a global spinner
        >
            {/* CRITICAL FIX: The Outlet is rendered here and passed the context */}
            <Outlet context={contextValue} /> 

            {/* Modals are rendered here so they overlay the entire layout/content */}
            <AnimatePresence>
                {showLogoutConfirm && (
                    <LogoutConfirmationModal
                        onCancel={() => setShowLogoutConfirm(false)}
                        onConfirm={handleLogoutConfirm}
                    />
                )}
                {showAddStaffModal && (
                    <AddStaffModal
                        onClose={() => setShowAddStaffModal(false)}
                        // Include props for handling form data (newStaff, setNewStaff)
                    />
                )}
            </AnimatePresence>
        </ManagerLayout>
    );
}