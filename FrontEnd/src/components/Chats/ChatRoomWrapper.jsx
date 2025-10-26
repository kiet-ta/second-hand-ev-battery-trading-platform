// src/components/Chats/ChatRoomWrapper.jsx
import React from "react";
import { useLocation } from "react-router-dom";
import ChatRoom from "./ChatRoom";

const ChatRoomWrapper = () => {
  const userId = localStorage.getItem("userId");
  const location = useLocation();
  const initialRoomId = location.state?.chatRoomId || null;

  if (!userId) {
    return (
      <div className="flex justify-center items-center w-1/2 h-full text-gray-600">
        Please log in to view your chats.
      </div>
    );
  }

  return (
    <div className="profile-main w-full">
      <ChatRoom
        currentUserId={userId}
        initialRoomId={initialRoomId}
      />
    </div>
  );
};

export default ChatRoomWrapper;
