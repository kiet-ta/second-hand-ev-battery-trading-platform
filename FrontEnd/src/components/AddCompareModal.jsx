import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { addToCompare, getCompareList } from "../utils/compareUtils";
import {
    Search,
    SlidersHorizontal,
    ArrowUpDown,
    RotateCcw,
    X,
} from "lucide-react";

export default function AddCompareModal({ open, onClose, BASE }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const [priceRange, setPriceRange] = useState([0, 2000000000]);
    const [yearRange, setYearRange] = useState([2015, 2025]);
    const [sortOption, setSortOption] = useState("default");

    useEffect(() => {
        if (!open) return;
        const fetchItems = async () => {
            try {
                const res = await fetch(`${BASE}item/detail/all`);
                const data = await res.json();

                const existing = getCompareList();
                const existingIds = existing.map((x) => x.itemId);

                const filtered = data.filter(
                    (it) => !existingIds.includes(it.itemId)
                );
                setItems(filtered);
            } catch (err) {
                console.error("❌ Lỗi khi tải danh sách xe/pin:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchItems();
    }, [open]);

    const filteredItems = useMemo(() => {
        const keyword = search.toLowerCase().trim();

        let result = items.filter((it) => {
            const price = it.price || 0;
            const year =
                it.evDetail?.year ||
                (it.batteryDetail ? 2020 : 0);

            const matchesKeyword =
                !keyword ||
                it.title?.toLowerCase().includes(keyword) ||
                it.evDetail?.brand?.toLowerCase().includes(keyword) ||
                it.batteryDetail?.brand?.toLowerCase().includes(keyword);

            const matchesPrice =
                price >= priceRange[0] && price <= priceRange[1];

            const matchesYear =
                year >= yearRange[0] && year <= yearRange[1];

            return matchesKeyword && matchesPrice && matchesYear;
        });

        switch (sortOption) {
            case "price-asc":
                result.sort((a, b) => (a.price || 0) - (b.price || 0));
                break;
            case "price-desc":
                result.sort((a, b) => (b.price || 0) - (a.price || 0));
                break;
            case "year-desc":
                result.sort(
                    (a, b) =>
                        (b.evDetail?.year || 0) - (a.evDetail?.year || 0)
                );
                break;
            case "year-asc":
                result.sort(
                    (a, b) =>
                        (a.evDetail?.year || 0) - (b.evDetail?.year || 0)
                );
                break;
            case "brand-az":
                result.sort((a, b) =>
                    (a.evDetail?.brand ||
                        a.batteryDetail?.brand ||
                        "").localeCompare(
                            b.evDetail?.brand || b.batteryDetail?.brand || ""
                        )
                );
                break;
            default:
                break;
        }

        return result;
    }, [items, search, priceRange, yearRange, sortOption]);

    const handleReset = () => {
        setSearch("");
        setPriceRange([0, 2000000000]);
        setYearRange([2015, 2025]);
        setSortOption("default");
    };

    const activeTags = useMemo(() => {
        const tags = [];
        if (search.trim() !== "") tags.push(`Từ khóa: "${search}"`);
        if (priceRange[0] > 0)
            tags.push(`Giá ≥ ${priceRange[0].toLocaleString("vi-VN")} ₫`);
        if (priceRange[1] < 2000000000)
            tags.push(`Giá ≤ ${priceRange[1].toLocaleString("vi-VN")} ₫`);
        if (yearRange[0] > 2015) tags.push(`Năm ≥ ${yearRange[0]}`);
        if (yearRange[1] < 2025) tags.push(`Năm ≤ ${yearRange[1]}`);
        if (sortOption !== "default") {
            const map = {
                "price-asc": "Giá thấp → cao",
                "price-desc": "Giá cao → thấp",
                "year-desc": "Năm mới → cũ",
                "year-asc": "Năm cũ → mới",
                "brand-az": "Hãng A → Z",
            };
            tags.push(`Sắp xếp: ${map[sortOption]}`);
        }
        return tags;
    }, [search, priceRange, yearRange, sortOption]);

    if (!open) return null;

    const currentCompareList = getCompareList();
    const currentType = currentCompareList[0]?.itemType;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-black/50 flex justify-center items-center p-6"
                onClick={onClose}
            >
                <motion.div
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 40, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white rounded-2xl shadow-xl w-[min(950px,95vw)] p-6 max-h-[85vh] overflow-y-auto"
                >
                    {/* HEADER */}
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                            <SlidersHorizontal size={20} className="text-[#D4AF37]" />
                            {currentType === "battery"
                                ? "Thêm pin vào so sánh"
                                : "Thêm xe vào so sánh"}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-800 text-lg"
                        >
                            ✕
                        </button>
                    </div>

                    {/* SEARCH + SORT + RESET */}
                    <div className="space-y-3 mb-4">
                        {/* Search + Sort */}
                        <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
                            <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 flex-1">
                                <Search size={18} className="text-gray-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(e.target.value)
                                    }
                                    placeholder="Tìm kiếm theo tên hoặc hãng..."
                                    className="flex-1 bg-transparent outline-none text-sm text-gray-700"
                                />
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <ArrowUpDown
                                        size={18}
                                        className="text-[#D4AF37]"
                                    />
                                    <select
                                        value={sortOption}
                                        onChange={(e) =>
                                            setSortOption(e.target.value)
                                        }
                                        className="border rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-[#D4AF37]/50 outline-none"
                                    >
                                        <option value="default">Mặc định</option>
                                        <option value="price-asc">
                                            Giá thấp → cao
                                        </option>
                                        <option value="price-desc">
                                            Giá cao → thấp
                                        </option>
                                        <option value="year-desc">
                                            Năm mới → cũ
                                        </option>
                                        <option value="year-asc">
                                            Năm cũ → mới
                                        </option>
                                        <option value="brand-az">
                                            Hãng A → Z
                                        </option>
                                    </select>
                                </div>

                                <button
                                    onClick={handleReset}
                                    className="flex items-center gap-1 text-sm px-3 py-1.5 bg-gray-100 rounded-md text-gray-600 hover:bg-gray-200 transition"
                                >
                                    <RotateCcw size={14} /> Reset
                                </button>
                            </div>
                        </div>

                        {/* TAG FILTERS */}
                        {activeTags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {activeTags.map((tag, i) => (
                                    <span
                                        key={i}
                                        className="flex items-center gap-1 bg-[#FFF5CC] text-[#B8860B] px-3 py-1 rounded-full text-xs font-medium border border-[#D4AF37]/30"
                                    >
                                        {tag}
                                        <X
                                            size={12}
                                            className="cursor-pointer hover:text-red-500"
                                            onClick={() => {
                                                if (tag.includes("Từ khóa"))
                                                    setSearch("");
                                                else if (tag.includes("Giá ≥"))
                                                    setPriceRange([
                                                        0,
                                                        priceRange[1],
                                                    ]);
                                                else if (tag.includes("Giá ≤"))
                                                    setPriceRange([
                                                        priceRange[0],
                                                        2000000000,
                                                    ]);
                                                else if (tag.includes("Năm ≥"))
                                                    setYearRange([
                                                        2015,
                                                        yearRange[1],
                                                    ]);
                                                else if (tag.includes("Năm ≤"))
                                                    setYearRange([
                                                        yearRange[0],
                                                        2025,
                                                    ]);
                                                else if (
                                                    tag.includes("Sắp xếp")
                                                )
                                                    setSortOption("default");
                                            }}
                                        />
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* DANH SÁCH SẢN PHẨM */}
                    {loading ? (
                        <div className="text-center py-10 text-gray-400">
                            Đang tải danh sách sản phẩm...
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">
                            Không có sản phẩm phù hợp với bộ lọc hiện tại.
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                            {filteredItems.map((it) => {
                                const isDifferentType =
                                    currentType &&
                                    it.itemType !== currentType;

                                return (
                                    <motion.div
                                        key={it.itemId}
                                        whileHover={{ scale: 1.02 }}
                                        className="rounded-xl border border-gray-200 bg-gray-50 hover:shadow-md transition overflow-hidden flex flex-col"
                                    >
                                        <img
                                            src={
                                                it.itemImage?.[0]?.imageUrl ||
                                                it.images?.[0]?.imageUrl
                                            }
                                            alt={it.title}
                                            className="w-full h-36 object-cover"
                                        />
                                        <div className="p-3 flex flex-col flex-1">
                                            <div className="font-semibold text-gray-800 line-clamp-1">
                                                {it.title}
                                            </div>
                                            <div className="text-sm text-gray-500 mb-1">
                                                {it.evDetail?.brand ||
                                                    it.batteryDetail?.brand ||
                                                    "—"}
                                            </div>
                                            <div className="text-[#D4AF37] font-bold mb-3">
                                                {it.price?.toLocaleString(
                                                    "vi-VN"
                                                )}{" "}
                                                ₫
                                            </div>

                                            {isDifferentType ? (
                                                <button
                                                    disabled
                                                    className="mt-auto w-full text-sm py-2 rounded-md bg-gray-200 text-gray-400 font-semibold cursor-not-allowed"
                                                >
                                                    ❌ Khác loại (Không thể thêm)
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        addToCompare(it);
                                                        onClose();
                                                    }}
                                                    className="w-full text-sm py-2 rounded-md bg-[#D4AF37] text-black font-semibold hover:bg-[#B8860B] transition"
                                                >
                                                    + Thêm vào so sánh
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
