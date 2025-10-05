import { useState, useEffect } from "react";
import SettingsCard from "../components/SettingCard";
import ProfileForm from "../components/ProfileForm";
import AddressManagement from "../pages/AddressManagement";
import HistoryBought from "../components/HistoryBought";
import "../assets/styles/ProfileContent.css";
import anhtao from "../assets/images/anhtao.png";
import Logo from "../assets/images/Logo.png";

const ProfileContent = () => {
    const [activeSection, setActiveSection] = useState("profile");
    const [activeCard, setActiveCard] = useState("account");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentUser, setCurrentUser] = useState({
        fullName: localStorage.getItem("userName") || "Guest",
        avatarProfile: localStorage.getItem("userAvatar") || anhtao
    });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userId = localStorage.getItem("userId");
                if (!userId) return;

                const response = await fetch(`https://localhost:7272/api/Users/${userId}`);
                const data = await response.json();
                setCurrentUser(data);
            } catch (error) {
                console.error("Error fetching user:", error);
            }
        };

        fetchUser();
    }, []);


    const menuItems = [
        { id: "profile", label: "Profile", icon: "👤" },
        { id: "purchase", label: "My Purchase", icon: "🛍️" },
        { id: "settings", label: "Settings", icon: "⚙️" },
    ];

    const settingsCards = [
        {
            id: "account",
            title: "Account Setting",
            description: "Details about your Personal information",
        },
        {
            id: "notification",
            title: "Notification",
            description: "Details about your Personal information",
        },
        { id: "address", title: "Address", description: "Details about your Address" },
        {
            id: "security",
            title: "Password & Security",
            description: "Details about your Personal information",
        },
    ];

    return (
        <div className="profile-layout">
            {/* Sidebar */}
            <div className="sidebar">
                <div className="sidebar-header">
                    <img src={Logo} alt="Logo" className="logo" />
                    <h1 className="logo">Coc Mua Xe</h1>
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
                        <button className="search-button">🔍</button>
                    </div>

                    <div className="header-actions">
                        <button className="notification-btn">🔔</button>
                        <button className="cart-btn">
                            🛒<span className="cart-badge">0</span>
                        </button>
                        <div className="user-profile">
                            <img src={currentUser.avatarProfile} alt="Profile" className="user-avatar" />
                            <span className="user-name">{currentUser.fullName}</span>
                            <button className="menu-btn">⋯</button>
                        </div>

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

                    {/* ✅ My Purchase */}
                    {activeSection === "purchase" && (
                        <div className="profile-main" style={{ gridColumn: "1 / -1" }}>
                            <HistoryBought />
                        </div>
                    )}

                    {/* Các section khác */}
                    {activeSection !== "profile" &&
                        activeSection !== "purchase" &&
                        activeSection !== "settings" && (
                            <div className="profile-main" style={{ gridColumn: "1 / -1" }}>
                                <div className="coming-soon">
                                    <h2>{menuItems.find((item) => item.id === activeSection)?.label}</h2>
                                    <p>Coming soon...</p>
                                </div>
                            </div>
                        )}
                </div>
            </div>
        </div>
    );
};

export default ProfileContent;
