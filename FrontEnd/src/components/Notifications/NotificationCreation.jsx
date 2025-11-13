import React, { useState } from "react";
import notificationApi from "../../api/notificationApi";
import { Send, CheckCircle, AlertTriangle } from "lucide-react";

export default function NotificationCreator() {
    const [formData, setFormData] = useState({
        notiType: "Activities", // Maps to NotiType
        senderId: 1, // Maps to SenderId
        senderRole: "Manager", // Maps to SenderRole
        targetUserId: "user-123", // 🎯 Maps to TargetUserId (Required for targeting)
        title: "", // Maps to Title
        message: "", // Maps to Message
    });
    const [status, setStatus] = useState({ message: null, type: null });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        if (!formData.targetUserId.trim()) {
            setStatus({ message: "Vui lòng nhập ID người nhận (Target User ID).", type: "error" });
            return false;
        }
        if (!formData.title.trim() || !formData.message.trim()) {
            setStatus({ message: "Tiêu đề và Nội dung tin nhắn không được để trống.", type: "error" });
            return false;
        }
        setStatus({ message: null, type: null });
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);

        const apiPayload = {
            notiType: formData.notiType,
            title: formData.title,
            message: formData.message,
            targetUserId: formData.targetUserId // 🎯 Send the required field
        };

        try {
            await notificationApi.createNotification(apiPayload); 

            setStatus({ message: "Thông báo đã được tạo và gửi thành công!", type: "success" });
            setFormData(prev => ({ 
                ...prev, 
                title: "", 
                message: "", 
            })); 

        } catch (error) {
            console.error("API Error:", error);
            setStatus({ message: `Gửi thông báo thất bại: ${error.response?.data?.message || error.message}`, type: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusClasses = (type) => {
        if (type === 'success') {
            return "bg-green-100 border-green-400 text-green-700";
        }
        if (type === 'error') {
            return "bg-red-100 border-red-400 text-red-700";
        }
        return "";
    };

    return (
        <div className="max-w-xl mx-auto p-6 bg-white dark:bg-gray-800 shadow-xl rounded-lg mt-10">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">Tạo Thông Báo Mới</h2>
            
            {/* Status Message */}
            {status.message && (
                <div 
                    className={`p-4 mb-4 border-l-4 rounded ${getStatusClasses(status.type)} flex items-center`} 
                    role="alert"
                >
                    {status.type === 'success' ? <CheckCircle className="w-5 h-5 mr-3" /> : <AlertTriangle className="w-5 h-5 mr-3" />}
                    <p className="font-medium">{status.message}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Notification Type (Dropdown) */}
                <div>
                    <label htmlFor="notiType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Loại Thông Báo (NotiType)
                    </label>
                    <select
                        id="notiType"
                        name="notiType"
                        value={formData.notiType}
                        onChange={handleChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                        <option value="Activities">activities (Hoạt Động)</option>
                        <option value="News">news (Tin Tức)</option>
                    </select>
                </div>

                {/* 🎯 TARGET USER ID INPUT FIELD */}
                <div>
                    <label htmlFor="targetUserId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        ID Người Nhận (Target User ID)
                    </label>
                    <input
                        type="text"
                        id="targetUserId"
                        name="targetUserId"
                        value={formData.targetUserId}
                        onChange={handleChange}
                        placeholder="e.g., user-123"
                        required
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                
                {/* Sender Role (Read-only for manager example) */}
                <div>
                    <label htmlFor="senderRole" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Vai Trò Người Gửi (Sender Role)
                    </label>
                    <input
                        type="text"
                        id="senderRole"
                        name="senderRole"
                        value={formData.senderRole}
                        readOnly
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 cursor-not-allowed"
                    />
                </div>

                {/* Title */}
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Tiêu Đề (Title)
                    </label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="An important system alert"
                        required
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* Message */}
                <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Nội Dung Tin Nhắn (Message)
                    </label>
                    <textarea
                        id="message"
                        name="message"
                        rows="4"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="This is the main content of the notification."
                        required
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 dark:focus:ring-offset-gray-800"
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Đang gửi...
                        </>
                    ) : (
                        <>
                            <Send className="w-5 h-5 mr-2" />
                            Gửi Thông Báo
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}