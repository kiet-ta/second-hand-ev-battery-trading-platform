import { NavLink, Outlet } from "react-router-dom";
import "../../assets/styles/ProfileLayout.css";

export default function ProfileMain() {
    const cards = [
        { id: "account", title: "Tài khoản", description: "Quản lý thông tin cá nhân của bạn" },
        { id: "notification", title: "Thông báo", description: "Cài đặt và quản lý các thông báo" },
        { id: "address", title: "Địa chỉ", description: "Quản lý địa chỉ giao hàng của bạn" },
        { id: "security", title: "Mật khẩu & Bảo mật", description: "Thay đổi mật khẩu hoặc xóa tài khoản" },

    ];

    return (
        <div className="profile-content">
            {/* Sidebar cards */}
            <div className="settings-sidebar">
                {cards.map((card) => (
                    <NavLink
                        key={card.id}
                        to={card.id === "account" ? "/profile/account" : `/profile/${card.id}`}
                        className={({ isActive }) => `settings-card ${isActive ? "active" : ""}`}
                    >
                        <h3>{card.title}</h3>
                        <p>{card.description}</p>
                    </NavLink>
                ))}
            </div>

            {/* Nội dung hiển thị theo route con */}
            <div className="profile-main">
                <Outlet />
            </div>
        </div>
    );
}
