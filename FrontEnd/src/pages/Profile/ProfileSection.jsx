import { useState } from "react";
import SettingCard from "../../components/SettingCard";
import ProfileForm from "../../components/ProfileForm";
import AddressManagement from "../../pages/AddressManagement";
import ChangePassword from "../../components/ChangePassword";

export default function ProfileSection() {
    const [activeCard, setActiveCard] = useState("account");

    const settingsCards = [
        { id: "account", title: "Account Setting", description: "Details about your Personal information" },
        { id: "notification", title: "Notification", description: "Manage alerts & updates" },
        { id: "address", title: "Address", description: "Manage your delivery address" },
        { id: "security", title: "Password & Security", description: "Change password or delete your account" },
    ];

    return (
        <div className="profile-content">
            <div className="settings-sidebar">
                {settingsCards.map((card) => (
                    <SettingCard
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
        </div>
    );
}
