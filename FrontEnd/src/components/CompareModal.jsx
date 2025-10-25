// src/components/CompareModal.jsx
import React, { useEffect, useState, useCallback } from "react";
import {
    getCompareList,
    removeFromCompare,
    clearCompare,
} from "../utils/compareUtils";
import { motion, AnimatePresence } from "framer-motion";

const EmptySlot = () => <div className="h-[170px] rounded-xl bg-gray-200/60" />;

export default function CompareModal() {
    const [open, setOpen] = useState(false);
    const [list, setList] = useState([]);

    const refresh = useCallback(() => {
        setList(getCompareList());
    }, []);

    // ✅ Lắng nghe event mở modal
    useEffect(() => {
        const onOpen = () => {
            if (window.location.pathname === "/compare") return;
            refresh();
            setOpen(true);
        };

        window.addEventListener("compare:openModal", onOpen);
        return () => window.removeEventListener("compare:openModal", onOpen);
    }, [refresh]);

    // ✅ Thêm: ẩn modal khi điều hướng sang trang compare (hoặc có event sync)
    useEffect(() => {
        const onSync = () => setOpen(false);
        window.addEventListener("compare:sync", onSync);
        return () => window.removeEventListener("compare:sync", onSync);
    }, []);

    // ✅ Không return trước hook
    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[70] bg-black/40 grid place-items-center p-4"
                    onClick={() => setOpen(false)}
                >
                    <motion.div
                        initial={{ scale: 0.96, y: 12, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.96, y: 12, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="w-[min(900px,95vw)] rounded-2xl bg-white shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* header */}
                        <div className="px-6 pt-5 pb-3 flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Your comparisons</h3>
                            <button
                                className="text-gray-500 hover:text-gray-900"
                                onClick={() => setOpen(false)}
                                aria-label="Close"
                            >
                                ✕
                            </button>
                        </div>

                        {/* body */}
                        <div className="px-6 pb-5">
                            <div className="rounded-xl bg-gray-100 p-3">
                                <div className="grid grid-cols-3 gap-3">
                                    {[0, 1, 2].map((i) => {
                                        const it = list[i];
                                        return it ? (
                                            <div
                                                key={it.itemId}
                                                className="relative rounded-xl bg-white shadow-sm hover:shadow-md transition-all p-3"
                                            >
                                                <button
                                                    title="Remove"
                                                    onClick={() => {
                                                        removeFromCompare(it.itemId);
                                                        refresh();
                                                    }}
                                                    className="absolute top-2 left-2 text-gray-500 hover:text-red-500"
                                                >
                                                    🗑
                                                </button>

                                                <div className="h-[88px] w-full rounded-lg overflow-hidden mb-2">
                                                    <img
                                                        src={it.imageUrl}
                                                        alt={it.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>

                                                <div className="text-2xl font-extrabold">
                                                    {it.price?.toLocaleString("vi-VN")}đ
                                                </div>
                                                <div className="text-[13px] text-gray-600 mt-1 line-clamp-2">
                                                    {it.name}
                                                </div>
                                            </div>
                                        ) : (
                                            <EmptySlot key={i} />
                                        );
                                    })}
                                </div>
                            </div>

                            {/* footer */}
                            <div className="mt-4 flex items-center justify-between">
                                <button
                                    onClick={() => {
                                        clearCompare();
                                        refresh();
                                        setOpen(false);
                                    }}
                                    className="text-sm text-gray-600 hover:text-gray-900"
                                >
                                    Close and Clear List
                                </button>

                                <button
                                    onClick={() => {
                                        // 🔥 NEW: phát event để trang compare sync dữ liệu
                                        window.dispatchEvent(new Event("compare:sync"));
                                        setOpen(false);
                                        setTimeout(() => {
                                            window.location.href = "/compare";
                                        }, 250);
                                    }}
                                    className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
                                >
                                    Compare <span>→</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
