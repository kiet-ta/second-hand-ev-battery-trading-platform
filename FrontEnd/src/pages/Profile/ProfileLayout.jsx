import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { FaRegUser } from "react-icons/fa";
import { LuClipboardList } from "react-icons/lu";
import { IoSettingsOutline, IoCartOutline, IoChatboxOutline, IoLogOutOutline } from "react-icons/io5";
import NotificationDropdown from "../../components/DropDowns/NotificationDropdown";
import Logo from "../../components/Logo";
import "../../assets/styles/ProfileLayout.css";
import CartIcon from "../../components/DropDowns/CartIcon";



export default function ProfileLayout() {
    const navigate = useNavigate();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const menuItems = [
        { to: "/profile", label: "Hồ sơ cá nhân", icon: <FaRegUser /> },
        { to: "/profile/purchase", label: "Đơn hàng của tôi", icon: <LuClipboardList /> },
        { to: "/profile/chats", label: "Trò chuyện", icon: <IoChatboxOutline /> },
        { to: "/profile/settings", label: "Cài đặt", icon: <IoSettingsOutline /> },
    ];

    const handleLogoutConfirm = () => {
        const rememberEmail = localStorage.getItem("rememberEmail");
        const rememberPassword = localStorage.getItem("rememberPassword");

        localStorage.clear(); 
        if (rememberEmail && rememberPassword) {
            localStorage.setItem("rememberEmail", rememberEmail);
            localStorage.setItem("rememberPassword", rememberPassword);
        }

        navigate("/login");
    };

    const handleCancelLogout = () => {
        setShowLogoutConfirm(false);
    };

    return (
        <div className="profile-layout">
            {/* Sidebar trái */}
            <aside className="sidebar">
                <div
                    className="sidebar-header cursor-pointer flex items-center gap-2"
                    onClick={() => navigate("/")}
                >
                    <Logo />
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
                    <span className="font-medium text-red-600">Đăng xuất</span>
                </button>
            </aside>

            {/* Khu vực nội dung chính */}
            <main className="main-content h-screen overflow-y-auto">
                <header className="header">
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Tìm kiếm mọi thứ..."
                            className="search-input"
                        />
                        <button className="search-button">🔍</button>
                    </div>

                    <div className="header-actions flex items-center gap-5">
                        {/* Thông báo */}
                        <NotificationDropdown userId={localStorage.getItem("userId")} />

                        <CartIcon />
                    </div>
                </header>

                {/* Nội dung các trang con */}
                <Outlet />
            </main>

            {/* Popup xác nhận đăng xuất */}
            {showLogoutConfirm && (
                <div className="logout-overlay">
                    <div className="logout-popup">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Đăng xuất</h3>
                        <p className="text-gray-600 mb-4">Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?</p>
                        <div className="logout-actions">
                            <button
                                className="btn-cancel bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-4 py-2 rounded-lg"
                                onClick={handleCancelLogout}
                            >
                                Hủy
                            </button>
                            <button
                                className="btn-confirm bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-lg"
                                onClick={handleLogoutConfirm}
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
