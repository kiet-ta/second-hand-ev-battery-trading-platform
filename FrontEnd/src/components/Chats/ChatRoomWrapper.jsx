// src/components/Chats/ChatRoomWrapper.jsx (NEW FILE)

import React from 'react';
import { useLocation } from 'react-router-dom';
import ChatRoom from './ChatRoom'; // Adjust path if necessary

const ChatRoomWrapper = () => {
    // Get User ID from localStorage (or context)
    const userId = localStorage.getItem("userId");
    
    // Get navigation state (passed from EVDetails.jsx)
    const location = useLocation();
    const initialRoomId = location.state?.chatRoomId;

    if (!userId) {
        // Handle unauthenticated state gracefully (e.g., redirect to login or show a message)
        return <div className="profile-main">Please log in to view your chats.</div>;
    }

    return (
        <div className="profile-main">
            <ChatRoom 
                currentUserId={userId} // Pass the ID as a string (will be parsed to number inside ChatRoom)
                initialRoomId={initialRoomId} // Pass the navigated Room ID
                // Note: initialReceiverId is derived inside the ChatRoom via handleRoomSelect(initialRoomId)
            />
        </div>
    );
};

export default ChatRoomWrapper;