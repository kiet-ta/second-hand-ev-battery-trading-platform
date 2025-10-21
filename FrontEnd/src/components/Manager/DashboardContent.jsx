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

// Utility: format VND currency
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

    useEffect(() => {
        async function fetchAll() {
            try {
                setLoading(true);
                const [
                    m, r, o, d, t
                ] = await Promise.all([
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
                console.error("❌ Lỗi tải dashboard:", err);
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
            {/* === KPI SECTION === */}
            <div className="grid sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatTile
                    icon={<DollarSign size={18} className="text-slate-800" />}
                    label="Revenue (Month)"
                    value={currencyVND(metrics.revenueThisMonth)}
                    hint={`YTD: ${currencyVND(revenueTotal)}`}
                    trend={metrics?.growth ?? 0}
                />
                <StatTile
                    icon={<Users size={18} className="text-slate-800" />}
                    label="Total Users"
                    value={metrics.totalUsers.toLocaleString("vi-VN")}
                    hint="Buyer / Seller / Staff"
                />
                <StatTile
                    icon={<PackageSearch size={18} className="text-slate-800" />}
                    label="Active Listings"
                    value={metrics.activeListings.toLocaleString("vi-VN")}
                    hint="EV & Battery"
                />
                <StatTile
                    icon={<TrendingUp size={18} className="text-slate-800" />}
                    label="Growth MoM"
                    value={`${metrics.growth}%`}
                    hint="vs last month"
                    trend={metrics?.growth ?? 0}
                />
            </div>

            {/* === CHART SECTION === */}
            <div className="grid lg:grid-cols-5 gap-4">
                {/* Revenue Chart */}
                <Card className="lg:col-span-3">
                    <CardHeader
                        title="Revenue by Month"
                        icon={<FileChartColumn size={18} className="text-slate-700" />}
                    />
                    <div className="p-4 h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={revenueByMonth}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip formatter={currencyVND} />
                                <Line
                                    type="monotone"
                                    dataKey="total"
                                    stroke="#4F46E5"
                                    strokeWidth={2}
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Orders Chart */}
                <Card className="lg:col-span-2">
                    <CardHeader
                        title="Orders by Month"
                        icon={<BarChart3 size={18} className="text-slate-700" />}
                    />
                    <div className="p-4 h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={ordersByMonth}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="totalOrders" fill="#4F46E5" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* === DISTRIBUTION + TRANSACTION === */}
            <div className="grid lg:grid-cols-5 gap-4">
                {/* Product Distribution */}
                <Card className="lg:col-span-2">
                    <CardHeader
                        title="Product Distribution"
                        icon={<PackageSearch size={18} className="text-slate-700" />}
                    />
                    <div className="p-4 h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={distribution}
                                    dataKey="value"
                                    nameKey="name"
                                    outerRadius={90}
                                    label={({ name, value }) => `${name}: ${value}%`}
                                >
                                    {distribution.map((item, idx) => (
                                        <Cell
                                            key={item?.name || `dist-${idx}`}
                                            fill={["#4F46E5", "#10B981", "#F59E0B", "#EF4444"][idx % 4]}
                                        />
                                    ))}
                                </Pie>
                                <Legend />
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Latest Transactions */}
                <Card className="lg:col-span-3">
                    <CardHeader
                        title="Latest Transactions"
                        icon={<ClipboardList size={18} className="text-slate-700" />}
                    />
                    <div className="p-4 overflow-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="text-left text-slate-500 border-b">
                                    <th className="py-2">Code</th>
                                    <th className="py-2">Item</th>
                                    <th className="py-2">Buyer</th>
                                    <th className="py-2">Seller</th>
                                    <th className="py-2">Price</th>
                                    <th className="py-2">Status</th>
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
                                        <td className="py-2">{t.items?.[0]?.title || "—"}</td>
                                        <td className="py-2">{t.buyerName}</td>
                                        <td className="py-2">{t.sellerName}</td>
                                        <td className="py-2">{currencyVND(t.totalAmount)}</td>
                                        <td className="py-2 capitalize text-slate-700">
                                            {t.status}
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
