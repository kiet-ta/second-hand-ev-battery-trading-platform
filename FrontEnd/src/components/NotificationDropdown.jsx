import React, { useState, useEffect, useRef } from "react";
import { Bell, Filter } from "lucide-react";

export default function NotificationDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("activity");
    const [activeFilter, setActiveFilter] = useState("all");
    const [notifications, setNotifications] = useState([]);
    const dropdownRef = useRef(null);

    // 🧩 Fake API — bạn thay bằng API thật sau
    useEffect(() => {
        const dummy = [
            {
                id: 1,
                title: "Thông báo",
                content:
                    "Chúc mừng! Bạn đã nhận 50 Điểm Tốt nhờ hoàn thành nhiệm vụ Hé lộ dung nhan.",
                time: "29 ngày trước",
                type: "giao_dich",
            },
            {
                id: 2,
                title: "Thông báo",
                content:
                    "Chúc mừng! Bạn đã nhận 50 Điểm Tốt nhờ hoàn thành nhiệm vụ Xác minh danh phận.",
                time: "29 ngày trước",
                type: "tai_khoan",
            },
        ];
        setNotifications(dummy);
    }, []);

    // Đóng popup khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filtered =
        activeFilter === "all"
            ? notifications
            : notifications.filter((n) => n.type === activeFilter);

    return (
        <div className="relative" ref={dropdownRef}>
            {/* 🔔 Nút mở dropdown */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative text-gray-700 hover:text-blue-600 transition"
            >
                <Bell className="w-6 h-6" />
                {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full px-1.5">
                        {notifications.length}
                    </span>
                )}
            </button>

            {/* 📋 Popup Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-4 z-50 animate-fadeIn">
                    {/* Header */}
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        Thông Báo
                    </h3>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-200 dark:border-gray-700 mb-3">
                        {["activity", "news"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 py-1.5 text-sm font-medium transition ${activeTab === tab
                                        ? "text-blue-600 border-b-2 border-blue-600"
                                        : "text-gray-500 hover:text-gray-700"
                                    }`}
                            >
                                {tab === "activity" ? "Hoạt Động" : "Tin Tức"}
                            </button>
                        ))}
                    </div>

                    {/* Filters */}
                    <div className="flex items-center flex-wrap gap-2 mb-3">
                        <Filter className="w-4 h-4 text-gray-500" />
                        {[
                            ["all", "Tất cả"],
                            ["tai_khoan", "Tài khoản"],
                            ["giao_dich", "Giao dịch"],
                            ["tin_dang", "Tin đăng"],
                            ["su_kien", "Sự kiện"],
                        ].map(([id, label]) => (
                            <button
                                key={id}
                                onClick={() => setActiveFilter(id)}
                                className={`px-3 py-1 text-xs rounded-full border transition ${activeFilter === id
                                        ? "bg-blue-500 text-white border-blue-500"
                                        : "border-gray-300 text-gray-600 hover:bg-gray-100"
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Notification list */}
                    <div className="max-h-64 overflow-y-auto space-y-3">
                        {filtered.length === 0 ? (
                            <p className="text-center text-sm text-gray-500">
                                Không có thông báo nào
                            </p>
                        ) : (
                            filtered.map((n) => (
                                <div
                                    key={n.id}
                                    className="bg-yellow-50 dark:bg-gray-800 rounded-lg p-3 border border-yellow-100 dark:border-gray-700"
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                                            {n.title}
                                        </span>
                                        <span className="text-xs text-gray-500">{n.time}</span>
                                    </div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug">
                                        {n.content}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
