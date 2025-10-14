import React, { useEffect, useState, useMemo } from "react";
import {
    LayoutDashboard,
    Users,
    UserCog,
    PackageSearch,
    Percent,
    Settings,
    LogOut,
    AlertTriangle,
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
import { fakeManagerAPI } from "../hooks/managerApi";

function currencyVND(x) {
    try {
        return x.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
    } catch {
        return `${x}`;
    }
}

function Card({ children, className = "" }) {
    return (
        <div
            className={`rounded-2xl shadow-sm border border-slate-200 bg-white ${className}`}
        >
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
        <div className="flex items-center gap-4 p-5 rounded-2xl border border-slate-200 bg-white">
            <div className="p-3 rounded-xl border border-slate-200">{icon}</div>
            <div className="flex-1">
                <p className="text-sm text-slate-500">{label}</p>
                <p className="text-xl font-semibold text-slate-800 mt-0.5">{value}</p>
                {hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
            </div>
            {typeof trend === "number" && (
                <div
                    className={`text-sm font-medium ${trend >= 0 ? "text-emerald-600" : "text-rose-600"
                        }`}
                >
                    {trend >= 0 ? "+" : ""}
                    {trend}%
                </div>
            )}
        </div>
    );
}

export default function ManagerDashboard() {
    const [metrics, setMetrics] = useState(null);
    const [revenueByMonth, setRevenueByMonth] = useState([]);
    const [ordersByMonth, setOrdersByMonth] = useState([]);
    const [distribution, setDistribution] = useState([]);
    const [approvals, setApprovals] = useState([]);
    const [disputes, setDisputes] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [range, setRange] = useState("12m");
    const [active, setActive] = useState("dashboard");
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);

    const menu = [
        { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
        { key: "users", label: "User Management", icon: <UserCog size={18} /> },
        { key: "products", label: "Product Management", icon: <PackageSearch size={18} /> },
        { key: "transactions", label: "Transaction Monitor", icon: <ClipboardList size={18} /> },
        { key: "commission", label: "Commission Setup", icon: <Percent size={18} /> },
        { key: "reports", label: "Reports & Analytics", icon: <BarChart3 size={18} /> },
        { key: "settings", label: "Settings", icon: <Settings size={18} /> },
    ];

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const [
                    metrics,
                    revenue,
                    orders,
                    dist,
                    approvals,
                    disputes,
                    transactions,
                ] = await Promise.all([
                    fakeManagerAPI.getMetrics(),
                    fakeManagerAPI.getRevenueByMonth(),
                    fakeManagerAPI.getOrdersByMonth(),
                    fakeManagerAPI.getProductDistribution(),
                    fakeManagerAPI.getSellerApprovals(),
                    fakeManagerAPI.getDisputes(),
                    fakeManagerAPI.getTransactions(),
                ]);

                setMetrics(metrics);
                setRevenueByMonth(revenue);
                setOrdersByMonth(orders);
                setDistribution(dist);
                setApprovals(approvals);
                setDisputes(disputes);
                setTransactions(transactions);
            } catch (err) {
                console.error("Fake API error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, []);

    useEffect(() => {
        const fetchUsers = async () => {
            const list = await fakeManagerAPI.getUsers();
            setUsers(list);
        };
        fetchUsers();
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            const list = await fakeManagerAPI.getProducts();
            setProducts(list);
        };
        fetchProducts();
    }, []);

    const revenueTotal = useMemo(() => {
        return revenueByMonth.reduce((acc, x) => acc + (x.total || 0), 0);
    }, [revenueByMonth]);

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Top Bar */}
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl border border-slate-200 grid place-items-center">
                            <ShieldCheck size={18} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 leading-tight">
                                EV & Battery Trading Platform
                            </p>
                            <h1 className="text-lg font-semibold text-slate-800 -mt-0.5">
                                Manager Console
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="hidden md:flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-xl bg-white">
                            <Search size={16} className="opacity-70" />
                            <input
                                placeholder="Search…"
                                className="outline-none text-sm w-44"
                            />
                            <Filter size={16} className="opacity-70" />
                        </div>
                        <button className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm flex items-center gap-2">
                            <RefreshCw size={16} /> Refresh
                        </button>
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6 px-4 py-6">
                {/* Sidebar */}
                <aside className="col-span-12 lg:col-span-3 xl:col-span-2">
                    <Card>
                        <div className="p-3">
                            {menu.map((m) => (
                                <button
                                    key={m.key}
                                    onClick={() => setActive(m.key)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm border ${active === m.key
                                        ? "bg-slate-900 text-white border-slate-900"
                                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                                        } mb-2 transition`}
                                >
                                    {m.icon}
                                    {m.label}
                                </button>
                            ))}

                            <div className="pt-2 border-t mt-2">
                                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm border bg-white text-slate-700 border-slate-200 hover:bg-slate-50">
                                    <LogOut size={18} /> Logout
                                </button>
                            </div>
                        </div>
                    </Card>

                    <Card className="mt-6">
                        <CardHeader
                            title="Quick Actions"
                            icon={<Settings size={18} className="text-slate-700" />}
                        />
                        <div className="p-4 grid grid-cols-1 gap-2">
                            <button className="px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 hover:bg-slate-50 text-left">
                                + Add Staff Account
                            </button>
                            <button className="px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 hover:bg-slate-50 text-left">
                                Review Seller Approvals
                            </button>
                            <button className="px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 hover:bg-slate-50 text-left">
                                Update Commission Rules
                            </button>
                        </div>
                    </Card>
                </aside>

                {/* Main */}
                <main className="col-span-12 lg:col-span-9 xl:col-span-10 space-y-6">

                    {active === "dashboard" && (
                        <>
                            {/* phần dashboard hiện có (KPI, charts, etc.) */}
                        </>
                    )}

                    {active === "users" && (
                        <Card>
                            <CardHeader
                                title="User Management"
                                icon={<UserCog size={18} className="text-slate-700" />}
                                action={
                                    <button className="px-3 py-2 text-sm border border-slate-200 rounded-xl hover:bg-slate-50">
                                        + Add User
                                    </button>
                                }
                            />
                            <div className="p-4">
                                <table className="min-w-full text-sm">
                                    <thead>
                                        <tr className="text-left text-slate-500 border-b">
                                            <th className="py-2">ID</th>
                                            <th className="py-2">Name</th>
                                            <th className="py-2">Email</th>
                                            <th className="py-2">Role</th>
                                            <th className="py-2">Status</th>
                                            <th className="py-2">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((u) => (
                                            <tr key={u.id} className="border-b last:border-0">
                                                <td className="py-2 font-medium text-slate-700">{u.id}</td>
                                                <td className="py-2">{u.name}</td>
                                                <td className="py-2">{u.email}</td>
                                                <td className="py-2">
                                                    <span
                                                        className={`px-2.5 py-1 rounded-lg text-xs border ${u.role === "Staff"
                                                            ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                                                            : u.role === "Seller"
                                                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                                                : "bg-sky-50 text-sky-700 border-sky-200"
                                                            }`}
                                                    >
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="py-2">
                                                    <span
                                                        className={`px-2.5 py-1 rounded-lg text-xs border ${u.status === "active"
                                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                            : "bg-rose-50 text-rose-700 border-rose-200"
                                                            }`}
                                                    >
                                                        {u.status}
                                                    </span>
                                                </td>
                                                <td className="py-2">
                                                    <div className="flex gap-2">
                                                        <button className="px-2.5 py-1 rounded-lg text-xs border border-slate-200">
                                                            Edit
                                                        </button>
                                                        <button className="px-2.5 py-1 rounded-lg text-xs border border-slate-200">
                                                            {u.status === "active" ? "Deactivate" : "Activate"}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}

                    {active === "products" && (
                        <Card>
                            <CardHeader
                                title="Product Management"
                                icon={<PackageSearch size={18} className="text-slate-700" />}
                                action={
                                    <button className="px-3 py-2 text-sm border border-slate-200 rounded-xl hover:bg-slate-50">
                                        + Add Product
                                    </button>
                                }
                            />
                            <div className="p-4 overflow-auto">
                                <table className="min-w-full text-sm">
                                    <thead>
                                        <tr className="text-left text-slate-500 border-b">
                                            <th className="py-2">ID</th>
                                            <th className="py-2">Image</th>
                                            <th className="py-2">Title</th>
                                            <th className="py-2">Type</th>
                                            <th className="py-2">Seller</th>
                                            <th className="py-2">Price</th>
                                            <th className="py-2">Status</th>
                                            <th className="py-2">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.map((p) => (
                                            <tr key={p.id} className="border-b last:border-0 hover:bg-slate-50">
                                                <td className="py-2 font-medium text-slate-700">{p.id}</td>
                                                <td className="py-2">
                                                    <img
                                                        src={p.image}
                                                        alt={p.title}
                                                        className="w-14 h-14 object-cover rounded-lg border border-slate-200"
                                                    />
                                                </td>
                                                <td className="py-2">{p.title}</td>
                                                <td className="py-2">
                                                    <span
                                                        className={`px-2.5 py-1 rounded-lg text-xs border ${p.type === "EV"
                                                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                                                : "bg-teal-50 text-teal-700 border-teal-200"
                                                            }`}
                                                    >
                                                        {p.type}
                                                    </span>
                                                </td>
                                                <td className="py-2">{p.seller}</td>
                                                <td className="py-2">{currencyVND(p.price)}</td>
                                                <td className="py-2">
                                                    <span
                                                        className={`px-2.5 py-1 rounded-lg text-xs border ${p.status === "active"
                                                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                                : p.status === "sold"
                                                                    ? "bg-amber-50 text-amber-700 border-amber-200"
                                                                    : "bg-rose-50 text-rose-700 border-rose-200"
                                                            }`}
                                                    >
                                                        {p.status}
                                                    </span>
                                                </td>
                                                <td className="py-2">
                                                    <div className="flex gap-2">
                                                        <button className="px-2.5 py-1 rounded-lg text-xs border border-slate-200">
                                                            Edit
                                                        </button>
                                                        <button className="px-2.5 py-1 rounded-lg text-xs border border-slate-200">
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}

                    {/* KPI Row */}
                    <div className="grid sm:grid-cols-2 xl:grid-cols-5 gap-4">
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
                            icon={<AlertTriangle size={18} className="text-slate-800" />}
                            label="Complaint Rate"
                            value={metrics ? `${metrics.complaintRate}%` : "—"}
                            hint="Open disputes"
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
                            <CardHeader
                                title="Revenue by Month"
                                icon={<FileChartColumn size={18} className="text-slate-700" />}
                                action={
                                    <select
                                        value={range}
                                        onChange={(e) => setRange(e.target.value)}
                                        className="text-sm border border-slate-200 rounded-lg px-2 py-1"
                                    >
                                        <option value="6m">Last 6 months</option>
                                        <option value="12m">Last 12 months</option>
                                        <option value="24m">Last 24 months</option>
                                    </select>
                                }
                            />
                            <div className="p-4 h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={revenueByMonth}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                        <YAxis tick={{ fontSize: 12 }} />
                                        <Tooltip formatter={(v) => currencyVND(v)} />
                                        <Line
                                            type="monotone"
                                            dataKey="total"
                                            strokeWidth={2}
                                            dot={false}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>

                        <Card className="lg:col-span-2">
                            <CardHeader
                                title="Orders by Month"
                                icon={<BarChart3 size={18} className="text-slate-700" />}
                            />
                            <div className="p-4 h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={ordersByMonth}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                        <YAxis tick={{ fontSize: 12 }} />
                                        <Tooltip />
                                        <Bar dataKey="totalOrders" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </div>

                    {/* Product Distribution & Transactions */}
                    <div className="grid lg:grid-cols-5 gap-4">
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
                                        >
                                            {distribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} />
                                            ))}
                                        </Pie>
                                        <Legend />
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>

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
                                        {transactions.map((t) => (
                                            <tr key={t.id} className="border-b last:border-0">
                                                <td className="py-2 font-medium text-slate-700">
                                                    {t.id}
                                                </td>
                                                <td className="py-2">{t.item}</td>
                                                <td className="py-2">{t.buyer}</td>
                                                <td className="py-2">{t.seller}</td>
                                                <td className="py-2">{currencyVND(t.price)}</td>
                                                <td className="py-2">
                                                    <span
                                                        className={`px-2.5 py-1 rounded-lg text-xs border ${t.status === "completed"
                                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                            : t.status === "processing"
                                                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                                                : "bg-rose-50 text-rose-700 border-rose-200"
                                                            }`}
                                                    >
                                                        {t.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>

                    {/* Approvals & Disputes */}
                    <div className="grid lg:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader
                                title="New Seller Approvals"
                                icon={<UserCog size={18} className="text-slate-700" />}
                            />
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
                                        {approvals.map((a) => (
                                            <tr key={a.id} className="border-b last:border-0">
                                                <td className="py-2 font-medium text-slate-700">
                                                    {a.id}
                                                </td>
                                                <td className="py-2">{a.seller}</td>
                                                <td className="py-2">{a.region}</td>
                                                <td className="py-2">{a.submittedAt}</td>
                                                <td className="py-2">
                                                    <div className="flex gap-2">
                                                        <button className="px-2.5 py-1 rounded-lg text-xs border border-slate-200">
                                                            Approve
                                                        </button>
                                                        <button className="px-2.5 py-1 rounded-lg text-xs border border-slate-200">
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

                        <Card>
                            <CardHeader
                                title="Pending Disputes"
                                icon={<AlertTriangle size={18} className="text-slate-700" />}
                            />
                            <div className="p-4 overflow-auto">
                                <table className="min-w-full text-sm">
                                    <thead>
                                        <tr className="text-left text-slate-500 border-b">
                                            <th className="py-2">ID</th>
                                            <th className="py-2">Order</th>
                                            <th className="py-2">Type</th>
                                            <th className="py-2">Status</th>
                                            <th className="py-2">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {disputes.map((d) => (
                                            <tr key={d.id} className="border-b last:border-0">
                                                <td className="py-2 font-medium text-slate-700">
                                                    {d.id}
                                                </td>
                                                <td className="py-2">{d.orderCode}</td>
                                                <td className="py-2">{d.type}</td>
                                                <td className="py-2">
                                                    <span className="px-2.5 py-1 rounded-lg text-xs border border-amber-200 bg-amber-50 text-amber-700">
                                                        {d.status}
                                                    </span>
                                                </td>
                                                <td className="py-2">
                                                    <button className="px-2.5 py-1 rounded-lg text-xs border border-slate-200">
                                                        Open
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>

                    {/* Footer */}
                    <div className="text-xs text-slate-500 flex items-center gap-2 py-4">
                        <span>
                            © {new Date().getFullYear()} EV & Battery Trading — Manager Console
                        </span>
                    </div>
                </main>
            </div>
        </div>
    );
}
