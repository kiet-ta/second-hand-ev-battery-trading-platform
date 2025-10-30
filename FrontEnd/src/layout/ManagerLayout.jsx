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
        <div
            className={`rounded-2xl shadow-sm border border-slate-200 bg-white ${className}`}
        >
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
    { key: "dashboard", label: "Bảng điều khiển", icon: <LayoutDashboard size={18} />, path: "/manage" },
    { key: "users", label: "Quản lý người dùng", icon: <UserCog size={18} />, path: "users" },
    { key: "products", label: "Duyệt sản phẩm", icon: <PackageSearch size={18} />, path: "products" },
    { key: "complaints", label: "Khiếu nại người dùng", icon: <ShieldAlert size={18} />, path: "complaints" },
    { key: "transactions", label: "Giám sát giao dịch", icon: <ClipboardList size={18} />, path: "transactions" },
    { key: "notifications", label: "Thông báo", icon: <Bell size={18} />, path: "notifications" },
    { key: "news", label: "Tạo tin tức", icon: <ClipboardList size={18} />, path: "news" },
    { key: "reports", label: "Báo cáo & Phân tích", icon: <BarChart3 size={18} />, path: "reports" },
    { key: "settings", label: "Cài đặt", icon: <Settings size={18} />, path: "settings" },
];

// --- MAIN LAYOUT ---
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
        // Giữ lại thông tin remember
        const rememberEmail = localStorage.getItem("rememberEmail");
        const rememberPassword = localStorage.getItem("rememberPassword");

        localStorage.clear(); // Xoá mọi thứ
        // Ghi lại thông tin remember
        if (rememberEmail && rememberPassword) {
            localStorage.setItem("rememberEmail", rememberEmail);
            localStorage.setItem("rememberPassword", rememberPassword);
        }

        navigate("/login");
    };


    return (
        <div className="min-h-screen bg-slate-50">
            {/* Thanh điều hướng trên cùng */}
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-200">
                <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl border border-slate-200 grid place-items-center">
                            <ShieldCheck size={18} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 leading-tight">
                                Cóc Mua Xe - Nền tảng giao dịch Xe điện & Pin
                            </p>
                            <h1 className="text-lg font-semibold text-slate-800 -mt-0.5">
                                Quản lý
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="hidden md:flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-xl bg-white">
                            <Search size={16} className="opacity-70" />
                            <input
                                placeholder="Tìm kiếm…"
                                className="outline-none text-sm w-44"
                            />
                            <Filter size={16} className="opacity-70" />
                        </div>

                        <button
                            onClick={onRefresh}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm hover:bg-slate-50"
                        >
                            <RefreshCw size={16} />
                            Làm mới
                        </button>
                    </div>
                </div>
            </div>

            {/* Bố cục chính */}
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
                                    <span className="font-medium text-red-600">Đăng xuất</span>
                                </button>
                            </div>
                        </div>
                    </Card>

                    <Card className="mt-6">
                        <CardHeader
                            title="Tác vụ nhanh"
                            icon={<Settings size={18} className="text-slate-700" />}
                        />
                        <div className="p-4 grid grid-cols-1 gap-2">
                            {/* Thêm tài khoản nhân viên */}
                            <button
                                onClick={onAddStaff}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 hover:bg-slate-50 text-left"
                            >
                                <UserPlus2 size={16} className="text-indigo-600" />
                                Thêm tài khoản nhân viên
                            </button>

                            {/* Duyệt người bán */}
                            <button
                                onClick={() => navigate("approvals")}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 hover:bg-slate-50 text-left"
                            >
                                <ShieldCheck size={16} className="text-emerald-600" />
                                Duyệt người bán
                            </button>

                            {/* Cập nhật quy định hoa hồng */}
                            <button
                                onClick={() => navigate("fee")}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 hover:bg-slate-50 text-left"
                            >
                                <ClipboardList size={16} className="text-orange-500" />
                                Cập nhật quy định hoa hồng
                            </button>

                        </div>
                    </Card>
                </aside>

                {/* Nội dung chính */}
                <main className="col-span-12 lg:col-span-9 xl:col-span-10 space-y-6 relative overflow-hidden">
                    <Outlet />

                    {/* Nơi hiển thị children (modal hoặc popup) */}
                    {children}

                    <div className="text-xs text-slate-500 flex items-center gap-2 py-4">
                        <span>
                            © {new Date().getFullYear()} Cóc Mua Xe.
                        </span>
                    </div>
                </main>
            </div>

            {/* Xác nhận đăng xuất */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 shadow-lg text-center max-w-sm w-full">
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">Đăng xuất</h3>
                        <p className="text-slate-600 mb-4">Bạn có chắc muốn đăng xuất không?</p>
                        <div className="flex justify-center gap-3">
                            <button
                                className="px-4 py-2 text-sm rounded-md border border-slate-300 hover:bg-slate-100"
                                onClick={() => setShowLogoutConfirm(false)}
                            >
                                Hủy
                            </button>
                            <button
                                className="px-4 py-2 text-sm rounded-md bg-red-500 text-white hover:bg-red-600"
                                onClick={handleLogout}
                            >
                                Đăng xuất
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
