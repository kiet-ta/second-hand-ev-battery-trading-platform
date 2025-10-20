import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import Card from "./Card"; // Assuming existence
import CardHeader from "./CardHeader"; // Assuming existence
import { DollarSign, Users, PackageSearch, TrendingUp, FileChartColumn, BarChart3, ClipboardList } from "lucide-react";

// ✨ FIX: Define the utility function locally so the component doesn't rely on it being passed as a prop.
function currencyVND(x) {
    try {
        // Assuming the Vietnamese locale and currency formatting
        return x.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
    } catch {
        return `${x}`;
    }
}
// --- END FIX ---


function StatTile({ icon, label, value, hint, trend }) {
    return (
        <div className="flex items-center gap-4 p-5 rounded-2xl border border-slate-200 bg-white hover:shadow transition">
            <div className="p-3 rounded-xl border border-slate-200">{icon}</div>
            <div className="flex-1">
                <p className="text-sm text-slate-500">{label}</p>
                <p className="text-xl font-semibold text-slate-800 mt-0.5">{value}</p>
                {hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
            </div>
            {typeof trend === "number" && (
                <div className={`text-sm font-medium ${trend >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {trend >= 0 ? "+" : ""}
                    {trend}%
                </div>
            )}
        </div>
    );
}
export default function DashboardContent({ 
    metrics, 
    revenueByMonth = [], 
    ordersByMonth = [], 
    distribution = [], 
    transactions = [], 
    // currencyVND is no longer needed as a prop
}) {
    
    // Calculate total revenue for hint
    const revenueTotal = useMemo(
        // ✨ FIX: Use local currencyVND function
        () => revenueByMonth.reduce((acc, x) => acc + (x.total || 0), 0),
        [revenueByMonth]
    );

    const hasData = !!metrics; 

    return (
        <motion.div
            key="dashboard-content"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35 }}
            className="space-y-6"
        >
            {/* KPI Section */}
            <div className="grid sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatTile
                    icon={<DollarSign size={18} className="text-slate-800" />}
                    label="Revenue (month)"
                    // ✨ FIX: Use local currencyVND function
                    value={metrics?.revenueThisMonth ? currencyVND(metrics.revenueThisMonth) : "—"}
                    hint={`YTD: ${currencyVND(revenueTotal)}`}
                    trend={metrics?.growth ?? 0}
                />
                <StatTile
                    icon={<Users size={18} className="text-slate-800" />}
                    label="Total Users"
                    value={hasData ? metrics.totalUsers.toLocaleString("vi-VN") : "—"}
                    hint="Buyer / Seller / Staff"
                />
                <StatTile
                    icon={<PackageSearch size={18} className="text-slate-800" />}
                    label="Active Listings"
                    value={hasData ? metrics.activeListings.toLocaleString("vi-VN") : "—"}
                    hint="EV & Battery"
                />
                <StatTile
                    icon={<TrendingUp size={18} className="text-slate-800" />}
                    label="Growth MoM"
                    value={hasData ? `${metrics.growth}%` : "—"}
                    hint="vs last month"
                    trend={metrics?.growth ?? 0}
                />
            </div>

            {/* Charts Section */}
            <div className="grid lg:grid-cols-5 gap-4">
                <Card className="lg:col-span-3">
                    <CardHeader title="Revenue by Month" icon={<FileChartColumn size={18} />} />
                    <div className="p-4 h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={revenueByMonth}>
                                <CartesianGrid strokeDashArray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                {/* ✨ FIX: Use local currencyVND function in formatter */}
                                <Tooltip formatter={currencyVND} />
                                <Line type="monotone" dataKey="total" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
                <Card className="lg:col-span-2">
                    <CardHeader title="Orders by Month" icon={<BarChart3 size={18} />} />
                    <div className="p-4 h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={ordersByMonth}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="totalOrders" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* Distribution + Transactions Section */}
            <div className="grid lg:grid-cols-5 gap-4">
                <Card className="lg:col-span-2">
                    <CardHeader title="Product Distribution" icon={<PackageSearch size={18} />} />
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
                                            fill={["#3b82f6", "#f59e0b", "#10b981", "#ef4444"][idx % 4]}
                                        />
                                    ))}
                                </Pie>
                                <Legend />
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
                
                {/* Latest Transactions Table */}
                <Card className="lg:col-span-3">
                    <CardHeader title="Latest Transactions" icon={<ClipboardList size={18} />} />
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
                                    <tr key={t.paymentId || idx} className="border-b last:border-0">
                                        <td className="py-2 font-medium text-slate-700">#{t.paymentId}</td>
                                        <td className="py-2">{t.items?.[0]?.title || "—"}</td>
                                        <td className="py-2">{t.buyerName}</td>
                                        <td className="py-2">{t.sellerName}</td>
                                        {/* ✨ FIX: Use local currencyVND function */}
                                        <td className="py-2">{currencyVND(t.totalAmount)}</td>
                                        <td className="py-2 capitalize">{t.status}</td>
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
