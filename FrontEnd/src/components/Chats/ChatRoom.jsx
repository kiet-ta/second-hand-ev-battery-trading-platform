// src/components/ChatPage.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import chatApi from '../../api/chatApi';
import useSignalR from '../../hooks/useSignalR';
import { Spin } from 'antd';
import userApi from '../../api/userApi';

// NOTE: Replace with your actual backend URL from .env
const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL || 'https://localhost:7000/';
const CHAT_HUB_URL = `${API_BASE_URL}chatHub`;
console.log(CHAT_HUB_URL)
// A simple utility to format time
const formatTime = (isoString) => {
    // Check for valid date before formatting
    const date = new Date(isoString);
    if (isNaN(date)) return isoString;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export function ChatRoom({ currentUserId, initialRoomId, initialReceiverId }) {
    // 🔑 FIX: Ensure currentUserId is an integer for comparisons
    const numericUserId = parseInt(currentUserId, 10);
    const loggedInUserId = isNaN(numericUserId) ? 1 : numericUserId; // Default to 1 if NaN

    // State for REST data
    const [rooms, setRooms] = useState([]);
    const [currentRoom, setCurrentRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [partnerProfiles, setPartnerProfiles] = useState({});
    const [chatPartner, setChatPartner] = useState(null);
    // State for UI and SignalR
    const [messageInput, setMessageInput] = useState('');
    const { connection, isConnected } = useSignalR(CHAT_HUB_URL);
    const messagesEndRef = useRef(null);

    // 1. Connection-dependent state update via ref (Fix for stale listener)
    const currentRoomRef = useRef(currentRoom);
    useEffect(() => {
        currentRoomRef.current = currentRoom;
    }, [currentRoom]);

    const fetchPartnerProfiles = useCallback(async (roomList) => {
        const uniquePartnerIds = new Set();
        roomList.forEach(room => {
            const partnerId = room.members.find(id => id !== loggedInUserId);
            if (partnerId) uniquePartnerIds.add(partnerId);
        });

        const newProfiles = {};
        for (const id of Array.from(uniquePartnerIds)) {
            try {
                // Fetch profiles one by one
                const profile = await userApi.getUserByID(id);
                newProfiles[id] = profile;
            } catch (error) {
                console.error(`Failed to fetch profile for user ${id}:`, error);
                newProfiles[id] = { fullName: `User ${id}`, avatarProfile: DEFAULT_AVATAR };
            }
        }
        setPartnerProfiles(newProfiles);
    }, [loggedInUserId]);
    const handleRoomSelect = useCallback(async (cid) => {
        try {
            // 1. Fetch room details
            const roomData = await chatApi.getChatByID(cid); 
            setCurrentRoom(roomData);
            setMessages(roomData.messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)));

            // 2. Determine the partner's ID
            const partnerId = roomData.members.find(id => id !== loggedInUserId);
            
            if (partnerId) {
                // 3. 🔑 Fetch the partner's profile using userApi
                const partnerProfile = await userApi.getUserByID(partnerId);
                setChatPartner(partnerProfile);
            } else {
                setChatPartner(null);
            }
        } catch (error) {
            console.error(`Failed to load room ${cid} or partner profile:`, error);
            setChatPartner(null);
        }
    }, [loggedInUserId]);

    // --- API CALLS ---
const fetchRooms = useCallback(async () => {
        if (!connection || !isConnected) return;
        try {
            const fetchedRooms = await connection.invoke("GetMyRooms");
            setRooms(fetchedRooms);
            await fetchPartnerProfiles(fetchedRooms);
            // Logic to determine which room to auto-load
            let roomToLoadCid = initialRoomId || (fetchedRooms.length > 0 ? fetchedRooms[0].cid : null);

            if (roomToLoadCid) {
                await handleRoomSelect(roomToLoadCid);
            }
        } catch (error) {
            console.error('Failed to fetch rooms via Hub:', error);
        }
}, [connection, isConnected, initialRoomId, fetchPartnerProfiles, handleRoomSelect]);
    useEffect(() => {
        fetchRooms();
    }, [fetchRooms]);

    // Auto-scroll to the latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);


    // --- SIGNALR RECEIVE LOGIC ---
    useEffect(() => {
        if (!connection) return;

        const messageHandler = (cid, messageDto) => {
            console.log(`Received message for room ${cid}:`, messageDto);

            const activeCid = currentRoomRef.current?.cid;

            // Only update messages if the received message belongs to the currently active room
            if (activeCid && cid === activeCid) {
                setMessages(prev =>
                    [...prev, messageDto].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                );
            }
        };

        // Ensure correct PascalCase
        connection.on('ReceiveMessage', messageHandler);

        return () => {
            connection.off('ReceiveMessage', messageHandler);
        };
        // Only depends on 'connection' and 'currentRoomRef' is internal
    }, [connection]);


    // --- SIGNALR SEND LOGIC ---
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!messageInput || !currentRoom || !isConnected) {
            console.warn('Cannot send message: Input missing, no room selected, or not connected.');
            return;
        }

        const cid = currentRoom.cid;
        const from = loggedInUserId;

        // 🔑 FIX: Correctly find the receiver (the only other member)
        const to = currentRoom.members.find(id => id !== loggedInUserId);

        if (!to) {
            console.error("Recipient user not found in room members.");
            return;
        }

        // Console check for the final calculated IDs
        console.log(`Attempting Send: cid=${cid}, from=${from}, to=${to}, text=${messageInput}`);

        try {
            // Call the server-side hub method: SendMessage(long cid, long to, string text)
            await connection.invoke('SendMessage', cid, to, messageInput);

            setMessageInput('');

        } catch (err) {
            console.error('SignalR SendMessage failed:', err);
            alert(`Failed to send message: ${err.message || 'Check console.'}`);
        }
    };

    // --- JSX RENDER ---
    const chatPartnerId = currentRoom?.members.find(id => id !== loggedInUserId);
    const partnerName = chatPartner?.fullName || `User ${chatPartnerId || '...'}`;
    const partnerAvatar = chatPartner?.avatarProfile || 'https://i.pinimg.com/736x/0b/4b/69/0b4b69fdcd89a4cd3c632e45e88a510a.jpg'; // Default avatar
    if (!isConnected) {
        return (
            <div className="flex justify-center items-center h-full min-h-[500px] bg-gray-50">
                <Spin tip="Connecting to Chat Server..." size="large" />
            </div>
        );
    }
        return (
        <div className="flex flex-row h-full w-full overflow-x-hidden bg-white shadow-xl rounded-lg">
            {/* --- Room List (Sidebar) --- */}
            <div className="flex flex-col w-64 bg-gray-50 flex-shrink-0 border-r border-gray-200">
                <div className="p-4 border-b border-gray-200">
                    <p className="text-lg font-bold">Your Chats ({rooms.length})</p>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {isConnected ? 'Online' : 'Reconnecting'}
                    </span>
                </div>
                <div className="flex flex-col space-y-1 p-3 overflow-y-auto">
                    {rooms.map((room) => {
                        const otherMemberId = room.members.find(id => id !== loggedInUserId) || '...';
                        const profile = partnerProfiles[otherMemberId] || { fullName: `User ${otherMemberId}`, avatarProfile: "https://i.pinimg.com/736x/76/20/1d/76201dcaafc969da57f725937afc1488.jpg" };
                        return (
                            <div 
                                key={room.cid}
                                onClick={() => handleRoomSelect(room.cid)}
                                className={`flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition ${currentRoom?.cid === room.cid ? 'bg-indigo-100' : 'hover:bg-gray-100'}`}
                            >
                                {/* 🔑 Display Avatar */}
                                <img 
                                    src={profile.avatarProfile}
                                    alt={profile.fullName}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                                <div className="flex flex-col leading-snug truncate">
                                    <span className="font-semibold text-sm truncate">
                                        {profile.fullName}
                                    </span>
                                    <span className="text-xs text-gray-500">Room: {room.cid}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            {/* --- Chat Window --- */}
            <div className="flex flex-col flex-auto h-screen">
                {currentRoom ? (
                    <div className="flex flex-col flex-auto flex-shrink-0 h-full p-4">
                        
                        {/* 🔑 Chat Header */}
                        <div className="flex items-center gap-3 mb-4 border-b pb-2">
                             <img src={partnerAvatar} alt={partnerName} className="w-10 h-10 rounded-full object-cover"/>
                            <h3 className="text-xl font-bold text-indigo-600">
                                {partnerName}
                            </h3>
                        </div>
                        {/* Message Display Area */}
                        <div className="flex flex-col h-full overflow-y-auto mb-4 bg-gray-50 p-3 rounded-lg">
                            <div className="flex flex-col h-full justify-end">
                                <div className="grid grid-cols-12 gap-y-2">
                                    {messages.map((msg) => {
                                        const isMyMessage = msg.from === loggedInUserId; 
                                        return (
                                            <div key={msg.id} className={`col-span-12 flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`flex flex-col leading-tight max-w-[75%] mx-2`}>
                                                    <div className="relative">
                                                        <span className={`px-4 py-2 rounded-xl inline-block text-sm ${
                                                            isMyMessage 
                                                                ? 'bg-indigo-600 text-white rounded-br-none' 
                                                                : 'bg-white text-gray-800 rounded-bl-none border border-gray-300'
                                                        }`}>
                                                            {msg.text}
                                                        </span>
                                                        <span className={`text-xs mt-1 block ${isMyMessage ? 'text-gray-500 text-right' : 'text-gray-500 text-left'}`}>
                                                            {formatTime(msg.createdAt)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} /> 
                                </div>
                            </div>
                        </div>
                        {/* Message Input Area */}
                        <div className="flex flex-row items-center h-16 rounded-xl w-full pt-2 border-t border-gray-200">
                            <form onSubmit={handleSendMessage} className="flex w-full space-x-2">
                                <input
                                    type="text"
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    placeholder="Type your message here..."
                                    className="flex-grow p-4 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500"
                                    disabled={!isConnected}
                                />
                                <button
                                    type="submit"
                                    disabled={!isConnected || !messageInput}
                                    className="px-6 py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition flex items-center justify-center"
                                >
                                    Send
                                </button>
                            </form>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        {rooms.length > 0 ? 'Select a room to start.' : 'Loading your chat rooms...'}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ChatRoom;