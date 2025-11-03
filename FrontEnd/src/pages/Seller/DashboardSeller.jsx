import React, { useState, useEffect } from "react";
import {
    LayoutDashboard, Hammer, ShoppingBag, MessageSquare,
    Settings, Clock, User,
} from "lucide-react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { IoLogOutOutline } from "react-icons/io5";
import Logo from "../components/Logo"

export default function SellerDashboard() {
    const location = useLocation();
    const navigate = useNavigate();
    const baseURL = import.meta.env.VITE_API_BASE_URL;

    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const sellerId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    // Fetch dashboard data
    useEffect(() => {
        if (!token || !sellerId) return;

        const fetchDashboard = async () => {
            setLoading(true);
            try {
                const res = await fetch(
                    `${baseURL}seller-dashboard/${sellerId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );
                if (!res.ok) throw new Error("Không thể tải dữ liệu dashboard");
                const data = await res.json();
                setDashboardData(data);
            } catch (err) {
                console.error("Lỗi khi lấy dashboard:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, [sellerId, token]);

    const handleLogout = () => {
        const rememberEmail = localStorage.getItem("rememberEmail");
        const rememberPassword = localStorage.getItem("rememberPassword");

        localStorage.clear(); 
        if (rememberEmail && rememberPassword) {
            localStorage.setItem("rememberEmail", rememberEmail);
            localStorage.setItem("rememberPassword", rememberPassword);
        }

        navigate("/login");
    };


    // Menu items define the navigation paths relative to the /seller route
    const menuItems = [
        { id: "dashboard", icon: LayoutDashboard, label: "Dashboard", path: "" },
        { id: "bidding", icon: Hammer, label: "Bidding", path: "bidding" },
        { id: "products", icon: ShoppingBag, label: "My Products", path: "products" },
        { id: "history", icon: Clock, label: "History Sold", path: "history" },
        { id: "chat", icon: MessageSquare, label: "Chat with Buyer", path: "chat" },
        { id: "settings", icon: Settings, label: "Settings", path: "settings" },
    ];

    // Function to check if a menu item is active
    const isActive = (path) => {
        if (path === "") {
            return location.pathname === "/seller" || location.pathname === "/seller/";
        }
        return location.pathname.startsWith(`/seller/${path}`);
    };

    if (loading) {
        return <div className="p-8 text-gray-500">Đang tải dữ liệu dashboard...</div>;
    }

    if (error) {
        return <div className="p-8 text-red-600">Lỗi: {error}</div>;
    }

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar (Navigation) */}
            <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-6 border-b border-gray-200">
                    <Logo />
                    <h1 className="text-sm font-bold text-gray-900">Seller Dashboard</h1>
                </div>

                <nav className="flex-1 p-4">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);

                        return (
                            <button
                                key={item.id}
                                onClick={() => navigate(item.path)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition ${active
                                    ? "bg-gray-100 text-gray-900"
                                    : "text-gray-600 hover:bg-gray-50"
                                    }`}
                            >
                                <Icon size={20} />
                                <span className="font-medium">{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-200">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 transition"
                    >
                        <IoLogOutOutline size={20} />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </div>

            {/* Main Content: Renders the nested route content */}
            <div className="flex-1 overflow-auto">
                {/* The Outlet is critical: it renders the child element defined in the router.
                  For the path /seller, it will render the index element (DashboardContentView).
                */}
                <Outlet context={{ dashboardData, loading, error }} />
            </div>
        </div>
    );
}