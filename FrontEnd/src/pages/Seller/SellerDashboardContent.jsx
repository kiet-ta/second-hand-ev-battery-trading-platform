// src/pages/seller/SellerDashboardContent.jsx
import React, { useEffect, useState } from "react";
import {
    LayoutDashboard,
    ShoppingBag,
    CheckCircle,
    XCircle,
    Clock,
    Star,
    Car,
} from "lucide-react";
import {
    BarChart,
    Bar,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
} from "recharts";

export default function SellerDashboardContent() {
    const sellerId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`https://localhost:7272/api/SellerDashboard/${sellerId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                setDashboardData(data);
            } catch (err) {
                console.error("Lỗi khi tải dữ liệu:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [sellerId, token]);

    if (loading) return <div className="text-gray-500 p-8">Đang tải dữ liệu...</div>;

    return (
        <div className="space-y-8">
            {/* ✅ Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "Listings", value: dashboardData?.listings, icon: LayoutDashboard },
                    { label: "Orders", value: dashboardData?.orders, icon: ShoppingBag },
                    { label: "Sold", value: dashboardData?.sold, icon: CheckCircle },
                    { label: "Revenue", value: dashboardData?.revenue?.toLocaleString("vi-VN"), icon: Star },
                ].map(({ label, value, icon: Icon }) => (
                    <div
                        key={label}
                        className="bg-white rounded-xl p-6 border border-gray-200 flex items-center gap-4"
                    >
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Icon size={24} className="text-gray-600" />
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-gray-900">{value ?? 0}</div>
                            <div className="text-sm text-gray-500">{label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ✅ Product & Order Statistics */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* 🟢 Product Statistics */}
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Product Statistics</h2>
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

                {/* 🟣 Order Statistics */}
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Statistics</h2>
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

            {/* ✅ Charts */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Revenue by Month</h2>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={dashboardData?.revenueByMonth || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="total" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Orders by Month</h2>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={dashboardData?.ordersByMonth || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
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
    );
}
