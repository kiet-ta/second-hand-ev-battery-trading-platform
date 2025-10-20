// src/components/NotificationToast.jsx
import React from 'react';
import { X, Bell } from 'lucide-react';

const NotificationToast = ({ notification, onClose }) => {
  // Assuming 'notification' is an object { id, content, type, ... }
  return (
    <div 
      className="
        bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
        rounded-lg shadow-xl p-4 max-w-sm w-full
        transition-all duration-300 ease-out transform
        animate-slide-in-right 
      "
      role="alert"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 text-blue-500 mr-3">
          <Bell className="h-5 w-5" />
        </div>
        
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            Thông báo mới
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 leading-snug">
            {notification.content}
          </p>
        </div>

        <div className="ml-4 flex-shrink-0 flex">
          <button
            onClick={onClose}
            className="inline-flex text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
          >
            <span className="sr-only">Đóng</span>
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationToast;