import React, { useEffect, useMemo, useState } from "react";
import {
    getCompareList,
    removeFromCompare,
    clearCompare,
} from "../utils/compareUtils";
import { motion, AnimatePresence } from "framer-motion";
import AddCompareModal from "../components/AddCompareModal";

export default function CompareEVPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [introGlow, setIntroGlow] = useState(true);
    const [openAddModal, setOpenAddModal] = useState(false);
    const BASE = import.meta.env.VITE_API_BASE_URL;

    const fetchCompareItems = async () => {
        try {
            const list = getCompareList();
            if (!list.length) {
                setItems([]);
                setLoading(false);
                return;
            }

            const results = await Promise.all(
                list.map(async (it) => {
                    try {
                        const res = await fetch(`${BASE}item/with-detail/${it.itemId}`);
                        if (!res.ok) throw new Error("API error");
                        const data = await res.json();

                        return {
                            ...data,
                            imageUrl:
                                data.itemImage?.[0]?.imageUrl ||
                                it.imageUrl ||
                                "https://placehold.co/400x300",
                        };
                    } catch (err) {
                        console.error("❌ Lỗi khi fetch item:", err);
                        return null;
                    }
                })
            );

            setItems(results.filter(Boolean));
        } catch (err) {
            console.error("Lỗi fetchCompareItems:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCompareItems();
        const shown = sessionStorage.getItem("comparePageIntroPlayed");
        if (!shown) {
            sessionStorage.setItem("comparePageIntroPlayed", "true");
            setTimeout(() => setIntroGlow(false), 2500);
        } else setIntroGlow(false);
    }, []);

    useEffect(() => {
        const sync = () => fetchCompareItems();
        window.addEventListener("compare:removed", sync);
        window.addEventListener("compare:cleared", sync);
        window.addEventListener("compare:added", sync);
        window.addEventListener("compare:sync", sync);
        return () => {
            window.removeEventListener("compare:removed", sync);
            window.removeEventListener("compare:cleared", sync);
            window.removeEventListener("compare:added", sync);
            window.removeEventListener("compare:sync", sync);
        };
    }, []);

    const handleRemove = (id) => {
        removeFromCompare(id);
        fetchCompareItems();
    };

    const handleClear = () => {
        clearCompare();
        setItems([]);
    };

    const itemType = items[0]?.itemType || null;

    const sections = useMemo(() => {
        if (!items.length) return [];

        const a = items[0],
            b = items[1],
            c = items[2];
        const V = (get) => [a && get(a), b && get(b), c && get(c)];

        if (itemType === "ev") {
            return [
                {
                    title: "Tổng quan",
                    rows: [
                        { label: "Tên xe", values: V((x) => x.title) },
                        { label: "Hãng", values: V((x) => x.evDetail?.brand) },
                        { label: "Model", values: V((x) => x.evDetail?.model) },
                        { label: "Phiên bản", values: V((x) => x.evDetail?.version) },
                        {
                            label: "Giá bán",
                            values: V((x) => x.price?.toLocaleString("vi-VN") + " ₫"),
                        },
                        { label: "Năm sản xuất", values: V((x) => x.evDetail?.year) },
                        { label: "Kiểu dáng", values: V((x) => x.evDetail?.bodyStyle) },
                    ],
                },
                {
                    title: "Thông số kỹ thuật",
                    rows: [
                        {
                            label: "Số km đã đi",
                            values: V((x) =>
                                x.evDetail?.mileage
                                    ? x.evDetail.mileage.toLocaleString("vi-VN") + " km"
                                    : "—"
                            ),
                        },
                        { label: "Màu sắc", values: V((x) => x.evDetail?.color) },
                        { label: "Biển số", values: V((x) => x.evDetail?.licensePlate) },
                        {
                            label: "Phụ kiện kèm theo",
                            values: V((x) => (x.evDetail?.hasAccessories ? "Có" : "Không")),
                        },
                        {
                            label: "Đăng kiểm hợp lệ",
                            values: V((x) =>
                                x.evDetail?.isRegistrationValid
                                    ? "✔️ Còn hiệu lực"
                                    : "❌ Hết hạn"
                            ),
                        },
                    ],
                },
                {
                    title: "Lịch sử & mô tả",
                    rows: [
                        {
                            label: "Số chủ sở hữu trước",
                            values: V((x) => x.evDetail?.previousOwners),
                        },
                        { label: "Mô tả", values: V((x) => x.description) },
                        {
                            label: "Ngày đăng",
                            values: V((x) =>
                                x.createdAt
                                    ? new Date(x.createdAt).toLocaleDateString("vi-VN")
                                    : "—"
                            ),
                        },
                    ],
                },
            ];
        }

        if (itemType === "battery") {
            return [
                {
                    title: "Tổng quan",
                    rows: [
                        { label: "Tên pin", values: V((x) => x.title) },
                        { label: "Hãng sản xuất", values: V((x) => x.batteryDetail?.brand) },
                        {
                            label: "Giá bán",
                            values: V((x) => x.price?.toLocaleString("vi-VN") + " ₫"),
                        },
                        { label: "Số lượng còn", values: V((x) => x.quantity) },
                    ],
                },
                {
                    title: "Thông số kỹ thuật",
                    rows: [
                        { label: "Dung lượng", values: V((x) => x.batteryDetail?.capacity + " kWh") },
                        { label: "Điện áp", values: V((x) => x.batteryDetail?.voltage + " V") },
                        { label: "Chu kỳ sạc", values: V((x) => x.batteryDetail?.chargeCycles) },
                    ],
                },
                {
                    title: "Thông tin thêm",
                    rows: [
                        { label: "Mô tả", values: V((x) => x.description) },
                        {
                            label: "Ngày đăng",
                            values: V((x) =>
                                x.createdAt
                                    ? new Date(x.createdAt).toLocaleDateString("vi-VN")
                                    : "—"
                            ),
                        },
                    ],
                },
            ];
        }

        return [];
    }, [items, itemType]);

    if (loading)
        return (
            <div className="min-h-[60vh] grid place-items-center text-gray-500">
                Đang tải dữ liệu...
            </div>
        );

    if (!items.length)
        return (
            <div className="min-h-[60vh] grid place-items-center text-gray-600">
                <p className="text-lg font-medium">Chưa có sản phẩm nào để so sánh.</p>
            </div>
        );

    return (
        <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            className={`min-h-screen bg-[#FAF8F4] ${introGlow ? "ring-8 ring-indigo-300/40 ring-offset-2" : ""
                }`}
        >
            {/* HEADER */}
            <div className="sticky top-0 z-30 bg-[#FAF8F4] px-8 py-5 flex items-center justify-between shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        So sánh {itemType === "battery" ? "Pin" : "Xe điện"}
                    </h1>
                    <p className="text-sm text-gray-500">
                        Dữ liệu thực tế từ chi tiết sản phẩm
                    </p>
                </div>
                <button
                    onClick={handleClear}
                    className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-600 text-sm"
                >
                    Xoá tất cả
                </button>
            </div>

            {/* HERO CARDS */}
            <div className="max-w-7xl mx-auto mt-10 px-6 grid grid-cols-[200px_repeat(3,minmax(0,1fr))] gap-6">
                <div /> {/* nhãn trống */}
                <AnimatePresence>
                    {items.map((it, idx) => (
                        <motion.div
                            key={it.itemId}
                            initial={{ opacity: 0, y: 30, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 30, scale: 0.92 }}
                            transition={{ duration: 0.35, delay: idx * 0.1 }}
                            className="relative bg-white rounded-2xl border border-gray-200 shadow hover:shadow-md transition p-5 flex flex-col"
                        >
                            <button
                                onClick={() => handleRemove(it.itemId)}
                                className="absolute top-3 right-3 text-gray-400 hover:text-red-500"
                            >
                                ✕
                            </button>

                            <img
                                src={it.imageUrl}
                                alt={it.title}
                                className="w-full h-40 object-contain mb-4"
                            />
                            <div className="text-lg font-semibold text-gray-800 line-clamp-1 mb-1">
                                {it.title}
                            </div>
                            <div className="text-sm text-gray-500 mb-2">
                                {itemType === "battery"
                                    ? it.batteryDetail?.brand || "Không rõ hãng"
                                    : it.evDetail?.brand || "Không rõ hãng"}
                            </div>
                            <div className="text-xl font-bold text-[#D4AF37]">
                                {it.price?.toLocaleString("vi-VN")} ₫
                            </div>
                            <div className="mt-3">
                                <span className="text-xs px-2 py-1 bg-gray-100 rounded-md text-gray-600">
                                    {it.itemType?.toUpperCase() || "UNKNOWN"}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Ô thêm sản phẩm mới */}
                {items.length < 3 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-white/60 text-gray-500 hover:border-indigo-400 hover:text-indigo-500 transition cursor-pointer"
                        onClick={() => setOpenAddModal(true)}
                    >
                        <div className="flex flex-col items-center py-12">
                            <div className="text-4xl font-bold mb-2">＋</div>
                            <p className="text-sm font-medium">
                                Thêm {itemType === "battery" ? "pin" : "xe"} mới
                            </p>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* BẢNG SO SÁNH */}
            <motion.div
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="max-w-7xl mx-auto mt-10 mb-20 bg-white rounded-2xl shadow border border-gray-200 overflow-hidden"
            >
                {sections.map((sec, i) => (
                    <div key={i}>
                        <div className="bg-gray-100 px-6 py-3 font-semibold text-gray-700 text-lg border-b">
                            {sec.title}
                        </div>
                        {sec.rows.map((row, j) => (
                            <div
                                key={j}
                                className="grid grid-cols-[200px_repeat(3,minmax(0,1fr))] gap-6 px-6 py-3 border-b hover:bg-gray-50 transition"
                            >
                                <div className="text-sm text-gray-500 font-medium">
                                    {row.label}
                                </div>
                                {row.values.map((v, k) => (
                                    <div key={k} className="text-sm font-semibold text-gray-800">
                                        {v ?? "—"}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                ))}
            </motion.div>

            <AddCompareModal
                open={openAddModal}
                onClose={() => setOpenAddModal(false)}
                BASE={BASE}
            />
        </motion.div>
    );
}
