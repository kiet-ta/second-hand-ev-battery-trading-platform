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
                    label="Doanh thu"
                    value={currencyVND(revenueTotal)}
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
            </div>

            {/* === BIỂU ĐỒ DOANH THU / ĐƠN HÀNG === */}
            <div className="grid lg:grid-cols-5 gap-4">



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
                                            item.name === "Battery"
                                                ? "Pin"
                                                : item.name === "Ev"
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

            </div>

            {/* === PHÂN BỔ SẢN PHẨM & GIAO DỊCH GẦN NHẤT === */}
            <div className="grid lg:grid-cols-5 gap-4">
                {/* === Phân bổ sản phẩm === */}


                {/* === Giao dịch gần đây === */}

            </div>
        </motion.div>
    );
}
