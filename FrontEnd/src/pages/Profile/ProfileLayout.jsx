import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { FaRegUser } from "react-icons/fa";
import { LuClipboardList } from "react-icons/lu";
import { IoSettingsOutline } from "react-icons/io5";
import { IoCartOutline, IoChatboxOutline } from "react-icons/io5";
import { IoLogOutOutline } from "react-icons/io5";
import { MdLogout } from "react-icons/md";
import NotificationDropdown from "../../components/DropDowns/NotificationDropdown";
import Logo from "../../components/Logo";
import "../../assets/styles/ProfileLayout.css";

export default function ProfileLayout() {
    const navigate = useNavigate();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const menuItems = [
        { to: "/profile", label: "Profile", icon: <FaRegUser /> },
        { to: "/profile/purchase", label: "My Purchase", icon: <LuClipboardList /> },
        { to: "/profile/chats", label: "Chat", icon: <IoChatboxOutline /> },
        { to: "/profile/settings", label: "Settings", icon: <IoSettingsOutline /> },
    ];

    const handleLogoutConfirm = () => {
        localStorage.clear();
        window.location.href = "/login";
    };

    const handleCancelLogout = () => {
        setShowLogoutConfirm(false);
    };

    return (
        <div className="profile-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div
                    className="sidebar-header cursor-pointer flex items-center gap-2"
                    onClick={() => navigate("/")}
                >
                    <img src={Logo} alt="Logo" className="logo" />
                    <h1 className="logo">Cóc Mua Xe</h1>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end
                            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-label">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <button
                    onClick={() => setShowLogoutConfirm(true)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 transition"
                >
                    <IoLogOutOutline size={20} />
                    <span className="font-medium">Logout</span>
                </button>


            </aside>

            {/* Header + nội dung */}
            <main className="main-content h-screen overflow-y-auto">
                <header className="header">
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Search Anything"
                            className="search-input"
                        />
                        <button className="search-button">🔍</button>
                    </div>

                    <div className="header-actions flex items-center gap-5">
                        <NotificationDropdown userId={localStorage.getItem("userId")} />

                        <div className="relative">
                            <button className="relative text-gray-700 hover:text-blue-600 transition">
                                <IoCartOutline size={24} />
                                <span className="absolute -top-1.5 -right-2 bg-blue-500 text-white text-xs rounded-full px-1.5">
                                    0
                                </span>
                            </button>
                        </div>
                    </div>
                </header>

                <Outlet />
            </main>

            {/* ✅ Popup xác nhận logout */}
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
