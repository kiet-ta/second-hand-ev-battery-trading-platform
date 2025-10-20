import React, { useState } from "react";
import {
    LayoutDashboard,
    UserCog,
    PackageSearch,
    Settings,
    LogOut,
    BarChart3,
    ShieldCheck,
    ClipboardList,
    Search,
    Filter,
    RefreshCw,
    Bell,
    ShieldAlert,
    UserPlus2,
} from "lucide-react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { IoLogOutOutline } from "react-icons/io5";

// --- Card Wrapper ---
function Card({ children, className = "" }) {
    return (
        <div className={`rounded-2xl shadow-sm border border-slate-200 bg-white ${className}`}>
            {children}
        </div>
    );
}

// --- Card Header ---
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

// --- Sidebar Menu ---
const menu = [
    { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} />, path: "/manage" },
    { key: "users", label: "User Management", icon: <UserCog size={18} />, path: "users" },
    { key: "products", label: "Product Moderation", icon: <PackageSearch size={18} />, path: "products" },
    { key: "complaints", label: "User Complaints", icon: <ShieldAlert size={18} />, path: "complaints" },
    { key: "transactions", label: "Transaction Monitor", icon: <ClipboardList size={18} />, path: "transactions" },
    { key: "notifications", label: "Notifications", icon: <Bell size={18} />, path: "notifications" },
    { key: "news", label: "News Creation", icon: <ClipboardList size={18} />, path: "news" },
    { key: "reports", label: "Reports & Analytics", icon: <BarChart3 size={18} />, path: "reports" },
    { key: "settings", label: "Settings", icon: <Settings size={18} />, path: "settings" },
];

// --- MAIN LAYOUT ---
// ✨ THAY ĐỔI: Thêm `children` vào danh sách props
export default function ManagerLayout({ onRefresh, onAddStaff, children }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const getActiveKey = () => {
        const path = location.pathname.split("/").filter(Boolean);
        const lastSegment = path[path.length - 1];
        const activeItem = menu.find((m) => m.path === lastSegment);
        if (activeItem) return activeItem.key;
        if (location.pathname === "/manage" || location.pathname === "/manage/") return "dashboard";
        if (lastSegment === "approvals") return "dashboard";
        return "dashboard";
    };

    const activeKey = getActiveKey();

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = "/login";
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* 🔹 Top Navigation Bar */}
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

                        <button
                            onClick={onRefresh}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm hover:bg-slate-50"
                        >
                            <RefreshCw size={16} />
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            {/* 🔹 Body Layout */}
            <div className="max-w-[1600px] mx-auto grid grid-cols-12 gap-6 px-6 py-6">
                {/* Sidebar */}
                <aside className="col-span-12 lg:col-span-3 xl:col-span-2">
                    <Card>
                        <div className="p-3">
                            {menu.map((m) => (
                                <button
                                    key={m.key}
                                    onClick={() => navigate(m.path)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm border mb-2 transition-all duration-300 ${activeKey === m.key
                                        ? "bg-indigo-50 border-indigo-300 text-indigo-700 shadow-sm"
                                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                                        }`}
                                >
                                    {m.icon}
                                    <span>{m.label}</span>
                                </button>
                            ))}

                            <div className="pt-2 border-t mt-2">
                                <button
                                    onClick={() => setShowLogoutConfirm(true)}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 transition"
                                >
                                    <IoLogOutOutline size={20} />
                                    <span className="font-medium">Logout</span>
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
                            {/* ✅ Add Staff */}
                            <button
                                onClick={onAddStaff}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 hover:bg-slate-50 text-left"
                            >
                                <UserPlus2 size={16} className="text-indigo-600" />
                                Add Staff Account
                            </button>

                            {/* ✅ Review Seller Approvals */}
                            <button
                                onClick={() => navigate("approvals")}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 hover:bg-slate-50 text-left"
                            >
                                <ShieldCheck size={16} className="text-emerald-600" />
                                Review Seller Approvals
                            </button>

                            {/* ✅ Update Commission */}
                            <button
                                onClick={() => navigate("settings")}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 hover:bg-slate-50 text-left"
                            >
                                <ClipboardList size={16} className="text-orange-500" />
                                Update Commission Rules
                            </button>
                        </div>
                    </Card>

                </aside>

                {/* Main Content */}
                <main className="col-span-12 lg:col-span-9 xl:col-span-10 space-y-6 relative overflow-hidden">
                    <Outlet />

                    {/* ✨ THAY ĐỔI: Render `children` (chứa các modal) tại đây */}
                    {children}

                    <div className="text-xs text-slate-500 flex items-center gap-2 py-4">
                        <span>© {new Date().getFullYear()} EV & Battery Trading — Manager Console</span>
                    </div>
                </main>
            </div>
            {showLogoutConfirm && (
                <div className="logout-overlay">
                    <div className="logout-popup">
                        <h3>Đăng xuất</h3>
                        <p>Bạn có chắc muốn đăng xuất không?</p>
                        <div className="logout-actions">
                            <button className="btn-cancel" onClick={() => setShowLogoutConfirm(false)}>Hủy</button>
                            <button className="btn-confirm" onClick={handleLogout}>Đăng xuất</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}