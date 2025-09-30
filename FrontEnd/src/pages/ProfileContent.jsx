
import { useState } from "react"
import SettingsCard from "../components/SettingCard"
import ProfileForm from "../components/ProfileForm"
import "../assets/styles/ProfileContent.css"
import anhtao from "../assets/images/anhtao.png"
import Logo from "../assets/images/Logo.png"

const ProfileContent = () => {
    const [activeSection, setActiveSection] = useState("profile")
    const [activeCard, setActiveCard] = useState("account")
    const [searchQuery, setSearchQuery] = useState("")

    const menuItems = [
        { id: "feed", label: "My Job Feed", icon: "📋" },
        { id: "profile", label: "Profile", icon: "👤" },
        { id: "dashboard", label: "Dashboard", icon: "📊" },
        { id: "saved", label: "Saved Jobs", icon: "🔖" },
        { id: "settings", label: "Settings", icon: "⚙️" },
    ]

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
        {
            id: "address",
            title: "Address",
            description: "Details about your Address",
        },
        {
            id: "security",
            title: "Password & Security",
            description: "Details about your Personal information",
        },
    ]

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
                            <img
                                src={anhtao}
                                alt="Profile"
                                className="user-avatar"
                            />
                            <span className="user-name">Thanh Trung</span>
                            <button className="menu-btn">⋯</button>
                        </div>
                    </div>
                </header>

                {/* Profile Content */}
                <div className="profile-content">
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
                        <ProfileForm />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProfileContent
