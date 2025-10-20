import { useState, useEffect } from "react";
import SettingsCard from "../components/SettingCard";
import ProfileForm from "../components/ProfileForm";
import AddressManagement from "../pages/AddressManagement";
import HistoryBought from "../components/HistoryBought";
import "../assets/styles/ProfileContent.css";
import anhtao from "../assets/images/Logo.png";
import { FaRegUser } from "react-icons/fa";
import { LuClipboardList } from "react-icons/lu";
import { IoSettingsOutline } from "react-icons/io5";
import { IoMdSearch } from "react-icons/io";
import { IoMdNotificationsOutline } from "react-icons/io";
import { IoCartOutline } from "react-icons/io5";
import { MdLogout } from "react-icons/md";
import Logo from "../components/Logo";
import { useNavigate } from "react-router-dom";
import NotificationDropdown from "../components/NotificationDropdown";
import ChangePassword from "../components/ChangePassword";


const ProfileContent = () => {
    const [activeSection, setActiveSection] = useState("profile");
    const [activeCard, setActiveCard] = useState("account");
    const [searchQuery, setSearchQuery] = useState("");
    const [isDarkMode, setIsDarkMode] = useState(false);
    const navigate = useNavigate();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [currentUser, setCurrentUser] = useState({
        fullName: localStorage.getItem("userName") || "Guest",
        avatarProfile: localStorage.getItem("userAvatar") || anhtao
    });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userId = localStorage.getItem("userId");
                if (!userId) return;
                const response = await fetch(`https://localhost:7272/api/User/${userId}`);
                const data = await response.json();
                setCurrentUser(data);
            } catch (error) {
                console.error("Error fetching user:", error);
            }
        };
        fetchUser();
    }, []);

    // 🌙 Dark Mode toggle + hiệu ứng mượt
    useEffect(() => {
        document.body.classList.add("theme-transition");
        document.body.classList.toggle("dark-mode", isDarkMode);
        const timer = setTimeout(() => {
            document.body.classList.remove("theme-transition");
        }, 600);
        return () => clearTimeout(timer);
    }, [isDarkMode]);

    // ✅ Đăng xuất
    const handleLogoutConfirm = () => {
        localStorage.clear();
        window.location.href = "/login";
    };

    const handleCancelLogout = () => {
        setShowLogoutConfirm(false);
    };

    // ✅ Xóa tài khoản
    const handleDeleteAccount = async () => {
        const userId = localStorage.getItem("userId");
        if (!userId) return alert("User not found.");

        if (!window.confirm("⚠️ Bạn có chắc muốn xóa tài khoản này? Hành động này không thể hoàn tác!"))
            return;

        try {
            const res = await fetch(`https://localhost:7272/api/User/${userId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            });

            if (!res.ok) throw new Error("Không thể xóa tài khoản");

            alert("✅ Tài khoản của bạn đã được xóa!");
            localStorage.clear();
            window.location.href = "/register";
        } catch (error) {
            console.error("Lỗi khi xóa tài khoản:", error);
            alert("❌ Đã xảy ra lỗi, vui lòng thử lại.");
        }
    };

    const menuItems = [
        { id: "profile", label: "Profile", icon: <FaRegUser /> },
        { id: "purchase", label: "My Purchase", icon: <LuClipboardList /> },
        { id: "settings", label: "Settings", icon: <IoSettingsOutline /> },
    ];

    const settingsCards = [
        { id: "account", title: "Account Setting", description: "Details about your Personal information" },
        { id: "notification", title: "Notification", description: "Manage alerts & updates" },
        { id: "address", title: "Address", description: "Manage your delivery address" },
        { id: "security", title: "Password & Security", description: "Change password or delete your account" },
    ];

    return (
        <div className="profile-layout">
            {/* Sidebar */}
            <div className="sidebar">
                <div
                    className="sidebar-header cursor-pointer flex items-center gap-2"
                    onClick={() => navigate("/")}
                >
                    <img src={Logo} alt="Logo" className="logo" />
                    <h1 className="logo">Cóc Mua Xe</h1>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            className={`nav-item ${activeSection === item.id ? "active" : ""}`}
                            onClick={() => setActiveSection(item.id)}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-label">{item.label}</span>
                        </button>
                    ))}
                </nav>
            </div>

            {/* Main Content */}
            <div className="main-content h-screen overflow-y-auto">
                {/* Header */}
                <header className="header">
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Search Anything"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                        <button className="search-button"><IoMdSearch /></button>
                    </div>


                    <div className="header-actions flex items-center gap-5">
                        <div className="relative">
                            <NotificationDropdown userId={localStorage.getItem("userId")} />
                        </div>

                        <div className="relative">
                            <button className="relative text-gray-700 hover:text-blue-600 transition">
                                <IoCartOutline size={24} />
                                <span className="absolute -top-1.5 -right-2 bg-blue-500 text-white text-xs rounded-full px-1.5">
                                    0
                                </span>
                            </button>
                        </div>

                        <button
                            className="text-gray-700 hover:text-red-500 transition"
                            onClick={() => setShowLogoutConfirm(true)}
                        >
                            <MdLogout size={22} />
                        </button>
                    </div>

                </header>

                {/* Profile Content */}
                <div className="profile-content">
                    {/* ---- Profile ---- */}
                    {activeSection === "profile" && (
                        <>
                            <div className="settings-sidebar">
                                {settingsCards.map((card) => (
                                    <SettingsCard
                                        key={card.id}
                                        {...card}
                                        isActive={activeCard === card.id}
                                        onClick={() => setActiveCard(card.id)}
                                    />
                                ))}
                            </div>

                            <div className="profile-main">
                                {activeCard === "account" && <ProfileForm />}
                                {activeCard === "address" && <AddressManagement />}
                                {activeCard === "notification" && (
                                    <div className="coming-soon">
                                        <h2>Notification Settings</h2>
                                        <p>Coming soon...</p>
                                    </div>
                                )}
                                {activeCard === "security" && <ChangePassword />}
                            </div>
                        </>
                    )}

                    {/* ---- Purchase ---- */}
                    {activeSection === "purchase" && (
                        <div className="profile-main">
                            <HistoryBought />
                        </div>
                    )}

                    {/* ---- Settings ---- */}
                    {activeSection === "settings" && (
                        <div className="settings-page">
                            <h2>⚙️ Settings</h2>

                            <div className="setting-item">
                                <span>🌙 Dark Mode</span>
                                <label className="switch">
                                    <input
                                        type="checkbox"
                                        checked={isDarkMode}
                                        onChange={() => setIsDarkMode(!isDarkMode)}
                                    />
                                    <span className="slider round"></span>
                                </label>
                            </div>

                            <hr style={{ margin: "20px 0", opacity: 0.3 }} />

                            <div className="setting-item">
                                <span>❌ Delete Account</span>
                                <button
                                    className="delete-account-btn"
                                    onClick={handleDeleteAccount}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

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
};

export default ProfileContent;
