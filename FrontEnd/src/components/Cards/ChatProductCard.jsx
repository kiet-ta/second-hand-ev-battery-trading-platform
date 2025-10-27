import React, { useEffect } from "react";

export default function ChatProductCard({ item, onClose, duration = 5000 }) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed top-20 right-5 z-50 w-72 bg-white shadow-lg rounded-lg overflow-hidden border">
      <div className="flex items-center p-3 border-b">
        <h4 className="font-semibold text-indigo-600 text-sm">Người mua quan tâm</h4>
        <button
          onClick={onClose}
          className="ml-auto text-gray-400 hover:text-gray-600 font-bold"
        >
          ×
        </button>
      </div>
      <div className="p-3 flex space-x-3">
        <img
          src={item.imageUrl}
          alt={item.title}
          className="w-16 h-16 object-cover rounded-lg"
        />
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <p className="font-semibold">{item.title}</p>
            <p className="text-sm text-gray-500">{item.note}</p>
          </div>
          <p className="text-indigo-600 font-bold">{item.price.toLocaleString("vi-VN")}₫</p>
        </div>
      </div>
    </div>
  );
}
