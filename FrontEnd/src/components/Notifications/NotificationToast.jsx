import React, { useEffect } from "react";
import { X, Bell, CheckCircle, AlertTriangle, AlertCircle } from "lucide-react";

const typeConfig = {
  info: {
    icon: Bell,
    color: "text-blue-500",
    bg: "bg-blue-50 border-blue-200",
  },
  success: {
    icon: CheckCircle,
    color: "text-green-500",
    bg: "bg-green-50 border-green-200",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-yellow-500",
    bg: "bg-yellow-50 border-yellow-200",
  },
  error: {
    icon: AlertCircle,
    color: "text-red-500",
    bg: "bg-red-50 border-red-200",
  },
};

const NotificationToast = ({ notification, onClose, duration = 4000 }) => {
  const { content, type = "info" } = notification;
  const cfg = typeConfig[type] || typeConfig.info;
  const Icon = cfg.icon;

  // Auto close after duration
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div
      className={`
        ${cfg.bg} border rounded-lg shadow-lg p-4 max-w-sm w-full mb-3
        animate-slide-in-right
        transition-transform duration-300 ease-out
      `}
      role="alert"
    >
      <div className="flex items-start">
        <div className={`flex-shrink-0 mr-3 ${cfg.color}`}>
          <Icon className="h-5 w-5" />
        </div>

        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">
            Thông báo mới
          </p>
          <p className="mt-1 text-sm text-gray-600 leading-snug">
            {content}
          </p>
        </div>

        <button
          onClick={onClose}
          className="ml-4 text-gray-400 hover:text-gray-600 focus:outline-none"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default NotificationToast;
