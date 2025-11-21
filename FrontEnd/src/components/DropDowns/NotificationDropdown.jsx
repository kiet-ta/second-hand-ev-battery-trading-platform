import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Bell, Filter } from "lucide-react";
import SSEListener from "../Notifications/SSEListener";
import notificationApi from "../../api/notificationApi";

// Helper to format relative time
const formatTimeAgo = (isoDate) => {
  const now = new Date();
  const past = new Date(isoDate);
  const diffInMinutes = Math.floor((now - past) / (1000 * 60));

  if (diffInMinutes < 60) return `${diffInMinutes <= 0 ? 1 : diffInMinutes} phút trước`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`;
  return `${Math.floor(diffInMinutes / 1440)} ngày trước`;
};

// Convert backend response → UI state
const mapApiToState = (apiNoti) => ({
  id: apiNoti.id,
  title: apiNoti.title,
  content: apiNoti.message,
  category: apiNoti.notiType ? apiNoti.notiType.toLowerCase() : "activities",
  type: apiNoti.type || "giao_dich",
  time: formatTimeAgo(apiNoti.createdAt),
  isUnread: !apiNoti.isRead,
});

// Separate memoized Notification Item (reduces re-renders)
const NotificationItem = React.memo(({ notification, onClick }) => (
  <div
    className={`rounded-lg p-3 cursor-pointer border transition ${notification.isUnread
        ? "bg-[#EAF3FF] border-blue-100 hover:bg-[#DCEBFF]"
        : "bg-white border-[#ebe7e2] hover:bg-[#f9f6f1]"
      }`}
    onClick={() => onClick(notification.id)}
  >
    <div className="flex justify-between items-center mb-1">
      <span className="font-semibold text-sm text-gray-800">{notification.title}</span>
      <span className="text-xs text-gray-500">{notification.time}</span>
    </div>
    <p className="text-sm text-gray-700 leading-snug">{notification.content}</p>
  </div>
));

const activityFilterCategories = [
  ["all", "Tất cả"],
  ["unread", "Chưa đọc"],
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

  const unreadCount = useMemo(
    () => notifications.filter((n) => n.isUnread).length,
    [notifications]
  );

  // Stable callback for SSE
  const handleNewNotification = useCallback((newNoti) => {
    setNotifications((prev) => [newNoti, ...prev]);
  }, []);

  // Fetch notifications
  useEffect(() => {
    if (!userId) return;
    let isMounted = true;

    const fetchNotifications = async () => {
      try {
        const apiData = await notificationApi.getNotificationByReceiverId(userId);
        if (isMounted) setNotifications(apiData.map(mapApiToState));
      } catch (error) {
        console.error("Error fetching notifications:", error);
        if (isMounted) setNotifications([]);
      }
    };
    fetchNotifications();
    return () => (isMounted = false);
  }, [userId]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    const filteredByTab = notifications.filter((n) => n.category === activeTab);
    let result = filteredByTab;

    if (activeTab === "activities") {
      if (activeFilter === "unread") {
        result = filteredByTab.filter(n => n.isUnread);
      } else if (activeFilter !== "all") {
        result = filteredByTab.filter(n => n.type === activeFilter);
      }
    }

    return result;
  }, [notifications, activeTab, activeFilter]);

  // Handle individual click
  const handleItemClick = useCallback((id) => {
    console.log("Navigate to notification:", id);
  }, []);

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => n.isUnread);
      await Promise.all(
        unreadNotifications.map(n => notificationApi.putNotificationStatusIsRead(n.id))
      );
      setNotifications(prev =>
        prev.map(n => ({ ...n, isUnread: false }))
      );
      setActiveFilter("all");
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  return (
    <>
      <SSEListener userId={userId} onNewNotification={handleNewNotification} />

      <div className="relative" ref={dropdownRef}>
        {/* Bell icon */}
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="relative p-2 rounded-full text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition"
          aria-label="Thông báo"
        >
          <Bell className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">
              {unreadCount}
            </span>
          )}
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-[#FAF8F4] border border-[#e0d8cf] rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.1)] p-4 z-50 animate-slide-down will-change-transform">

            {/* Header with Mark all as read */}
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-lg text-gray-800">Thông Báo</h3>
              {notifications.some(n => n.isUnread) && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  Đánh dấu tất cả đã đọc
                </button>
              )}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-300 mb-3">
              {["activities", "news"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setActiveFilter("all");
                  }}
                  className={`flex-1 py-1.5 text-sm font-medium transition ${activeTab === tab
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                  {tab === "activities" ? "Hoạt Động" : "Tin Tức"}
                </button>
              ))}
            </div>

            {/* Filters */}
            {activeTab === "activities" && (
              <div className="flex items-center flex-wrap gap-2 mb-3">
                <Filter className="w-4 h-4 text-gray-500" />
                {activityFilterCategories.map(([id, label]) => (
                  <button
                    key={id}
                    onClick={() => setActiveFilter(id)}
                    className={`px-3 py-1 text-xs rounded-full border transition ${activeFilter === id
                        ? "bg-blue-500 text-white border-blue-500"
                        : "border-gray-300 text-gray-600 hover:bg-blue-50"
                      }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            {/* Notification list */}
            <div className="max-h-80 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {filteredNotifications.length === 0 ? (
                <p className="text-center text-sm text-gray-500 py-4">
                  {activeTab === "activities"
                    ? "Không có hoạt động nào."
                    : "Không có tin tức nào."}
                </p>
              ) : (
                filteredNotifications.map((n) => (
                  <NotificationItem
                    key={n.id}
                    notification={n}
                    onClick={handleItemClick}
                  />
                ))
              )}
            </div>

            {/* Footer */}
            <div className="mt-3 pt-2 border-t border-[#e0d8cf] text-center">
              <a
                href="/profile/notification"
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
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
