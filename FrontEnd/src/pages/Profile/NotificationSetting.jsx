import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Filter } from "lucide-react";
import notificationApi from "../../api/notificationApi";

const formatTimeAgo = (isoDate) => {
  const now = new Date();
  const past = new Date(isoDate);
  const diffInMinutes = Math.floor((now - past) / (1000 * 60));
  if (diffInMinutes < 60) return `${diffInMinutes <= 0 ? 1 : diffInMinutes} phút trước`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`;
  return `${Math.floor(diffInMinutes / 1440)} ngày trước`;
};

const mapApiToState = (apiNoti) => ({
  id: apiNoti.id,
  title: apiNoti.title,
  content: apiNoti.message,
  category: apiNoti.notiType ? apiNoti.notiType.toLowerCase() : "activities",
  type: apiNoti.type || "giao_dich",
  time: formatTimeAgo(apiNoti.createdAt),
  isUnread: !apiNoti.isRead,
});

const NotificationItem = ({ notification, onClick }) => (
  <div
    className={`rounded-lg p-3 cursor-pointer border transition ${
      notification.isUnread
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
);

const activityFilterCategories = [
  ["all", "Tất cả"],
  ["unread", "Chưa đọc"],
  ["tai_khoan", "Tài khoản"],
  ["giao_dich", "Giao dịch"],
  ["tin_dang", "Tin đăng"],
];

export default function ProfileNotificationsPage() {
  const userId = localStorage.getItem("userId");
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState("activities");
  const [activeFilter, setActiveFilter] = useState("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => n.isUnread);
      await Promise.all(
        unreadNotifications.map(n => notificationApi.putNotificationStatusIsRead(n.id))
      );
      setNotifications(prev => prev.map(n => ({ ...n, isUnread: false })));
      setActiveFilter("all");
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  const filteredNotifications = useMemo(() => {
    let filtered = notifications.filter(n => n.category === activeTab);

    if (activeTab === "activities") {
      if (activeFilter === "unread") filtered = filtered.filter(n => n.isUnread);
      else if (activeFilter !== "all") filtered = filtered.filter(n => n.type === activeFilter);
    }

    return filtered;
  }, [notifications, activeTab, activeFilter]);

  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
  const paginatedNotifications = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredNotifications.slice(start, end);
  }, [filteredNotifications, currentPage]);

  const handleItemClick = useCallback((id) => {
    console.log("Navigate to notification:", id);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Thông Báo của tôi</h1>
        {notifications.some(n => n.isUnread) && (
          <button
            onClick={handleMarkAllAsRead}
            className="px-3 py-1 text-sm rounded-full bg-blue-500 text-white hover:bg-blue-600 transition"
          >
            Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-300 mb-3">
        {["activities", "news"].map(tab => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setActiveFilter("all");
              setCurrentPage(1);
            }}
            className={`flex-1 py-2 text-sm font-medium transition ${
              activeTab === tab
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
        <div className="flex items-center flex-wrap gap-2 mb-4">
          <Filter className="w-4 h-4 text-gray-500" />
          {activityFilterCategories.map(([id, label]) => (
            <button
              key={id}
              onClick={() => {
                setActiveFilter(id);
                setCurrentPage(1);
              }}
              className={`px-3 py-1 text-xs rounded-full border transition ${
                activeFilter === id
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
      <div className="space-y-3">
        {paginatedNotifications.length === 0 ? (
          <p className="text-center text-gray-500 py-4">
            {activeTab === "activities"
              ? "Không có hoạt động nào."
              : "Không có tin tức nào."}
          </p>
        ) : (
          paginatedNotifications.map(n => (
            <NotificationItem key={n.id} notification={n} onClick={handleItemClick} />
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
          >
            Trước
          </button>
          {[...Array(totalPages)].map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentPage(idx + 1)}
              className={`px-3 py-1 border rounded ${
                currentPage === idx + 1 ? "bg-blue-500 text-white" : "hover:bg-gray-100"
              }`}
            >
              {idx + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
          >
            Tiếp
          </button>
        </div>
      )}
    </div>
  );
}
