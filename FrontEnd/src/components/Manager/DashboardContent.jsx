import React, { useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
} from "recharts";
import {
    DollarSign, Users, PackageSearch, TrendingUp,
    FileChartColumn, BarChart3, ClipboardList,
} from "lucide-react";
import Card from "../../components/Manager/Card";
import CardHeader from "../../components/Manager/CardHeader";
import StatTile from "../../components/Manager/StatTile";
import { managerAPI } from "../../hooks/managerApi";

// 🔹 Định dạng tiền VND
function currencyVND(x) {
    try {
        return x.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
    } catch {
        return `${x}`;
    }
}

export default function DashboardContent() {
    const [metrics, setMetrics] = useState(null);
    const [revenueByMonth, setRevenueByMonth] = useState([]);
    const [ordersByMonth, setOrdersByMonth] = useState([]);
    const [distribution, setDistribution] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    // 🔹 Bản đồ tháng
    const monthMap = {
        Jan: "T1", Feb: "T2", Mar: "T3", Apr: "T4",
        May: "T5", Jun: "T6", Jul: "T7", Aug: "T8",
        Sep: "T9", Oct: "T10", Nov: "T11", Dec: "T12",
    };

    useEffect(() => {
        async function fetchAll() {
            try {
                setLoading(true);
                const [m, r, o, d, t] = await Promise.all([
                    managerAPI.getMetrics(),
                    managerAPI.getRevenueByMonth(),
                    managerAPI.getOrdersByMonth(),
                    managerAPI.getProductDistribution(),
                    managerAPI.getTransactions(),
                ]);
                setMetrics(m);
                setRevenueByMonth(r);
                setOrdersByMonth(o);
                setDistribution(d);
                setTransactions(t);
            } catch (err) {
                console.error("❌ Lỗi tải dữ liệu bảng điều khiển:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchAll();
    }, []);

    const hasData = !!metrics;
    const revenueTotal = useMemo(
        () => revenueByMonth.reduce((acc, x) => acc + (x.total || 0), 0),
        [revenueByMonth]
    );

    if (loading)
        return (
            <div className="flex justify-center items-center h-[60vh] text-slate-500">
                Đang tải dữ liệu...
            </div>
        );

    if (!hasData)
        return (
            <div className="flex justify-center items-center h-[60vh] text-slate-400">
                Không có dữ liệu để hiển thị.
            </div>
        );

    return (
        <motion.div
            key="dashboard-content"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35 }}
            className="space-y-6"
        >
            {/* === CHỈ SỐ KPI === */}
            <div className="grid sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatTile
                    icon={<DollarSign size={18} className="text-slate-800" />}
                    label="Doanh thu (tháng)"
                    value={currencyVND(metrics.revenueThisMonth)}
                    hint={`Tổng năm: ${currencyVND(revenueTotal)}`}
                    trend={metrics?.growth ?? 0}
                />
                <StatTile
                    icon={<Users size={18} className="text-slate-800" />}
                    label="Tổng người dùng"
                    value={metrics.totalUsers.toLocaleString("vi-VN")}
                    hint="Người mua / Người bán / Nhân viên"
                />
                <StatTile
                    icon={<PackageSearch size={18} className="text-slate-800" />}
                    label="Sản phẩm đang hoạt động"
                    value={metrics.activeListings.toLocaleString("vi-VN")}
                    hint="Xe điện & Pin"
                />
                <StatTile
                    icon={<TrendingUp size={18} className="text-slate-800" />}
                    label="Tăng trưởng theo tháng"
                    value={`${metrics.growth}%`}
                    hint="So với tháng trước"
                    trend={metrics?.growth ?? 0}
                />
            </div>

            {/* === BIỂU ĐỒ DOANH THU / ĐƠN HÀNG === */}
            <div className="grid lg:grid-cols-5 gap-4">

                {/* === Doanh thu theo tháng === */}
                {/* === Doanh thu theo tháng === */}
                <Card className="lg:col-span-3">
                    <CardHeader
                        title="Doanh thu theo tháng"
                        icon={<FileChartColumn size={18} className="text-slate-700" />}
                    />
                    <div className="p-4 h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={revenueByMonth.map((item) => ({
                                    ...item,
                                    month: monthMap[item.month] || item.month,
                                }))}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="month"
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis
                                    tickFormatter={(value) =>
                                        value.toLocaleString("vi-VN")
                                    }
                                    tick={{ fontSize: 12 }}
                                />
                                <Tooltip
                                    formatter={(value) => [`${currencyVND(value)}`, "Doanh thu"]}
                                    labelFormatter={(label) => `Tháng ${label.replace("T", "")}`}
                                    contentStyle={{
                                        backgroundColor: "#fff",
                                        borderRadius: "8px",
                                        border: "1px solid #ddd",
                                        fontSize: "13px",
                                    }}
                                    itemStyle={{ color: "#4F46E5", fontWeight: 500 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="total"
                                    stroke="#4F46E5"
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>


                {/* === Số đơn hàng theo tháng === */}
                <Card className="lg:col-span-2">
                    <CardHeader
                        title="Số đơn hàng theo tháng"
                        icon={<BarChart3 size={18} className="text-slate-700" />}
                    />
                    <div className="p-4 h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={ordersByMonth.map((item) => ({
                                    ...item,
                                    month: monthMap[item.month] || item.month,
                                }))}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                <YAxis
                                    tickFormatter={(v) =>
                                        `${v.toLocaleString("vi-VN")}`
                                    }
                                    tick={{ fontSize: 12 }}
                                />
                                <Tooltip
                                    formatter={(value) => [
                                        `${value.toLocaleString("vi-VN")} đơn hàng`,
                                        "",
                                    ]}
                                    labelFormatter={(label) =>
                                        `Tháng ${label.replace("T", "")}`
                                    }
                                    contentStyle={{
                                        backgroundColor: "#fff",
                                        borderRadius: "8px",
                                        border: "1px solid #ddd",
                                        fontSize: "13px",
                                    }}
                                />
                                <Bar
                                    dataKey="totalOrders"
                                    fill="#4F46E5"
                                    radius={[6, 6, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* === PHÂN BỔ SẢN PHẨM & GIAO DỊCH GẦN NHẤT === */}
            <div className="grid lg:grid-cols-5 gap-4">
                {/* === Phân bổ sản phẩm === */}
                <Card className="lg:col-span-2">
                    <CardHeader
                        title="Tỷ lệ phân bổ sản phẩm"
                        icon={<PackageSearch size={18} className="text-slate-700" />}
                    />
                    <div className="p-4 h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={distribution.map((item) => ({
                                        ...item,
                                        name:
                                            item.name === "battery"
                                                ? "Pin"
                                                : item.name === "ev"
                                                    ? "Xe điện"
                                                    : item.name,
                                    }))}
                                    dataKey="value"
                                    nameKey="name"
                                    outerRadius={90}
                                    label={({ name, value }) =>
                                        `${name}: ${value}%`
                                    }
                                >
                                    {distribution.map((item, idx) => (
                                        <Cell
                                            key={item?.name || `dist-${idx}`}
                                            fill={
                                                ["#4F46E5", "#10B981", "#F59E0B", "#EF4444"][
                                                idx % 4
                                                ]
                                            }
                                        />
                                    ))}
                                </Pie>
                                <Legend />
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* === Giao dịch gần đây === */}
                <Card className="lg:col-span-3">
                    <CardHeader
                        title="Giao dịch gần đây"
                        icon={<ClipboardList size={18} className="text-slate-700" />}
                    />
                    <div className="p-4 overflow-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="text-left text-slate-500 border-b">
                                    <th className="py-2">Mã GD</th>
                                    <th className="py-2">Sản phẩm</th>
                                    <th className="py-2">Người mua</th>
                                    <th className="py-2">Người bán</th>
                                    <th className="py-2">Giá</th>
                                    <th className="py-2">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.slice(0, 5).map((t, idx) => (
                                    <tr
                                        key={t.paymentId || idx}
                                        className="border-b last:border-0 hover:bg-slate-50 transition"
                                    >
                                        <td className="py-2 font-medium text-slate-700">
                                            #{t.paymentId}
                                        </td>
                                        <td className="py-2">
                                            {t.items?.[0]?.title || "—"}
                                        </td>
                                        <td className="py-2">{t.buyerName}</td>
                                        <td className="py-2">{t.sellerName}</td>
                                        <td className="py-2">
                                            {currencyVND(t.totalAmount)}
                                        </td>
                                        <td className="py-2 capitalize text-slate-700">
                                            {t.status === "completed"
                                                ? "Hoàn tất"
                                                : t.status === "pending"
                                                    ? "Đang xử lý"
                                                    : "Đã hủy"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </motion.div>
    );
}
