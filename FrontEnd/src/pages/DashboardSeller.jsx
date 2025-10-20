import React, { useState, useEffect } from "react";
import {
    LayoutDashboard,
    Hammer,
    ShoppingBag,
    MessageSquare,
    Settings,
    Car,
    Clock,
    Star,
    XCircle,
    CheckCircle,
    User,
} from "lucide-react";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import HistorySold from "../components/HistorySold";
import { useNavigate } from "react-router-dom";
import { IoLogOutOutline } from "react-icons/io5";
import SellerAuctionListPage from "../pages/SellerAuctionListPage";
import MyProduct from "../components/ItemForm/AddProductForm"
import NewsPage from "../components/CreateNews";

export default function SellerDashboard() {
    const [activeMenu, setActiveMenu] = useState("dashboard");
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [error, setError] = useState(null);

    const sellerId = localStorage.getItem("userId") || 2;
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await fetch(
                    `https://localhost:7272/api/SellerDashboard/${sellerId}`,
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
        localStorage.clear();
        navigate("/login");
    };


    const menuItems = [
        { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { id: "bidding", icon: Hammer, label: "Bidding" },
        { id: "orders", icon: ShoppingBag, label: "Orders" },
        { id: "history", icon: Clock, label: "History Sold" },
        { id: "messages", icon: MessageSquare, label: "Messages" },
        { id: "settings", icon: Settings, label: "Settings" },
    ];

    if (loading) {
        return <div className="p-8 text-gray-500">Đang tải dữ liệu dashboard...</div>;
    }

    if (error) {
        return <div className="p-8 text-red-600">Lỗi: {error}</div>;
    }

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-6 border-b border-gray-200">
                    <h1 className="text-sm font-bold text-gray-900">Seller Dashboard</h1>
                </div>

                <nav className="flex-1 p-4">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveMenu(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition ${activeMenu === item.id
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

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                {activeMenu === "history" ? (
                    <HistorySold />
                ) : activeMenu == "orders" ? (
                    <MyProduct />
                ) : activeMenu == "messages" ?
                    (
                        <NewsPage />
                    ) : activeMenu === "bidding" ? (
                        <SellerAuctionListPage />
                    ) : (
                        <div className="p-8">
                            {/* Header with Avatar */}
                            <div className="flex justify-end mb-8">
                                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                                    <User size={20} className="text-gray-600" />
                                </div>
                            </div>

                            {/* Top Stats Cards */}
                            <div className="grid grid-cols-4 gap-6 mb-8">
                                {/* Listings */}
                                <div className="bg-white rounded-xl p-6 border border-gray-200">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <LayoutDashboard size={24} className="text-gray-600" />
                                        </div>
                                        <div>
                                            <div className="text-3xl font-bold text-gray-900">
                                                {dashboardData?.listings ?? 0}
                                            </div>
                                            <div className="text-sm text-gray-500">Listings</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Orders */}
                                <div className="bg-white rounded-xl p-6 border border-gray-200">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <ShoppingBag size={24} className="text-gray-600" />
                                        </div>
                                        <div>
                                            <div className="text-3xl font-bold text-gray-900">
                                                {dashboardData?.orders ?? 0}
                                            </div>
                                            <div className="text-sm text-gray-500">Orders</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Sold */}
                                <div className="bg-white rounded-xl p-6 border border-gray-200">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <CheckCircle size={24} className="text-gray-600" />
                                        </div>
                                        <div>
                                            <div className="text-3xl font-bold text-gray-900">
                                                {dashboardData?.sold ?? 0}
                                            </div>
                                            <div className="text-sm text-gray-500">Sold</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Revenue */}
                                <div className="bg-white rounded-xl p-6 border border-gray-200">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <span className="text-xl">₫</span>
                                        </div>
                                        <div>
                                            <div className="text-3xl font-bold text-gray-900">
                                                {dashboardData?.revenue?.toLocaleString("vi-VN") ?? 0}
                                            </div>
                                            <div className="text-sm text-gray-500">Revenue</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Statistics Grid */}
                            <div className="grid grid-cols-2 gap-6 mb-8">
                                {/* Product Statistics */}
                                <div className="bg-white rounded-xl p-6 border border-gray-200">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-6">
                                        Product Statistics
                                    </h2>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center gap-3">
                                            <Car size={20} className="text-gray-600" />
                                            <div>
                                                <div className="text-2xl font-bold text-gray-900">
                                                    {dashboardData?.productStatistics?.active ?? 0}
                                                </div>
                                                <div className="text-sm text-gray-500">Active</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <Clock size={20} className="text-gray-600" />
                                            <div>
                                                <div className="text-2xl font-bold text-gray-900">
                                                    {dashboardData?.productStatistics?.pending ?? 0}
                                                </div>
                                                <div className="text-sm text-gray-500">Pending</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <XCircle size={20} className="text-gray-600" />
                                            <div>
                                                <div className="text-2xl font-bold text-gray-900">
                                                    {dashboardData?.productStatistics?.inactive ?? 0}
                                                </div>
                                                <div className="text-sm text-gray-500">Inactive</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <Star size={20} className="text-gray-600" />
                                            <div>
                                                <div className="text-2xl font-bold text-gray-900">
                                                    {dashboardData?.productStatistics?.featured ?? 0}
                                                </div>
                                                <div className="text-sm text-gray-500">Featured</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Statistics */}
                                <div className="bg-white rounded-xl p-6 border border-gray-200">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-6">
                                        Order Statistics
                                    </h2>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center gap-3">
                                            <ShoppingBag size={20} className="text-gray-600" />
                                            <div>
                                                <div className="text-2xl font-bold text-gray-900">
                                                    {dashboardData?.orderStatistics?.new ?? 0}
                                                </div>
                                                <div className="text-sm text-gray-500">New</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <Clock size={20} className="text-gray-600" />
                                            <div>
                                                <div className="text-2xl font-bold text-gray-900">
                                                    {dashboardData?.orderStatistics?.processing ?? 0}
                                                </div>
                                                <div className="text-sm text-gray-500">Processing</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <CheckCircle size={20} className="text-gray-600" />
                                            <div>
                                                <div className="text-2xl font-bold text-gray-900">
                                                    {dashboardData?.orderStatistics?.completed ?? 0}
                                                </div>
                                                <div className="text-sm text-gray-500">Completed</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <XCircle size={20} className="text-gray-600" />
                                            <div>
                                                <div className="text-2xl font-bold text-gray-900">
                                                    {dashboardData?.orderStatistics?.cancelled ?? 0}
                                                </div>
                                                <div className="text-sm text-gray-500">Cancelled</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Charts */}
                            <div className="grid grid-cols-2 gap-6">
                                {/* Revenue Chart */}
                                <div className="bg-white rounded-xl p-6 border border-gray-200">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-6">
                                        Revenue
                                    </h2>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <BarChart data={dashboardData?.revenueByMonth || []}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                            <YAxis tick={{ fontSize: 12 }} />
                                            <Tooltip
                                                formatter={(v) => [
                                                    `₫${v.toLocaleString("vi-VN")}`,
                                                    "Doanh thu",
                                                ]}
                                                contentStyle={{
                                                    borderRadius: "8px",
                                                    border: "1px solid #e5e7eb",
                                                }}
                                            />
                                            <Bar dataKey="total" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Orders Chart */}
                                <div className="bg-white rounded-xl p-6 border border-gray-200">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-6">
                                        Orders by Month
                                    </h2>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <LineChart data={dashboardData?.ordersByMonth || []}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                            <YAxis tick={{ fontSize: 12 }} />
                                            <Tooltip
                                                formatter={(v) => [v, "Orders"]}
                                                contentStyle={{
                                                    borderRadius: "8px",
                                                    border: "1px solid #e5e7eb",
                                                }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="totalOrders"
                                                stroke="#3b82f6"
                                                strokeWidth={3}
                                                dot={false}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    )}
            </div>
        </div>
    );
}
