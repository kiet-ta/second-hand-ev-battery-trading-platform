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
import Logo from "../../components/Logo"

export default function SellerDashboardLayout() {
    const navigate = useNavigate();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const menuItems = [
        { id: "dashboard", icon: LayoutDashboard, label: "Bảng điều khiển", path: "/seller" },
        { id: "bidding", icon: Hammer, label: "Phiên đấu giá", path: "/seller/bidding" },
        { id: "orders", icon: ShoppingBag, label: "Đơn hàng", path: "/seller/orders" },
        { id: "history", icon: Clock, label: "Lịch sử bán hàng", path: "/seller/history" },
        { id: "chat", icon: MessageSquare, label: "Tin nhắn", path: "/seller/chat" },
        { id: "settings", icon: Settings, label: "Cài đặt", path: "/seller/settings" },
    ];

    const handleLogout = () => {
        // Giữ lại thông tin remember
        const rememberEmail = localStorage.getItem("rememberEmail");
        const rememberPassword = localStorage.getItem("rememberPassword");

        localStorage.clear(); // Xoá mọi thứ
        // Ghi lại thông tin remember
        if (rememberEmail && rememberPassword) {
            localStorage.setItem("rememberEmail", rememberEmail);
            localStorage.setItem("rememberPassword", rememberPassword);
        }

        navigate("/login");
    };


    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-6 border-b border-gray-200">
                    <Logo />
                </div>

                {/* Menu chính */}
                <nav className="flex-1 p-4">
                    {menuItems.map(({ id, icon: Icon, label, path }) => (
                        <NavLink
                            key={id}
                            to={path}
                            end={path === "/seller"} // chỉ match đúng /seller
                            className={({ isActive }) =>
                                `w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition font-medium ${isActive
                                    ? "bg-indigo-100 !text-indigo-700 font-semibold"
                                    : "!text-gray-800 hover:bg-gray-100 hover:text-indigo-600"
                                }`
                            }
                        >
                            <Icon size={20} />
                            <span>{label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Đăng xuất */}
                <div className="p-4 border-t border-gray-200">
                    <button
                        onClick={() => setShowLogoutConfirm(true)}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 transition"
                    >
                        <IoLogOutOutline size={20} />
                        <span className="font-medium text-red-600">Đăng xuất</span>
                    </button>
                </div>
            </aside>

            {/* Nội dung chính */}
            <main className="flex-1 overflow-y-auto p-6">
                <Outlet />
            </main>

            {/* Popup xác nhận đăng xuất */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 shadow-lg text-center max-w-sm w-full">
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">Đăng xuất</h3>
                        <p className="text-slate-600 mb-4">Bạn có chắc muốn đăng xuất không?</p>
                        <div className="flex justify-center gap-3">
                            <button
                                className="px-4 py-2 text-sm rounded-md border border-slate-300 hover:bg-slate-100"
                                onClick={() => setShowLogoutConfirm(false)}
                            >
                                Hủy
                            </button>
                            <button
                                className="px-4 py-2 text-sm rounded-md bg-red-500 text-white hover:bg-red-600"
                                onClick={handleLogout}
                            >
                                Đăng xuất
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
