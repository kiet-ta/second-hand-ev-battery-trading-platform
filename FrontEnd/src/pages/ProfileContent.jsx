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

    // State initialization
    const [searchQuery, setSearchQuery] = useState("");
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const userId = localStorage.getItem("userId");
    
    const [currentUser, setCurrentUser] = useState({
        fullName: localStorage.getItem("userName") || "Guest",
        avatarProfile: localStorage.getItem("userAvatar") || anhtao
    });
    
    // --- HANDLERS (DEFINED FIRST TO AVOID REFERENCE ERROR) ---

    // ✅ Xóa tài khoản (DELETE ACCOUNT)
    const handleDeleteAccount = async () => {
        const currentUserId = localStorage.getItem("userId");
        if (!currentUserId) return alert("User not found.");

        // NOTE: Changed window.confirm/alert to console log error messages
        if (!window.confirm("⚠️ Bạn có chắc muốn xóa tài khoản này? Hành động này không thể hoàn tác!"))
            return;

        try {
            const res = await fetch(`https://localhost:7272/api/User/${currentUserId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            });

            if (!res.ok) throw new Error("Không thể xóa tài khoản");

            console.log("✅ Tài khoản đã được xóa!");
            localStorage.clear();
            window.location.href = "/register";
        } catch (error) {
            console.error("❌ Lỗi khi xóa tài khoản:", error);
            console.error("❌ Đã xảy ra lỗi, vui lòng thử lại.");
        }
    };

    // ✅ Đăng xuất
    const handleLogoutConfirm = () => {
        localStorage.clear();
        window.location.href = "/login";
    };

    const handleCancelLogout = () => {
        setShowLogoutConfirm(false);
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

    // --- CONTEXT VALUE (DECLARED AFTER DEPENDENCIES) ---
    // NOTE: This object is only being passed to demonstrate the structure, 
    // but the child components are currently designed NOT to use it.
    const outletContextValue = {
        handleDeleteAccount, 
        isDarkMode, 
        setIsDarkMode, 
        userId
    };

    // --- EFFECTS ---

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

    // --- VIEW LOGIC ---
    const getActiveBaseSection = () => {
        const pathSegments = location.pathname.split('/').filter(segment => segment);
        if (pathSegments.length < 2) return 'account'; 
        
        if (pathSegments[1] === 'purchase') return 'purchase';
        if (pathSegments[1] === 'chat') return 'chat';
        if (pathSegments[1] === 'settings') return 'settings';
        
        return 'account';
    };

    const activeSection = getActiveBaseSection();

    const menuItems = [
        { id: "account", label: "Profile", icon: <FaRegUser />, path: "/profile" },
        { id: "purchase", label: "My Purchase", icon: <FaRegClipboard />, path: "/profile/purchase" },
        { id: "chat", label: "Chat", icon: <IoChatboxOutline />, path: "/profile/chat" },
        { id: "settings", label: "Global Settings", icon: <IoSettingsOutline />, path: "/profile/settings" },
    ];
    
    return (
        <div className="profile-layout">
            {/* Sidebar */}
            <div className="sidebar">
                <Logo/>

                <nav className="sidebar-nav">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
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

                {/* Profile Content - Renders the child route content */}
                <div className="profile-content">
                    {/* ✨ FIX: Removed the 'context' prop from Outlet to ensure no useOutletContext issues persist. */}
                    <Outlet />
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
