import React from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import ProfileForm from "../components/ProfileForm";
import AddressManagement from "../pages/AddressManagement";
import ChangePassword from "../components/ChangePassword";
import SettingsCard from "../components/SettingCard";

const ProfileSubLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const getActiveCardPath = () => {
        const pathSegments = location.pathname.split('/').filter(segment => segment);
        return pathSegments.length > 1 ? pathSegments[1] : 'account';
    };

    const activeCardPath = getActiveCardPath();
    
    const settingsCards = [
        { id: "account", title: "Account Setting", description: "Details about your Personal information", path: "/profile" }, // Maps to index route
        { id: "address", title: "Address", description: "Manage your delivery address", path: "address" }, // Relative path
        { id: "security", title: "Password & Security", description: "Change password or delete your account", path: "security" }, // Relative path
        { id: "notification", title: "Notification", description: "Manage alerts & updates", path: "notification" }, // Relative path
    ];

    // Helper to determine active state for the card
    const isActive = (cardId) => {
        return cardId === activeCardPath || (cardId === 'account' && activeCardPath === 'profile');
    };

    const handleCardClick = (path) => {
        if (path.startsWith('/')) {
            navigate(path);
        } else {
            navigate(`/profile/${path}`); 
        }
    };

    return (
        <>
            <div className="settings-sidebar">
                {settingsCards.map((card) => (
                    <SettingsCard
                        key={card.id}
                        {...card}
                        isActive={isActive(card.id)}
                        onClick={() => handleCardClick(card.path)} 
                    />
                ))}
            </div>
            <div className="profile-main">
                <Outlet />
            </div>
        </>
    );
};

ProfileSubLayout.routes = {
    element: <ProfileSubLayout />,
    children: [
        { index: true, path: "", element: <ProfileForm /> },
        { path: "address", element: <AddressManagement /> },
        { path: "security", element: <ChangePassword /> },
        { path: "notification", element: (
            <div className="coming-soon"><h2>Notification Settings</h2><p>Coming soon...</p></div>
        )},
    ]
};

export default ProfileSubLayout;