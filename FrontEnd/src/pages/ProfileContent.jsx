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

const ProfileContent = () => {
    const [activeSection, setActiveSection] = useState("profile");
    const [activeCard, setActiveCard] = useState("account");
    const [searchQuery, setSearchQuery] = useState("");
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false); // ✅ trạng thái popup
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

    // ✅ Hàm xử lý logout
    const handleLogoutConfirm = () => {
        localStorage.clear();
        window.location.href = "/login"; // hoặc navigate("/login") nếu bạn dùng react-router
    };

    // ✅ Hủy logout
    const handleCancelLogout = () => {
        setShowLogoutConfirm(false);
    };

    const menuItems = [
        { id: "profile", label: "Profile", icon: <FaRegUser /> },
        { id: "purchase", label: "My Purchase", icon: <LuClipboardList /> },
        { id: "settings", label: "Settings", icon: <IoSettingsOutline /> },
    ];

    const settingsCards = [
        { id: "account", title: "Account Setting", description: "Details about your Personal information" },
        { id: "notification", title: "Notification", description: "Details about your Personal information" },
        { id: "address", title: "Address", description: "Details about your Address" },
        { id: "security", title: "Password & Security", description: "Details about your Personal information" },
    ];

    return (
        <div className="profile-layout">
            {/* Sidebar */}
            <div className="sidebar">
                <div className="bg-maincolor">
                    <Logo/>
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
            <div className="main-content">
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

                    <div className="header-actions">
                        <button className="notification-btn"><IoMdNotificationsOutline /></button>
                        <button className="cart-btn">
                            <IoCartOutline /><span className="cart-badge">0</span>
                        </button>
                        <button className="logout-btn" onClick={() => setShowLogoutConfirm(true)}>
                            <MdLogout />
                        </button>
                    </div>
                </header>

                {/* Profile Content */}
                <div className="profile-content">
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
                                {activeCard === "security" && (
                                    <div className="coming-soon">
                                        <h2>Password & Security</h2>
                                        <p>Coming soon...</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {activeSection === "purchase" && (
                        <div className="profile-main" style={{ gridColumn: "1 / -1" }}>
                            <HistoryBought />
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
