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
    const baseURL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`${baseURL}seller-dashboard/${sellerId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                setDashboardData(data);
            } catch (err) {
                console.error("❌ Lỗi khi tải dữ liệu:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [sellerId, token]);

    if (loading)
        return <div className="text-gray-500 p-8">Đang tải dữ liệu...</div>;

    const revenueData =
        dashboardData?.revenueByWeek?.map((w) => ({
            weekLabel: `Tuần ${w.weekNumber}/${w.year}`,
            Tổng: w.total,
        })) || [];

    const orderData =
        dashboardData?.ordersByWeek?.map((w) => ({
            weekLabel: `Tuần ${w.weekNumber}/${w.year}`,
            Tổng: w.total,
        })) || [];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between border border-black/20 bg-gradient-to-r from-white to-[#f8f9ff] text-[#1E1E2F] rounded-xl p-6 shadow-sm">
                <div>
                    <h1 className="text-2xl font-semibold text-black">Trang của người bán</h1>
                    <p className="text-sm text-gray-600">
                        Quản lý sản phẩm, đơn hàng và theo dõi doanh thu của bạn
                    </p>
                </div>
            </div>

            {/* Thống kê tổng quan */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "Sản phẩm đăng bán", value: dashboardData?.listings, icon: LayoutDashboard },
                    { label: "Đơn hàng", value: dashboardData?.orders, icon: ShoppingBag },
                    { label: "Đã bán", value: dashboardData?.sold, icon: CheckCircle },
                    {
                        label: "Doanh thu (VND)",
                        value: dashboardData?.revenue?.toLocaleString("vi-VN"),
                        icon: Star,
                    },
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

            {/* Thống kê sản phẩm & đơn hàng */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Thống kê sản phẩm */}
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">
                        Thống kê sản phẩm
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                            <Car size={20} className="text-gray-600" />
                            <div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {dashboardData?.productStatistics?.active ?? 0}
                                </div>
                                <div className="text-sm text-gray-500">Đang hoạt động</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Clock size={20} className="text-gray-600" />
                            <div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {dashboardData?.productStatistics?.pending ?? 0}
                                </div>
                                <div className="text-sm text-gray-500">Đang chờ duyệt</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <XCircle size={20} className="text-gray-600" />
                            <div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {dashboardData?.productStatistics?.inactive ?? 0}
                                </div>
                                <div className="text-sm text-gray-500">Ngừng bán</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Star size={20} className="text-gray-600" />
                            <div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {dashboardData?.productStatistics?.featured ?? 0}
                                </div>
                                <div className="text-sm text-gray-500">Nổi bật</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Thống kê đơn hàng */}
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">
                        Thống kê đơn hàng
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                            <ShoppingBag size={20} className="text-gray-600" />
                            <div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {dashboardData?.orderStatistics?.new ?? 0}
                                </div>
                                <div className="text-sm text-gray-500">Đơn mới</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Clock size={20} className="text-gray-600" />
                            <div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {dashboardData?.orderStatistics?.processing ?? 0}
                                </div>
                                <div className="text-sm text-gray-500">Đang xử lý</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <CheckCircle size={20} className="text-gray-600" />
                            <div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {dashboardData?.orderStatistics?.completed ?? 0}
                                </div>
                                <div className="text-sm text-gray-500">Hoàn thành</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <XCircle size={20} className="text-gray-600" />
                            <div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {dashboardData?.orderStatistics?.cancelled ?? 0}
                                </div>
                                <div className="text-sm text-gray-500">Đã hủy</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">
                        Doanh thu theo tuần
                    </h2>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart
                            data={revenueData}
                            margin={{ top: 20, right: 20, left: 50, bottom: 20 }} // ✅ thêm đệm trái
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="weekLabel" />
                            <YAxis
                                domain={[0, "dataMax"]}
                                tickMargin={8}
                                tickFormatter={(value) => {
                                    if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)} tỷ`;
                                    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)} triệu`;
                                    if (value >= 1_000) return `${(value / 1_000).toFixed(0)} nghìn`;
                                    return value.toLocaleString("vi-VN");
                                }}
                                tick={{ fontSize: 12 }}
                            />
                            <Tooltip
                                formatter={(v) => v.toLocaleString("vi-VN") + " VND"}
                                labelFormatter={(label) => `📅 ${label}`}
                            />
                            <Bar dataKey="Tổng" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Biểu đồ đơn hàng */}
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">
                        Đơn hàng theo tuần
                    </h2>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={orderData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="weekLabel" />
                            <YAxis />
                            <Tooltip />
                            <Line
                                type="monotone"
                                dataKey="Tổng"
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
