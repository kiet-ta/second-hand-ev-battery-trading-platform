import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
    Mail,
    Phone,
    MapPin,
    MessageCircle,
    Star,
    Loader2,
    AlertCircle,
} from "lucide-react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import placeholder from "../../assets/images/placeholder.png";
import chatApi from "../../api/chatApi";

export default function BuyerViewSeller() {
    const { sellerId } = useParams();
    const [seller, setSeller] = useState(null);
    const [items, setItems] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [tab, setTab] = useState("Active");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [chatError, setChatError] = useState("");
    const navigate = useNavigate();
    const baseURL = import.meta.env.VITE_API_BASE_URL;

    const carouselSettings = {
        dots: true,
        infinite: true,
        speed: 400,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        arrows: false,
    };

    // ---- Handle Chat ----
    const handelChat = async () => {
        setChatError(""); // clear any old message
        const buyerId = localStorage.getItem("userId");

        if (!buyerId) {
            setChatError("⚠️ Vui lòng đăng nhập để nhắn tin với người bán.");
            return;
        }

        if (buyerId === sellerId) {
            setChatError("❌ Bạn không thể nhắn tin cho chính mình!");
            return;
        }

        try {
            setLoading(true);
            const room = await chatApi.createChatRoom(buyerId, sellerId);
            navigate("/profile/chats", {
                state: { chatRoomId: room.cid, receiverId: sellerId },
            });
        } catch (error) {
            console.error("Chat error:", error);
            setChatError("❌ Không thể mở cuộc trò chuyện, vui lòng thử lại sau.");
        } finally {
            setLoading(false);
        }
    };

    // ---- Fetch Seller Data ----
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError("");

                const [sRes, iRes, rRes] = await Promise.all([
                    fetch(`${baseURL}sellers/${sellerId}`),
                    fetch(`${baseURL}sellers/${sellerId}/item`),
                    fetch(`${baseURL}sellers/${sellerId}/reviews`),
                ]);

                if (!sRes.ok || !iRes.ok || !rRes.ok) {
                    throw new Error("Fetch failed");
                }

                const sellerData = await sRes.json();
                const itemData = await iRes.json();
                const reviewData = await rRes.json();

                setSeller(sellerData);
                setItems(itemData);
                setReviews(reviewData);
            } catch (e) {
                console.error("Fetch error:", e);
                setError("❌ Không thể tải dữ liệu người bán. Vui lòng thử lại sau.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [sellerId]);

    const filteredItems = items.filter(
        (x) =>
            (tab === "Active" && x.status === "Active") ||
            (tab === "sold" && x.status === "sold")
    );

    // ---- Loading / Error UI ----
    if (loading)
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <Loader2 className="animate-spin text-[#4F39F6]" size={40} />
            </div>
        );

    if (error)
        return (
            <div className="flex flex-col items-center justify-center h-screen text-center px-4">
                <AlertCircle className="text-red-500 mb-3" size={40} />
                <p className="text-red-600 font-medium">{error}</p>
            </div>
        );

    // ---- Main Layout ----
    return (
        <div className="min-h-screen bg-[#FFF8EE]">
            <div className="bg-[#FFF8EE] border-b border-[#FFF8EE] shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-3 text-sm flex items-center gap-2">
                    <Link
                        to="/"
                        className="text-[#C99700] font-semibold hover:underline"
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
            <div className="max-w-7xl mx-auto px-4 py-10 grid md:grid-cols-3 gap-8">
                {/* Seller Info */}
                <div className="md:col-span-1">
                    <div className="bg-white border border-[#F0E2B6] rounded-2xl shadow-sm p-6 sticky top-6 transition hover:shadow-md">
                        <div className="flex flex-col items-center text-center">
                            <img
                                src={seller?.avatar || placeholder}
                                className="w-24 h-24 rounded-full border-2 border-[#F0E2B6]"
                            />
                            <h2 className="text-xl font-bold mt-3 text-gray-900">
                                {seller?.fullName}
                            </h2>
                            <p className="text-gray-600 text-sm mt-1 italic">
                                {seller?.bio || "Bán EV & pin chính hãng"}
                            </p>

                            {/* Rating */}
                            <div className="flex items-center gap-1 mt-2">
                                {[...Array(Math.round(seller?.rating || 5))].map((_, i) => (
                                    <Star key={i} size={14} fill="#F1C40F" />
                                ))}
                                <span className="text-sm text-gray-700 ml-1">
                                    {seller?.rating?.toFixed(1) || "5.0"} / 5.0
                                </span>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="mt-5 text-sm space-y-3 text-gray-700">
                            <div className="flex items-center gap-2">
                                <Mail size={16} /> {seller?.email}
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone size={16} /> {seller?.phoneNumber || "Chưa cập nhật"}
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

                        {/* Chat Button */}
                        <button
                            onClick={handelChat}
                            className="w-full mt-5 bg-[#C99700] hover:bg-[#B68900] text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition"
                        >
                            <MessageCircle size={18} />
                            Nhắn tin cho người bán
                        </button>

                        {chatError && (
                            <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2 text-center">
                                {chatError}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sản phẩm */}
                <div className="md:col-span-2">
                    <div className="bg-white border border-[#F0E2B6] rounded-2xl shadow-sm p-6">
                        {/* Tabs */}
                        <div className="flex gap-6 border-b border-[#F0E2B6] mb-6">
                            {["Active", "sold"].map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setTab(t)}
                                    className={`pb-3 px-1 font-semibold text-sm transition ${tab === t
                                        ? "text-[#C99700] border-b-2 border-[#C99700]"
                                        : "text-gray-600 hover:text-gray-800"
                                        }`}
                                >
                                    {t === "Active" ? "Đang bán" : "Đã bán"} (
                                    {items.filter((x) => x.status === t).length || 0})
                                </button>
                            ))}
                        </div>

                        {/* Product List */}
                        {filteredItems.length === 0 ? (
                            <div className="text-center text-gray-500 py-10">
                                {tab === "Active"
                                    ? "Chưa có sản phẩm đang bán."
                                    : "Chưa có sản phẩm đã bán."}
                            </div>
                        ) : (
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                {filteredItems.map((item) => (
                                    <Link
                                        key={item.itemId}
                                        to={item.itemType == "Ev" ? `/ev/${item.itemId}` : `/battery/${item.itemId}`}
                                        state={item.itemId}
                                        className="group bg-white border border-[#F0E2B6] rounded-xl overflow-hidden hover:shadow-md transition"
                                    >

                                        <div className="relative">
                                            {Array.isArray(item.images) && item.images.length > 1 ? (
                                                <Slider {...carouselSettings}>
                                                    {item.images.map((img, index) => (
                                                        <div key={index}>
                                                            <img
                                                                src={img.imageUrl || img.url || img.path}
                                                                alt={`${item.title}-${index}`}
                                                                className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                                                            />
                                                        </div>
                                                    ))}
                                                </Slider>
                                            ) : (
                                                <img
                                                    src={
                                                        item.images?.[0]?.imageUrl ||
                                                        item.imageUrl ||
                                                        "https://via.placeholder.com/300x200?text=No+Image"
                                                    }
                                                    alt={item.title}
                                                    className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            )}
                                            <span
                                                className={`absolute top-2 left-2 px-2 py-1 text-xs font-semibold rounded-md text-white shadow-sm ${item.status === "Active"
                                                    ? "bg-[#C99700]"
                                                    : "bg-gray-500"
                                                    }`}
                                            >
                                                {item.status === "Active"
                                                    ? "Đang bán"
                                                    : "Đã bán"}
                                            </span>
                                        </div>

                                        <div className="p-3">
                                            <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 group-hover:text-[#C99700] transition">
                                                {item.title}
                                            </h4>
                                            <p className="text-[#C99700] font-bold mt-1">
                                                {(item.price / 1_000_000).toFixed(1)}M
                                            </p>
                                            <p className="text-gray-400 text-xs mt-1">
                                                {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* Review Section */}
                        <div className="bg-white border border-[#F0E2B6] rounded-2xl shadow-sm p-6 mt-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Star size={18} className="text-[#C99700]" />
                                Đánh giá của người mua ({reviews.length})
                            </h3>

                            {reviews.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">
                                    Chưa có đánh giá nào cho người bán này.
                                </p>
                            ) : (
                                <div className="space-y-5">
                                    {reviews.map((review) => (
                                        <div
                                            key={review.reviewId}
                                            className="border border-[#F0E2B6] rounded-xl p-4 hover:shadow-sm transition bg-[#FFFDF8]"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-semibold text-gray-800">
                                                        {review.buyerName}
                                                    </h4>
                                                    <p className="text-xs text-gray-500">
                                                        {new Date(
                                                            review.createdAt
                                                        ).toLocaleDateString("vi-VN")}
                                                    </p>
                                                </div>
                                                <div className="flex gap-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            size={14}
                                                            fill={
                                                                i < review.rating
                                                                    ? "#F1C40F"
                                                                    : "none"
                                                            }
                                                            stroke="#F1C40F"
                                                        />
                                                    ))}
                                                </div>
                                            </div>

                                            <p className="mt-2 text-gray-700 text-sm italic">
                                                “{review.comment}”
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
