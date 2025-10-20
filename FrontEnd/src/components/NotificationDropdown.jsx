// src/components/NotificationDropdown.jsx (Integrated API)

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Bell, Filter } from "lucide-react";
import SSEListener from './Notifications/SSEListener'; 
import notificationApi from '../api/notificationApi'; // Import the API service

// Helper to convert C# DateTime to a friendly time string
const formatTimeAgo = (isoDate) => {
    const now = new Date();
    const past = new Date(isoDate);
    const diffInMinutes = Math.floor((now - past) / (1000 * 60));

    if (diffInMinutes < 60) return `${diffInMinutes <= 0 ? 1 : diffInMinutes} phút trước`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`;
    return `${Math.floor(diffInMinutes / 1440)} ngày trước`;
};

// Helper to map C# response structure to React state structure
const mapApiToState = (apiNoti) => ({
    id: apiNoti.id,
    title: apiNoti.title,
    content: apiNoti.message, // Map 'message' to 'content'
    category: apiNoti.notiType ? apiNoti.notiType.toLowerCase() : 'activities', // Use 'notiType'
    type: apiNoti.type || 'giao_dich', // Assume a default type if not provided
    time: formatTimeAgo(apiNoti.createdAt),
    isUnread: !apiNoti.isRead, // Map 'isRead' to 'isUnread'
});

// ... (Rest of the component code remains the same, but the useEffect is modified)

// Filter categories for the Activities tab
const activityFilterCategories = [
    ["all", "Tất cả"],
    ["tai_khoan", "Tài khoản"],
    ["giao_dich", "Giao dịch"], 
    ["tin_dang", "Tin đăng"],
];

export default function NotificationDropdown({ userId }) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("activities"); 
    const [activeFilter, setActiveFilter] = useState("all");
    const [notifications, setNotifications] = useState([]);
    const dropdownRef = useRef(null);

    const unreadCount = notifications.filter(n => n.isUnread).length;

    const handleNewNotification = useCallback((newNoti) => {
        setNotifications(prev => [newNoti, ...prev]);
    }, []);

    // 🔄 Fetch initial/Historical notifications
    useEffect(() => {
        if (!userId) return;

        const fetchNotifications = async () => {
            try {
                // 📞 CALL API TO GET HISTORICAL DATA
                const apiData = await notificationApi.getNotificationByReceiverId(userId);
                
                // Map the fetched data to the component's internal state structure
                const mappedNotifications = apiData.map(mapApiToState);
                setNotifications(mappedNotifications);
                
            } catch (error) {
                console.error("Error fetching notifications:", error);
                // Set to an empty array or show an error state
                setNotifications([]); 
            }
        };
        fetchNotifications();
    }, [userId]);

    // 🖱️ Close popup when clicking outside & Mark as read on open
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);

        if (isOpen) {
            setActiveFilter("all"); 
            setNotifications(prev => prev.map(n => ({ ...n, isUnread: false })));
            // 🚨 TODO: Implement API call to tell the backend to mark notifications as read
            // Example: axios.put(`${baseURL}/mark-as-read/${userId}`);
        }

        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    // ----------------------------------------------------
    // FILTER LOGIC
    // ----------------------------------------------------
    const filteredByTab = notifications.filter(n => n.category === activeTab);
    
    const finalFiltered =
        activeTab === "activities" && activeFilter !== "all"
            ? filteredByTab.filter((n) => n.type === activeFilter)
            : filteredByTab;
    // ----------------------------------------------------


    return (
        <>
            {/* 👂 REAL-TIME SSE LISTENER */}
            {console.log(userId)}
            <SSEListener userId={userId} onNewNotification={handleNewNotification} />

            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="relative p-2 rounded-full text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition hover:bg-gray-100 dark:hover:bg-gray-800"
                    aria-label="Thông báo"
                >
                    <Bell className="w-6 h-6" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white dark:border-gray-900">
                            {unreadCount}
                        </span>
                    )}
                </button>

                {isOpen && (
                    <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl p-4 z-50 origin-top-right transform transition-all duration-300 ease-out animate-slide-down">
                        
                        <h3 className="font-bold text-xl text-gray-900 dark:text-gray-100 mb-2">Thông Báo</h3>

                        {/* Tabs (Hoạt Động / Tin Tức) */}
                        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-3">
                            {["activities", "news"].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => {
                                        setActiveTab(tab);
                                        setActiveFilter("all"); 
                                    }}
                                    className={`flex-1 py-1.5 text-sm font-medium transition ${activeTab === tab
                                            ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400"
                                            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                        }`}
                                >
                                    {tab === "activities" ? "Hoạt Động" : "Tin Tức"}
                                </button>
                            ))}
                        </div>

                        {/* Filters (ONLY for the 'activities' tab) */}
                        {activeTab === 'activities' && (
                            <div className="flex items-center flex-wrap gap-2 mb-3">
                                <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                {activityFilterCategories.map(([id, label]) => (
                                    <button
                                        key={id}
                                        onClick={() => setActiveFilter(id)}
                                        className={`px-3 py-1 text-xs rounded-full border transition whitespace-nowrap ${activeFilter === id
                                                ? "bg-blue-500 text-white border-blue-500"
                                                : "border-gray-300 text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                                            }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        )}
                        
                        {/* Notification list */}
                        <div className="max-h-80 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                            {finalFiltered.length === 0 ? (
                                <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
                                    {activeTab === 'activities' ? "Không có hoạt động nào." : "Không có tin tức nào."}
                                </p>
                            ) : (
                                finalFiltered.map((n) => (
                                    <div
                                        key={n.id}
                                        className={`rounded-lg p-3 cursor-pointer transition ${n.isUnread 
                                                ? "bg-blue-50 dark:bg-blue-900/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-100 dark:border-blue-900"
                                                : "bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-700"
                                            }`}
                                        onClick={() => console.log('Navigate to notification detail:', n.id)}
                                    >
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                                                {n.title}
                                            </span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">{n.time}</span>
                                        </div>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug">
                                            {n.content}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                        
                        {/* Footer */}
                        <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700 text-center">
                            <a 
                                href="/notifications" 
                                className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                                Xem tất cả
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}