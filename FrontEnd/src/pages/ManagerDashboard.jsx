import React, { useEffect, useMemo, useState } from "react";
import {
    LayoutDashboard,
    Users,
    UserCog,
    PackageSearch,
    Percent,
    Settings,
    LogOut,
    BarChart3,
    ShieldCheck,
    DollarSign,
    TrendingUp,
    FileChartColumn,
    ClipboardList,
    Search,
    Filter,
    RefreshCw,
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
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { managerAPI } from "../hooks/managerApi";

import "../assets/styles/SidebarAnimation.css"; // hiệu ứng sidebar (code ở dưới)

function currencyVND(x) {
    try {
        return x.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
    } catch {
        return `${x}`;
    }
}

function Card({ children, className = "" }) {
    return (
        <div className={`rounded-2xl shadow-sm border border-slate-200 bg-white ${className}`}>
            {children}
        </div>
    );
}

function CardHeader({ title, icon, action }) {
    return (
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
                {icon}
                <h3 className="font-semibold text-slate-800">{title}</h3>
            </div>
            {action}
        </div>
    );
}

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

export default function ManagerDashboard() {
    const [active, setActive] = useState("dashboard");
    const [loading, setLoading] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    // Dashboard data
    const [metrics, setMetrics] = useState(null);
    const [revenueByMonth, setRevenueByMonth] = useState([]);
    const [ordersByMonth, setOrdersByMonth] = useState([]);
    const [distribution, setDistribution] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [approvals, setApprovals] = useState([]);

    // Other tabs
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);

    // Modal add staff
    const [showAddStaffModal, setShowAddStaffModal] = useState(false);
    const [newStaff, setNewStaff] = useState({ fullName: "", email: "", role: "staff", tasks: [] });

    // fetch all for dashboard
    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const [m, rev, ord, dist, tx, aps] = await Promise.all([
                    managerAPI.getMetrics(),
                    managerAPI.getRevenueByMonth(),
                    managerAPI.getOrdersByMonth(),
                    managerAPI.getProductDistribution(),
                    managerAPI.getTransactions(),
                    managerAPI.getPendingSellerApprovals(),
                ]);

                setMetrics(m);
                setRevenueByMonth(rev);
                setOrdersByMonth(ord);
                setDistribution(dist);
                setTransactions(tx);
                setApprovals(aps);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    // fetch for other tabs
    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const userData = await managerAPI.getUsers();

                // Lấy danh sách itemId trước
                const itemList = await managerAPI.getProducts();

                // Gọi API /Item/{itemId}/Seller cho từng item
                const productData = await Promise.all(
                    itemList.map(async (item) => {
                        const fullData = await managerAPI.getItemWithSeller(item.itemId);
                        return fullData;
                    })
                );

                setUsers(userData);
                setProducts(productData);
            } catch (err) {
                console.error("❌ Lỗi khi tải dữ liệu:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, []);



    const handleLogoutConfirm = () => {
        localStorage.clear();
        window.location.href = "/login";
    };

    const handleCancelLogout = () => {
        setShowLogoutConfirm(false);
    };

    const revenueTotal = useMemo(
        () => revenueByMonth.reduce((acc, x) => acc + (x.total || 0), 0),
        [revenueByMonth]
    );

    const menu = [
        { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
        { key: "users", label: "User Management", icon: <UserCog size={18} /> },
        { key: "products", label: "Product Management", icon: <PackageSearch size={18} /> },
        { key: "transactions", label: "Transaction Monitor", icon: <ClipboardList size={18} /> },
        { key: "reports", label: "Reports & Analytics", icon: <BarChart3 size={18} /> },
        { key: "settings", label: "Settings", icon: <Settings size={18} /> },
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Top bar */}
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-200">
                <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl border border-slate-200 grid place-items-center">
                            <ShieldCheck size={18} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 leading-tight">EV & Battery Trading Platform</p>
                            <h1 className="text-lg font-semibold text-slate-800 -mt-0.5">Manager Console</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="hidden md:flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-xl bg-white">
                            <Search size={16} className="opacity-70" />
                            <input placeholder="Search…" className="outline-none text-sm w-44" />
                            <Filter size={16} className="opacity-70" />
                        </div>
                        <button className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm flex items-center gap-2 hover:bg-slate-50">
                            <RefreshCw size={16} /> Refresh
                        </button>
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="max-w-[1600px] mx-auto grid grid-cols-12 gap-6 px-6 py-6">
                {/* Sidebar */}
                <aside className="col-span-12 lg:col-span-3 xl:col-span-2">
                    <Card>
                        <div className="p-3">
                            {menu.map((m) => (
                                <button
                                    key={m.key}
                                    onClick={() => setActive(m.key)}
                                    className={`sidebar-button w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm border mb-2 transition-all duration-300 ease-in-out ${active === m.key
                                        ? "active border-transparent shadow-sm"
                                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                                        }`}
                                >
                                    {m.icon}
                                    <span>{m.label}</span>
                                </button>
                            ))}

                            <div className="pt-2 border-t mt-2">
                                <button className="sidebar-button w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm border bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                                    onClick={() => setShowLogoutConfirm(true)}
                                >
                                    <LogOut size={18} /> Logout
                                </button>
                            </div>
                        </div>
                    </Card>

                    <Card className="mt-6">
                        <CardHeader title="Quick Actions" icon={<Settings size={18} className="text-slate-700" />} />
                        <div className="p-4 grid grid-cols-1 gap-2">
                            <button
                                onClick={() => setShowAddStaffModal(true)}
                                className="px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 hover:bg-slate-50 text-left"
                            >
                                + Add Staff Account
                            </button>
                            <button
                                onClick={() => setActive("approvals")}
                                className="px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 hover:bg-slate-50 text-left"
                            >
                                Review Seller Approvals
                            </button>
                            <button className="px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 hover:bg-slate-50 text-left">
                                Update Commission Rules
                            </button>
                        </div>
                    </Card>
                </aside>

                {/* Main content with animations */}
                <main className="col-span-12 lg:col-span-9 xl:col-span-10 space-y-6 relative overflow-hidden">
                    <AnimatePresence mode="wait">
                        {/* DASHBOARD = giữ nguyên full phần cũ */}
                        {active === "dashboard" && (
                            <motion.div
                                key="dashboard"
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ duration: 0.35 }}
                                className="space-y-6"
                            >
                                {/* KPI */}
                                <div className="grid sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                                    <StatTile
                                        icon={<DollarSign size={18} className="text-slate-800" />}
                                        label="Revenue (month)"
                                        value={metrics ? currencyVND(metrics.revenueThisMonth) : "—"}
                                        hint={`YTD: ${currencyVND(revenueTotal)}`}
                                        trend={metrics?.growth ?? 0}
                                    />
                                    <StatTile
                                        icon={<Users size={18} className="text-slate-800" />}
                                        label="Total Users"
                                        value={metrics ? metrics.totalUsers.toLocaleString("vi-VN") : "—"}
                                        hint="Buyer / Seller / Staff"
                                    />
                                    <StatTile
                                        icon={<PackageSearch size={18} className="text-slate-800" />}
                                        label="Active Listings"
                                        value={metrics ? metrics.activeListings.toLocaleString("vi-VN") : "—"}
                                        hint="EV & Battery"
                                    />
                                    <StatTile
                                        icon={<TrendingUp size={18} className="text-slate-800" />}
                                        label="Growth MoM"
                                        value={metrics ? `${metrics.growth}%` : "—"}
                                        hint="vs last month"
                                        trend={metrics?.growth ?? 0}
                                    />
                                </div>

                                {/* Charts */}
                                <div className="grid lg:grid-cols-5 gap-4">
                                    <Card className="lg:col-span-3">
                                        <CardHeader title="Revenue by Month" icon={<FileChartColumn size={18} />} />
                                        <div className="p-4 h-72">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={revenueByMonth}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="month" />
                                                    <YAxis />
                                                    <Tooltip formatter={(v) => currencyVND(v)} />
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

                                {/* Distribution + Transactions */}
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
                                                                fill={["#3b82f6", "#f59e0b", "#10b981", "#ef4444"][idx % 4]} // 🎨 màu sắc
                                                            />
                                                        ))}
                                                    </Pie>
                                                    <Legend />
                                                    <Tooltip />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </Card>


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
                                                    {transactions.map((t, idx) => (
                                                        <tr key={t.paymentId || idx} className="border-b last:border-0">
                                                            <td className="py-2 font-medium text-slate-700">#{t.paymentId}</td>
                                                            <td className="py-2">{t.items?.[0]?.title || "—"}</td>
                                                            <td className="py-2">{t.buyerName}</td>
                                                            <td className="py-2">{t.sellerName}</td>
                                                            <td className="py-2">{currencyVND(t.totalAmount)}</td>
                                                            <td className="py-2 capitalize">{t.status}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </Card>
                                </div>

                                {/* Seller approvals */}
                                <Card>
                                    <CardHeader title="New Seller Approvals" icon={<UserCog size={18} />} />
                                    <div className="p-4 overflow-auto">
                                        <table className="min-w-full text-sm">
                                            <thead>
                                                <tr className="text-left text-slate-500 border-b">
                                                    <th className="py-2">ID</th>
                                                    <th className="py-2">Seller</th>
                                                    <th className="py-2">Region</th>
                                                    <th className="py-2">Submitted</th>
                                                    <th className="py-2">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {approvals.map((a, idx) => (
                                                    <tr key={a.id || `appr-${idx}`} className="border-b last:border-0">
                                                        <td className="py-2 font-medium text-slate-700">{a.id}</td>
                                                        <td className="py-2">{a.seller}</td>
                                                        <td className="py-2">{a.region}</td>
                                                        <td className="py-2">
                                                            {new Date(a.submittedAt).toLocaleDateString("vi-VN")}
                                                        </td>
                                                        <td className="py-2">
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={async () => {
                                                                        try {
                                                                            await managerAPI.approveSeller(a.id);
                                                                            alert(`✅ Seller ${a.seller} đã được duyệt`);
                                                                            setApprovals(approvals.filter((x) => x.id !== a.id));
                                                                        } catch (e) {
                                                                            alert("❌ Lỗi khi duyệt seller");
                                                                        }
                                                                    }}
                                                                    className="px-2.5 py-1 rounded-lg text-xs border border-emerald-400 text-emerald-600 hover:bg-emerald-50"
                                                                >
                                                                    Approve
                                                                </button>
                                                                <button
                                                                    onClick={async () => {
                                                                        try {
                                                                            await managerAPI.rejectSeller(a.id);
                                                                            alert(`🚫 Seller ${a.seller} đã bị từ chối`);
                                                                            setApprovals(approvals.filter((x) => x.id !== a.id));
                                                                        } catch (e) {
                                                                            alert("❌ Lỗi khi từ chối seller");
                                                                        }
                                                                    }}
                                                                    className="px-2.5 py-1 rounded-lg text-xs border border-rose-400 text-rose-600 hover:bg-rose-50"
                                                                >
                                                                    Reject
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </Card>
                            </motion.div>
                        )}

                        {/* USERS */}
                        {active === "users" && (
                            <motion.div
                                key="users"
                                initial={{ opacity: 0, x: 40 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -40 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Card>
                                    <CardHeader title="User Management" icon={<Users size={18} />} />
                                    <div className="p-4 overflow-auto">
                                        <table className="min-w-full text-sm">
                                            <thead>
                                                <tr className="text-left text-slate-500 border-b">
                                                    <th className="py-2">ID</th>
                                                    <th className="py-2">Name</th>
                                                    <th className="py-2">Email</th>
                                                    <th className="py-2">Phone</th>
                                                    <th className="py-2">Role</th>
                                                    <th className="py-2">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {users.map((u, idx) => (
                                                    <tr key={u.userId || `user-${idx}`} className="border-b last:border-0">
                                                        <td className="py-2">{u.userId}</td>
                                                        <td className="py-2">{u.fullName}</td>
                                                        <td className="py-2">{u.email}</td>
                                                        <td className="py-2">{u.phone}</td>
                                                        <td className="py-2">{u.role}</td>
                                                        <td className="py-2">{u.accountStatus}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </Card>
                            </motion.div>
                        )}

                        {/* PRODUCTS */}
                        {active === "products" && (
                            <motion.div
                                key="products"
                                initial={{ opacity: 0, x: 40 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -40 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Card>
                                    <CardHeader title="Product Management" icon={<PackageSearch size={18} />} />
                                    <div className="p-4 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {products.map((p, idx) => (
                                            <div key={p.item?.itemId || `prod-${idx}`}
                                                className="border border-slate-200 rounded-xl p-4 flex flex-col hover:shadow-md transition"
                                            >
                                                <img
                                                    src={p.item.images?.[0]?.imageUrl || "https://placehold.co/300x200?text=No+Image"}
                                                    alt={p.item.title}
                                                    className="w-full h-36 object-cover rounded-lg mb-3"
                                                />
                                                <h4 className="font-semibold text-slate-800">{p.item.title}</h4>
                                                <p className="text-sm text-slate-500 mb-1">{p.item.itemType?.toUpperCase()}</p>
                                                <p className="text-slate-700 font-medium">{currencyVND(p.item.price)}</p>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    Seller: {p.seller?.fullName || "Không xác định"}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </motion.div>
                        )}

                        {/* TRANSACTIONS */}
                        {active === "transactions" && (
                            <motion.div
                                key="transactions"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.35 }}
                            >
                                <Card>
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
                                                {transactions.map((t, idx) => (
                                                    <tr key={t.paymentId || idx} className="border-b last:border-0">
                                                        <td className="py-2 font-medium text-slate-700">#{t.paymentId}</td>
                                                        <td className="py-2">{t.items?.[0]?.title || "—"}</td>
                                                        <td className="py-2">{t.buyerName}</td>
                                                        <td className="py-2">{t.sellerName}</td>
                                                        <td className="py-2">{currencyVND(t.totalAmount)}</td>
                                                        <td className="py-2 capitalize">{t.status}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </Card>
                            </motion.div>
                        )}

                        {/* REPORTS */}
                        {active === "reports" && (
                            <motion.div
                                key="reports"
                                initial={{ opacity: 0, scale: 0.97 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.97 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Card>
                                    <CardHeader title="Reports & Analytics" icon={<BarChart3 size={18} />} />
                                    <div className="p-6 text-sm text-slate-600">
                                        Coming soon — export CSV/PDF, custom charts, cohort analysis...
                                    </div>
                                </Card>
                            </motion.div>
                        )}

                        {active === "approvals" && (
                            <motion.div
                                key="approvals"
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Card>
                                    <CardHeader title="New Seller Approvals" icon={<UserCog size={18} />} />
                                    <div className="p-4 overflow-auto">
                                        <table className="min-w-full text-sm">
                                            <thead>
                                                <tr className="text-left text-slate-500 border-b">
                                                    <th className="py-2">ID</th>
                                                    <th className="py-2">Seller</th>
                                                    <th className="py-2">Region</th>
                                                    <th className="py-2">Submitted</th>
                                                    <th className="py-2">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {approvals.map((a, idx) => (
                                                    <tr key={a.id || `appr-${idx}`} className="border-b last:border-0">
                                                        <td className="py-2 font-medium text-slate-700">{a.id}</td>
                                                        <td className="py-2">{a.seller}</td>
                                                        <td className="py-2">{a.region}</td>
                                                        <td className="py-2">
                                                            {new Date(a.submittedAt).toLocaleDateString("vi-VN")}
                                                        </td>
                                                        <td className="py-2">
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={async () => {
                                                                        try {
                                                                            await managerAPI.approveSeller(a.id);
                                                                            alert(`✅ Seller ${a.seller} đã được duyệt`);
                                                                            setApprovals(approvals.filter((x) => x.id !== a.id));
                                                                        } catch {
                                                                            alert("❌ Lỗi khi duyệt seller");
                                                                        }
                                                                    }}
                                                                    className="px-2.5 py-1 rounded-lg text-xs border border-emerald-400 text-emerald-600 hover:bg-emerald-50"
                                                                >
                                                                    Approve
                                                                </button>
                                                                <button
                                                                    onClick={async () => {
                                                                        try {
                                                                            await managerAPI.rejectSeller(a.id);
                                                                            alert(`🚫 Seller ${a.seller} đã bị từ chối`);
                                                                            setApprovals(approvals.filter((x) => x.id !== a.id));
                                                                        } catch {
                                                                            alert("❌ Lỗi khi từ chối seller");
                                                                        }
                                                                    }}
                                                                    className="px-2.5 py-1 rounded-lg text-xs border border-rose-400 text-rose-600 hover:bg-rose-50"
                                                                >
                                                                    Reject
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </Card>
                            </motion.div>
                        )}

                        {/* SETTINGS */}
                        {active === "settings" && (
                            <motion.div
                                key="settings"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Card>
                                    <CardHeader title="Settings" icon={<Settings size={18} />} />
                                    <div className="p-6 text-sm text-slate-600">
                                        Coming soon — configuration options for managers.
                                    </div>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="text-xs text-slate-500 flex items-center gap-2 py-4">
                        <span>© {new Date().getFullYear()} EV & Battery Trading — Manager Console</span>
                    </div>
                </main>
            </div>

            {/* Modal Add Staff */}
            {showAddStaffModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6 animate-fadeIn">
                        <h2 className="text-lg font-semibold text-slate-800 mb-4">Create New Staff Account</h2>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                alert(
                                    `✅ Staff account created!\nName: ${newStaff.fullName}\nEmail: ${newStaff.email}\nTasks: ${newStaff.tasks.join(", ")}`
                                );
                                setShowAddStaffModal(false);
                                setNewStaff({ fullName: "", email: "", role: "staff", tasks: [] });
                            }}
                            className="space-y-4"
                        >
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={newStaff.fullName}
                                    onChange={(e) => setNewStaff({ ...newStaff, fullName: e.target.value })}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={newStaff.email}
                                    onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">Assigned Tasks</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {[
                                        "Verify Sellers",
                                        "Monitor Auctions",
                                        "Handle Disputes",
                                        "Approve Listings",
                                        "Manage Reports",
                                        "Customer Support",
                                        "Payment Verification",
                                    ].map((task) => (
                                        <label
                                            key={task}
                                            className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 cursor-pointer hover:bg-slate-50"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={Array.isArray(newStaff.tasks) && newStaff.tasks.includes(task)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setNewStaff({ ...newStaff, tasks: [...newStaff.tasks, task] });
                                                    } else {
                                                        setNewStaff({ ...newStaff, tasks: newStaff.tasks.filter((t) => t !== task) });
                                                    }
                                                }}
                                                className="accent-blue-600 w-4 h-4"
                                            />
                                            <span className="text-sm text-slate-700">{task}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAddStaffModal(false)}
                                    className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {showLogoutConfirm && (
                <div className="logout-overlay">
                    <div className="logout-popup">
                        <h3>Đăng xuất</h3>
                        <p>Bạn có chắc muốn đăng xuất không?</p>
                        <div className="logout-actions">
                            <button className="btn-cancel" onClick={handleCancelLogout}>Hủy</button>
                            <button className="btn-confirm" onClick={handleLogoutConfirm}>Đăng xuất</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
