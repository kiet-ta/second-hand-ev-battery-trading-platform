import React from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import ProfileForm from "../components/ProfileForm";
import AddressManagement from "../pages/AddressManagement";
import ChangePassword from "../components/ChangePassword";
import SettingsCard from "../components/SettingCard";

const outletContextValue = {
    handleDeleteAccount, 
    isDarkMode, 
    setIsDarkMode, 
    userId, // <-- User ID is here
    // ...
};
const ProfileSubLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Determine which setting card is active based on the URL path
    const getActiveCardPath = () => {
        const pathSegments = location.pathname.split('/').filter(segment => segment);
        // pathSegments: ['profile', 'address'] -> 'address'
        // pathSegments: ['profile'] -> 'account' (default for index route)
        return pathSegments.length > 1 ? pathSegments[1] : 'account';
    };

    const activeCardPath = getActiveCardPath();
    
    const settingsCards = [
        // Using the path segments as the IDs for routing
        { id: "account", title: "Account Setting", description: "Details about your Personal information", path: "/profile" }, // Maps to index route
        { id: "address", title: "Address", description: "Manage your delivery address", path: "address" }, // Relative path
        { id: "security", title: "Password & Security", description: "Change password or delete your account", path: "security" }, // Relative path
        { id: "notification", title: "Notification", description: "Manage alerts & updates", path: "notification" }, // Relative path
    ];

    // Helper to determine active state for the card
    const isActive = (cardId) => {
        return cardId === activeCardPath || (cardId === 'account' && activeCardPath === 'profile');
    };

    // Handler to navigate when a card is clicked
    const handleCardClick = (path) => {
        // We use relative navigation for sub-paths
        if (path.startsWith('/')) {
            navigate(path);
        } else {
            // This handles paths like 'address', 'security', etc., relative to /profile
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
                        // Note: navigate will handle the base path correctly if we pass the full path or relative
                        onClick={() => handleCardClick(card.path)} 
                    />
                ))}
            </div>
            <div className="profile-main">
                {/* Renders the specific form component (ProfileForm, AddressManagement, etc.) */}
                <Outlet />
            </div>
        </>
    );
};

// Export the component and its routes structure for use in router.jsx
ProfileSubLayout.routes = {
    element: <ProfileSubLayout />,
    children: [
        // Default path: /profile (Account Setting)
        { index: true, path: "", element: <ProfileForm /> },
        // Explicit paths for the other forms
        { path: "address", element: <AddressManagement /> },
        { path: "security", element: <ChangePassword /> },
        { path: "notification", element: (
            <div className="coming-soon"><h2>Notification Settings</h2><p>Coming soon...</p></div>
        )},
    ]
};

export default ProfileSubLayout;