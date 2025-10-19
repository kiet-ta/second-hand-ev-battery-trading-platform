// src/components/NotificationDropdown.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Bell, Filter } from "lucide-react";
import SSEListener from './Notifications/SSEListener'; // Import the listener

// Helper to get type label
const getTypeLabel = (type) => {
    switch (type) {
        case "tai_khoan": return "Tài khoản";
        case "giao_dich": return "Giao dịch";
        case "tin_dang": return "Tin đăng";
        case "su_kien": return "Sự kiện";
        default: return "Thông báo";
    }
};

export default function NotificationDropdown({ userId }) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("activity");
    const [activeFilter, setActiveFilter] = useState("all");
    const [notifications, setNotifications] = useState([]);
    const dropdownRef = useRef(null);

    const unreadCount = notifications.filter(n => n.isUnread).length;

    // Function to add a new notification from the SSE listener
    const handleNewNotification = useCallback((newNoti) => {
        setNotifications(prev => [newNoti, ...prev]);
    }, []);

    // 🔄 Fetch initial/Historical notifications
    useEffect(() => {
        // 🚨 TODO: Replace this with an actual API call (GET /api/notifications?userId=...)
        const fetchNotifications = async () => {
            // FAKE API response
            const dummy = [
                { id: 1, title: "Thông báo", content: "Chúc mừng! Bạn đã nhận 50 Điểm Tốt nhờ hoàn thành nhiệm vụ Hé lộ dung nhan.", time: "29 ngày trước", type: "giao_dich", isUnread: false },
                { id: 2, title: "Thông báo", content: "Chúc mừng! Bạn đã nhận 50 Điểm Tốt nhờ hoàn thành nhiệm vụ Xác minh danh phận.", time: "29 ngày trước", type: "tai_khoan", isUnread: true },
                { id: 3, title: "Thông báo", content: "Bài đăng của bạn đã được duyệt thành công.", time: "1 ngày trước", type: "tin_dang", isUnread: true },
            ];
            setNotifications(dummy);
        };
        fetchNotifications();
    }, []);

    // 🖱️ Close popup when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // 👁️ Mark all as read when dropdown opens
    useEffect(() => {
        if (isOpen) {
            // 🚨 TODO: Send API request to mark all unread notifications as read
            setNotifications(prev => 
                prev.map(n => ({ ...n, isUnread: false }))
            );
        }
    }, [isOpen]);


    const filtered =
        activeFilter === "all"
            ? notifications
            : notifications.filter((n) => n.type === activeFilter);

    // Filter categories for the UI
    const filterCategories = [
        ["all", "Tất cả"],
        ["tai_khoan", "Tài khoản"],
        ["giao_dich", "Giao dịch"],
        ["tin_dang", "Tin đăng"],
        ["su_kien", "Sự kiện"],
    ];

    return (
        <>
            {/* 👂 REAL-TIME SSE LISTENER */}
            <SSEListener userId={userId} onNewNotification={handleNewNotification} />

            <div className="relative" ref={dropdownRef}>
                {/* 🔔 Nút mở dropdown */}
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

                {/* 📋 Popup Dropdown */}
                {isOpen && (
                    <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl p-4 z-50 origin-top-right transform transition-all duration-300 ease-out animate-slide-down">
                        
                        {/* Header */}
                        <h3 className="font-bold text-xl text-gray-900 dark:text-gray-100 mb-2">
                            Thông Báo
                        </h3>

                        {/* Tabs (Hoạt Động / Tin Tức) */}
                        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-3">
                            {["activity", "news"].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 py-1.5 text-sm font-medium transition ${activeTab === tab
                                            ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400"
                                            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                        }`}
                                >
                                    {tab === "activity" ? "Hoạt Động" : "Tin Tức"}
                                </button>
                            ))}
                        </div>

                        {/* Filters */}
                        {activeTab === 'activity' && (
                            <div className="flex items-center flex-wrap gap-2 mb-3">
                                <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                {filterCategories.map(([id, label]) => (
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
                            {filtered.length === 0 ? (
                                <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
                                    Không có thông báo nào.
                                </p>
                            ) : (
                                filtered.map((n) => (
                                    <div
                                        key={n.id}
                                        className={`rounded-lg p-3 cursor-pointer transition ${n.isUnread 
                                                ? "bg-blue-50 dark:bg-blue-900/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-100 dark:border-blue-900"
                                                : "bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-700"
                                            }`}
                                        onClick={() => console.log('Navigate to notification detail:', n.id)} // 🚨 TODO: Add actual navigation
                                    >
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                                                {getTypeLabel(n.type)}
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
                        
                        {/* Footer (Optional: View All Link) */}
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