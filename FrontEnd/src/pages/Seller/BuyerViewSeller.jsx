import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
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
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";


export default function BuyerViewSeller() {

    const { sellerId } = useParams();
    const token = localStorage.getItem("token");
    const [seller, setSeller] = useState(null);
    const [items, setItems] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [tab, setTab] = useState("active");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
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


    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [sRes, iRes, rRes] = await Promise.all([
                    fetch(`${baseURL}seller/${sellerId}`),
                    fetch(`${baseURL}item/seller/${sellerId}`),
                    fetch(`${baseURL}${sellerId}/reviews`),
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
        <div className="min-h-screen bg-[#FFF8EE]">
            {/* Breadcrumb */}
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
                                src={seller?.avatar || '/placeholder.png'}
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

                        {/* Contact info */}
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

                        {/* Button */}
                        <button className="w-full mt-5 bg-[#C99700] hover:bg-[#B68900] text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition">
                            <MessageCircle size={18} />
                            Nhắn tin cho người bán
                        </button>
                    </div>
                </div>

                {/* Sản phẩm */}
                <div className="md:col-span-2">
                    <div className="bg-white border border-[#F0E2B6] rounded-2xl shadow-sm p-6">
                        {/* Tabs */}
                        <div className="flex gap-6 border-b border-[#F0E2B6] mb-6">
                            {["active", "sold"].map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setTab(t)}
                                    className={`pb-3 px-1 font-semibold text-sm transition ${tab === t
                                        ? "text-[#C99700] border-b-2 border-[#C99700]"
                                        : "text-gray-600 hover:text-gray-800"
                                        }`}
                                >
                                    {t === "active" ? "Đang bán" : "Đã bán"} (
                                    {items.filter((x) => x.status === t).length || 0})
                                </button>
                            ))}
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
                                        state={item.itemId}
                                        className="group bg-white border border-[#F0E2B6] rounded-xl overflow-hidden hover:shadow-md transition"
                                    >
                                        <div className="relative">
                                            {/* Hiển thị carousel nếu có nhiều ảnh */}
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

                                            {/* Badge trạng thái */}
                                            <span
                                                className={`absolute top-2 left-2 px-2 py-1 text-xs font-semibold rounded-md text-white shadow-sm ${item.status === "active" ? "bg-[#C99700]" : "bg-gray-500"
                                                    }`}
                                            >
                                                {item.status === "active" ? "Đang bán" : "Đã bán"}
                                            </span>


                                        </div>

                                        {/* Nội dung */}
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
                    </div>
                </div>
            </div>
        </div>
    );
}