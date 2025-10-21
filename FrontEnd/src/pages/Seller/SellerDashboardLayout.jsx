// src/layout/SellerDashboardLayout.jsx
import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    Hammer,
    ShoppingBag,
    MessageSquare,
    Settings,
    Clock,
} from "lucide-react";
import { IoLogOutOutline } from "react-icons/io5";

export default function SellerDashboardLayout() {
    const navigate = useNavigate();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const menuItems = [
        { id: "dashboard", icon: LayoutDashboard, label: "Dashboard", path: "/seller" },
        { id: "bidding", icon: Hammer, label: "Bidding", path: "/seller/bidding" },
        { id: "orders", icon: ShoppingBag, label: "Orders", path: "/seller/orders" },
        { id: "history", icon: Clock, label: "History Sold", path: "/seller/history" },
        { id: "chat", icon: MessageSquare, label: "Chat", path: "/seller/chat" },
        { id: "settings", icon: Settings, label: "Settings", path: "/seller/settings" },
    ];

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = "/login";
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-6 border-b border-gray-200">
                    <h1 className="text-sm font-bold text-gray-900 cursor-pointer" onClick={() => navigate("/")}>
                        Seller Dashboard
                    </h1>
                </div>
                <nav className="flex-1 p-4">
                    {menuItems.map(({ id, icon: Icon, label, path }) => (
                        <NavLink
                            key={id}
                            to={path}
                            end={path === "/seller"} // ✅ chỉ match đúng /seller
                            className={({ isActive }) =>
                                `w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition font-medium ${isActive
                                    ? "bg-indigo-100 text-indigo-700 font-semibold !text-indigo-700"
                                    : "text-gray-800 hover:bg-gray-100 hover:text-indigo-600 !text-gray-800"
                                }`
                            }

                        >
                            <Icon size={20} />
                            <span>{label}</span>
                        </NavLink>
                    ))}
                </nav>
                <div className="p-4 border-t border-gray-200">
                    <button
                        onClick={() => setShowLogoutConfirm(true)}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 transition"
                    >
                        <IoLogOutOutline size={20} />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-6">
                <Outlet />
            </main>

            {/* ✅ Popup xác nhận logout */}
            {showLogoutConfirm && (
                <div className="logout-overlay">
                    <div className="logout-popup">
                        <h3>Đăng xuất</h3>
                        <p>Bạn có chắc muốn đăng xuất không?</p>
                        <div className="logout-actions">
                            <button className="btn-cancel" onClick={() => setShowLogoutConfirm(false)}>Hủy</button>
                            <button className="btn-confirm" onClick={handleLogout}>Đăng xuất</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
