// src/components/CompareToast.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getCompareList, clearCompare } from "../utils/compareUtils";
import { CheckCircle, XCircle } from "lucide-react";

export default function CompareToast() {
    const [count, setCount] = useState(0);
    const [visible, setVisible] = useState(false);
    const [type, setType] = useState(null);
    const navigate = useNavigate();
    const max = 3;

    // 🧩 Làm mới danh sách
    const refresh = useCallback(() => {
        const list = getCompareList();
        setCount(list.length);
        setType(list[0]?.itemType || null);

        // 🔥 Không hiển thị toast khi đang ở trang compare
        if (window.location.pathname === "/compare") {
            setVisible(false);
            return;
        }

        setVisible(list.length > 0);
    }, []);

    // ⚙️ Lắng nghe thay đổi compareList
    useEffect(() => {
        refresh();
        const sync = () => refresh();

        window.addEventListener("compare:added", sync);
        window.addEventListener("compare:removed", sync);
        window.addEventListener("compare:cleared", sync);

        return () => {
            window.removeEventListener("compare:added", sync);
            window.removeEventListener("compare:removed", sync);
            window.removeEventListener("compare:cleared", sync);
        };
    }, [refresh]);

    // 🚫 Nếu không có gì → không render
    if (!visible) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[60] backdrop-blur-sm bg-gray-900/90 text-white shadow-lg border-b border-gray-800">
            <div className="max-w-7xl mx-auto px-5 py-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-7 w-7 rounded-full bg-green-500/20 flex items-center justify-center">
                        <CheckCircle size={18} className="text-green-400" />
                    </div>

                    <span className="font-medium text-sm sm:text-base">
                        Đã thêm {count} / {max}{" "}
                        <span className="text-indigo-300">
                            {type === "battery"
                                ? "pin vào danh sách so sánh"
                                : "xe vào danh sách so sánh"}
                        </span>
                    </span>

                    {/* 🔹 Nút xem so sánh */}
                    <button
                        onClick={() => {
                            // 🔥 Gửi event mở modal (CompareModal đã lắng nghe)
                            window.dispatchEvent(new CustomEvent("compare:openModal"));
                        }}
                        className="ml-3 text-indigo-400 hover:text-white underline text-sm sm:text-base transition"
                    >
                        Xem danh sách so sánh
                    </button>
                </div>

                {/* 🔹 Nút xóa toàn bộ */}
                <button
                    onClick={() => {
                        clearCompare();
                        setVisible(false);
                    }}
                    title="Xóa danh sách"
                    className="flex items-center gap-1 text-gray-400 hover:text-red-400 transition text-sm"
                >
                    <XCircle size={16} />
                    <span className="hidden sm:inline">Xóa</span>
                </button>
            </div>
        </div>
    );
}
