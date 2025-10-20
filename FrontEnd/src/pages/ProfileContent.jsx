import { useState, useEffect } from "react";
import HistoryBought from "../components/HistoryBought";
import ChatRoom from "../components/Chats/ChatRoom"
import "../assets/styles/ProfileContent.css";
import anhtao from "../assets/images/Logo.png";
import { FaRegUser } from "react-icons/fa";
import { FaRegClipboard } from "react-icons/fa";
import { IoSettingsOutline, IoChatboxOutline } from "react-icons/io5";
import { IoMdSearch } from "react-icons/io";
import { IoCartOutline } from "react-icons/io5";
import { MdLogout } from "react-icons/md";
import Logo from "../components/Logo";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import NotificationDropdown from "../components/NotificationDropdown";

const ProfileContent = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // State cleanup
    // const [activeCard, setActiveCard] = useState("account"); // ✨ REMOVED
    const [searchQuery, setSearchQuery] = useState("");
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const userId = localStorage.getItem("userId");
    const outletContextValue = {
        handleDeleteAccount, 
        isDarkMode, 
        setIsDarkMode, 
        userId
    };


    
    // ... (currentUser state and fetchUser useEffects remain the same)
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

    // 🌙 Dark Mode toggle + smooth effect
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
        const currentUserId = localStorage.getItem("userId");
        if (!currentUserId) return alert("User not found.");

        if (!window.confirm("⚠️ Bạn có chắc muốn xóa tài khoản này? Hành động này không thể hoàn tác!"))
            return;

        try {
            const res = await fetch(`https://localhost:7272/api/User/${currentUserId}`, {
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

    // Navigation functions
    const handleMenuClick = (path) => {
        navigate(path);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const handleGoToCart = () => {
        navigate("/cart");
    };

    // ✨ Logic to determine the active section based on the current URL path
    const getActiveBaseSection = () => {
        const pathSegments = location.pathname.split('/').filter(segment => segment);
        if (pathSegments.length < 2) return 'account'; // Default to /profile (which maps to account)
        
        // Check for specific sub-routes: purchase, chat, settings
        if (pathSegments[1] === 'purchase') return 'purchase';
        if (pathSegments[1] === 'chat') return 'chat';
        if (pathSegments[1] === 'settings') return 'settings';
        
        // For /profile/account, /profile/address, /profile/security etc., 
        // they should all highlight the "Profile" link (which we'll call 'account' here).
        return 'account';
    };

    const activeSection = getActiveBaseSection();

    const menuItems = [
        { id: "account", label: "Profile", icon: <FaRegUser />, path: "/profile" }, // Maps to account, address, security
        { id: "purchase", label: "My Purchase", icon: <FaRegClipboard />, path: "/profile/purchase" },
        { id: "chat", label: "Chat", icon: <IoChatboxOutline />, path: "/profile/chat" },
        { id: "settings", label: "Global Settings", icon: <IoSettingsOutline />, path: "/profile/settings" },
    ];
    
    // Pass necessary props/functions via Outlet context
    return (
        <div className="profile-layout">
            {/* Sidebar */}
            <div className="sidebar">
                <Logo/>

                <nav className="sidebar-nav">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            // ✨ Use item.id for active check
                            className={`nav-item ${activeSection === item.id ? "active" : ""}`}
                            onClick={() => handleMenuClick(item.path)}
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
                    <form onSubmit={handleSearch} className="search-container">
                        <input
                            type="text"
                            placeholder="Search Anything"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                        <button type="submit" className="search-button">
                            <IoMdSearch />
                        </button>
                    </form>

                    <div className="header-actions flex items-center gap-5">
                        <div className="relative">
                            <NotificationDropdown userId={localStorage.getItem("userId")} />
                        </div>

                        <div className="relative">
                            <button 
                                className="relative text-gray-700 hover:text-blue-600 transition"
                                onClick={handleGoToCart}
                            >
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

                {/* ✨ Profile Content - Renders the child route content */}
                <div className="profile-content">
                    {/* The Outlet renders the component associated with the current sub-route */}
                    <Outlet context={outletContextValue} />
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