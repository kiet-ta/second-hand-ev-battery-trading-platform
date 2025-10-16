import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    Mail,
    Phone,
    MapPin,
    MessageCircle,
    Star,
    Heart,
    MapPinIcon,
    Loader2,
    AlertCircle,
} from "lucide-react";

export default function BuyerViewSeller() {
    const sellerId = 2;
    const token = localStorage.getItem("token");
    const [seller, setSeller] = useState(null);
    const [items, setItems] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [tab, setTab] = useState("active");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [sRes, iRes, rRes] = await Promise.all([
                    fetch(`https://localhost:7272/api/seller/${sellerId}`),
                    fetch(`https://localhost:7272/api/item/seller/${sellerId}`),
                    fetch(`https://localhost:7272/api/${sellerId}/reviews`),
                ]);

                const sellerData = await sRes.json();
                const itemData = await iRes.json();
                const reviewData = await rRes.json();

                setSeller(sellerData);
                setItems(itemData);
                setReviews(reviewData);
            } catch (e) {
                console.error(e);
                setError("Không thể tải dữ liệu người bán");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [sellerId]);

    const filteredItems = items.filter(
        (x) =>
            (tab === "active" && x.status === "active") ||
            (tab === "sold" && x.status === "sold")
    );

    if (loading)
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <Loader2 className="animate-spin text-[#4F39F6]" size={40} />
            </div>
        );

    if (error)
        return (
            <div className="flex items-center justify-center h-screen">
                <AlertCircle className="text-red-500 mr-2" />
                <p>{error}</p>
            </div>
        );

    return (
        <div className="min-h-screen bg-[#F8FFFA]">
            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-200 shadow-sm relative z-10 !opacity-100 !visible">
                <div className="max-w-7xl mx-auto px-4 py-3 text-sm text-gray-600 flex gap-2 items-center">
                    <Link
                        to="/"
                        className="!text-[#4F39F6] hover:!text-[#3a2fd0] font-semibold hover:underline"
                    >
                        Cóc Mua Xe
                    </Link>

                    <span className="text-gray-400">›</span>
                    <span className="font-medium text-gray-800">
                        Trang cá nhân của {seller?.fullName}
                    </span>
                </div>
            </div>



            {/* Layout */}
            <div className="max-w-7xl mx-auto px-4 py-8 grid md:grid-cols-3 gap-6">
                {/* Seller Info */}
                <div className="md:col-span-1">
                    <div className="bg-white rounded-xl shadow-md border p-6 sticky top-6">
                        <div className="flex flex-col items-center text-center">
                            <img
                                src={seller?.avatarProfile || "https://i.pravatar.cc/150?img=5"}
                                className="w-24 h-24 rounded-full border-2 border-gray-200"
                            />
                            <h2 className="text-xl font-bold mt-2 text-gray-800">
                                {seller?.fullName}
                            </h2>
                            <p className="text-gray-600 text-sm mt-1">
                                {seller?.bio || "Chưa có mô tả cá nhân"}
                            </p>
                            <div className="flex items-center gap-1 mt-2">
                                {[...Array(Math.round(seller?.rating || 5))].map((_, i) => (
                                    <Star key={i} size={14} fill="#FFC000" />
                                ))}
                                <span className="text-sm text-gray-700">
                                    {seller?.rating?.toFixed(1) || "5.0"} / 5.0
                                </span>
                            </div>
                        </div>

                        <div className="mt-5 text-sm space-y-3 text-gray-700">
                            <div className="flex items-center gap-2">
                                <Mail size={16} /> {seller?.email}
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone size={16} /> {seller?.phone || "Chưa cập nhật"}
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin size={16} /> {seller?.address || "Không rõ"}
                            </div>
                            <p className="text-gray-500 mt-3">
                                Tham gia từ{" "}
                                <span className="font-medium">
                                    {new Date(seller?.createdAt).toLocaleDateString("vi-VN")}
                                </span>
                            </p>
                        </div>

                        <button className="w-full mt-5 bg-[#4F39F6] hover:bg-[#4330d4] text-white font-semibold py-2 rounded-lg flex items-center justify-center gap-2">
                            <MessageCircle size={18} />
                            Nhắn tin cho người bán
                        </button>
                    </div>
                </div>

                {/* Product Section */}
                <div className="md:col-span-2">
                    <div className="bg-white border rounded-xl shadow-sm p-6">
                        {/* Tabs */}
                        <div className="flex gap-6 border-b border-gray-200 mb-6">
                            <button
                                onClick={() => setTab("active")}
                                className={`pb-3 font-semibold text-sm ${tab === "active"
                                    ? "text-[#4F39F6] border-b-2 border-[#4F39F6]"
                                    : "text-gray-600 hover:text-gray-800"
                                    }`}
                            >
                                Đang bán (
                                {items.filter((x) => x.status === "active").length || 0})
                            </button>
                            <button
                                onClick={() => setTab("sold")}
                                className={`pb-3 font-semibold text-sm ${tab === "sold"
                                    ? "text-[#4F39F6] border-b-2 border-[#4F39F6]"
                                    : "text-gray-600 hover:text-gray-800"
                                    }`}
                            >
                                Đã bán (
                                {items.filter((x) => x.status === "sold").length || 0})
                            </button>
                        </div>

                        {/* Product list */}
                        {filteredItems.length === 0 ? (
                            <div className="text-center text-gray-500 py-10">
                                {tab === "active"
                                    ? "Chưa có sản phẩm đang bán."
                                    : "Chưa có sản phẩm đã bán."}
                            </div>
                        ) : (
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                {filteredItems.map((item) => (
                                    <Link
                                        key={item.itemId}
                                        to={`/ev/${item.itemId}`}
                                        state={item.itemId} // ✅ gửi id giống homepage
                                        className="block bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition group cursor-pointer"
                                    >
                                        <div className="relative">
                                            <img
                                                src={item.imageUrl || "https://via.placeholder.com/300x200?text=No+Image"}
                                                alt={item.title}
                                                className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                            {/* Trạng thái xe */}
                                            {item.status === "active" && (
                                                <span className="absolute top-2 left-2 bg-[#4F39F6] text-white text-xs font-semibold px-2 py-1 rounded-md shadow-sm">
                                                    Đang bán
                                                </span>
                                            )}
                                            {item.status === "sold" && (
                                                <span className="absolute top-2 left-2 bg-gray-500 text-white text-xs font-semibold px-2 py-1 rounded-md shadow-sm">
                                                    Đã bán
                                                </span>
                                            )}
                                            {/* Icon tim (yêu thích) */}
                                            <button
                                                onClick={(e) => e.preventDefault()} // ✅ chặn Link khi bấm tim
                                                className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:scale-110 transition"
                                            >
                                                <Heart size={16} className="text-gray-500" />
                                            </button>
                                        </div>

                                        <div className="p-3">
                                            <h4
                                                className="font-semibold text-gray-900 text-sm line-clamp-2 group-hover:text-[#4F39F6] transition-colors"
                                                title={item.title}
                                            >
                                                {item.title}
                                            </h4>
                                            <p className="text-[#4F39F6] font-bold mt-1">
                                                {(item.price / 1000000).toFixed(1)}M
                                            </p>
                                            <div className="flex items-center text-gray-500 text-xs mt-1 gap-1">
                                                <MapPinIcon size={12} /> {item.location}
                                            </div>
                                            <p className="text-gray-400 text-xs mt-1">
                                                {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>

                        )}
                    </div>

                    {/* Reviews */}
                    {reviews.length > 0 && (
                        <div className="bg-white rounded-xl border shadow-sm mt-6 p-6">
                            <h3 className="font-bold text-gray-800 mb-3">
                                Đánh giá người bán ({reviews.length})
                            </h3>
                            {reviews.map((r, i) => (
                                <div
                                    key={i}
                                    className="border-b border-gray-100 py-3 last:border-none"
                                >
                                    <p className="font-medium text-gray-900">{r.buyerName}</p>
                                    <p className="text-sm text-gray-600 mt-1">{r.comment}</p>
                                    <div className="flex gap-1 mt-1">
                                        {[...Array(r.rating)].map((_, j) => (
                                            <Star
                                                key={j}
                                                size={14}
                                                fill="#FFC000"
                                                className="text-yellow-400"
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
