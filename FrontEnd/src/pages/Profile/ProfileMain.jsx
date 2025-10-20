import { NavLink, Outlet } from "react-router-dom";
import "../../assets/styles/ProfileLayout.css";

export default function ProfileMain() {
    const cards = [
        { id: "account", title: "Account Setting", description: "Details about your Personal information" },
        { id: "notification", title: "Notification", description: "Manage alerts & updates" },
        { id: "address", title: "Address", description: "Manage your delivery address" },
        { id: "security", title: "Password & Security", description: "Change password or delete your account" },
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
