import React, { useEffect, useState, useMemo, useCallback, memo } from "react";
import { Link, useNavigate } from "react-router-dom";
import Slider from "react-slick";
import {
    FiHeart,
    FiZap,
    FiShoppingCart,
    FiArrowRight,
    FiBarChart2,
} from "react-icons/fi";
import { message } from "antd";
import orderItemApi from "../../api/orderItemApi";
import favouriteApi from "../../api/favouriteApi";
import addressLocalApi from "../../api/addressLocalApi";
import {
    addToCompare,
    getCompareList,
    removeFromCompare,
} from "../../utils/compareUtils";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// ✅ Badge xác minh
const VerifiedCheck = ({ className = "" }) => (
    <div
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 ${className}`}
    >
        <svg
            className="-ml-0.5 mr-1.5 h-3 w-3 text-green-400"
            fill="currentColor"
            viewBox="0 0 20 20"
        >
            <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
            />
        </svg>
        Đã Duyệt
    </div>
);

function CardComponent({
    id,
    title,
    price = 0,
    itemImages,
    type,
    year,
    mileage = 0,
    isVerified = false,
    userFavorites = [],
}) {
    const navigate = useNavigate();
    const [isFavorited, setIsFavorited] = useState(false);
    const [favoriteId, setFavoriteId] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isCompared, setIsCompared] = useState(false);

    const userId = useMemo(() => localStorage.getItem("userId"), []);
    const displayImages = useMemo(
        () =>
            itemImages?.length
                ? itemImages
                : [{ imageUrl: "https://placehold.co/600x400/e2e8f0/e2e8f0?text=." }],
        [itemImages]
    );

    // ✅ Load trạng thái yêu thích & so sánh
    useEffect(() => {
        const fav = userFavorites.find((f) => f.itemId === id);
        setIsFavorited(!!fav);
        setFavoriteId(fav?.favId ?? null);
        setIsCompared(getCompareList().some((x) => x.itemId === id));
    }, [userFavorites, id]);

    useEffect(() => {
        const sync = () => setIsCompared(getCompareList().some((x) => x.itemId === id));
        window.addEventListener("compare:added", sync);
        window.addEventListener("compare:removed", sync);
        window.addEventListener("compare:cleared", sync);
        return () => {
            window.removeEventListener("compare:added", sync);
            window.removeEventListener("compare:removed", sync);
            window.removeEventListener("compare:cleared", sync);
        };
    }, [id]);

    // ✅ Slider
    const carouselSettings = useMemo(
        () => ({
            dots: true,
            infinite: true,
            speed: 500,
            slidesToShow: 1,
            slidesToScroll: 1,
            autoplay: true,
            arrows: false,
        }),
        []
    );

    // ✅ Thêm vào giỏ hàng
    const handleAddToCart = useCallback(
        async (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (isProcessing) return;
            setIsProcessing(true);
            try {
                const payload = { buyerId: userId, itemId: id, quantity: 1, price };
                await orderItemApi.postOrderItem(payload);
                message.success("Đã thêm sản phẩm vào giỏ hàng!");
            } catch (err) {
                console.error("Error adding item:", err);
                message.error("Không thể thêm vào giỏ hàng!");
            } finally {
                setIsProcessing(false);
            }
        },
        [id, price, userId, isProcessing]
    );

    // ✅ MUA NGAY
    const handleBuyNow = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        const userId = localStorage.getItem("userId");
        if (!userId) {
            message.warning("Vui lòng đăng nhập trước khi mua hàng!");
            navigate("/login");
            return;
        }

        setIsProcessing(true);
        try {
            // 1️⃣ Tạo OrderItem
            const orderItemPayload = {
                buyerId: userId,
                itemId: id,
                quantity: 1,
                price,
            };
            const createdOrderItem = await orderItemApi.postOrderItem(orderItemPayload);
            if (!createdOrderItem?.orderItemId)
                throw new Error("Không thể tạo OrderItem.");

            // 2️⃣ Lấy địa chỉ giao hàng
            const allAddresses = await addressLocalApi.getAddressByUserId(userId);
            const defaultAddress =
                allAddresses.find((a) => a.isDefault) || allAddresses[0];

            if (!defaultAddress) {
                message.warning("Vui lòng thêm địa chỉ giao hàng trong hồ sơ!");
                navigate("/profile/address");
                return;
            }

            // 3️⃣ Chuẩn hoá dữ liệu checkout
            const checkoutData = {
                source: "buyNow",
                totalAmount: price,
                orderItems: [
                    {
                        id: id,
                        name: title || "Sản phẩm",
                        price,
                        quantity: 1,
                        image:
                            itemImages?.[0]?.imageUrl ||
                            "https://placehold.co/100x100/e2e8f0/374151?text=?",
                    },
                ],
                allAddresses,
                selectedAddressId: defaultAddress.addressId,
            };

            // 4️⃣ Lưu vào localStorage để reload vẫn giữ dữ liệu
            localStorage.setItem("checkoutData", JSON.stringify(checkoutData));

            // 5️⃣ Điều hướng sang CheckoutPage
            navigate("/checkout/buy-now", { state: checkoutData });
        } catch (err) {
            console.error("❌ Lỗi mua ngay:", err);
            message.error("Không thể mua ngay. Vui lòng thử lại.");
        } finally {
            setIsProcessing(false);
        }
    };

    // ❤️ Yêu thích
    const handleFavoriteClick = useCallback(
        async (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (isProcessing) return;
            setIsProcessing(true);
            try {
                if (isFavorited && favoriteId) {
                    await favouriteApi.deleteFavourite(favoriteId);
                    setIsFavorited(false);
                    setFavoriteId(null);
                    message.info("Đã xoá khỏi danh sách yêu thích!");
                } else {
                    const res = await favouriteApi.postFavourite({
                        userId: parseInt(userId, 10),
                        itemId: id,
                        createdAt: new Date().toISOString(),
                    });
                    setIsFavorited(true);
                    setFavoriteId(res?.favId ?? null);
                    message.success("Đã thêm vào danh sách yêu thích!");
                }
            } catch (err) {
                console.error("Favourite failed:", err);
            } finally {
                setIsProcessing(false);
            }
        },
        [isFavorited, favoriteId, userId, id, isProcessing]
    );

    // 📊 So sánh
    const handleCompareClick = useCallback(
        (e) => {
            e.preventDefault();
            e.stopPropagation();

            const list = getCompareList();
            const already = list.some((x) => x.itemId === id);

            if (already) {
                removeFromCompare(id);
                setIsCompared(false);
                return;
            }

            if (list.length > 0 && list[0].itemType !== type) return;
            if (list.length >= 3) return;

            const itemData = {
                itemId: id,
                name: title,
                price,
                imageUrl: itemImages?.[0]?.imageUrl || "https://placehold.co/400x300",
                itemType: type,
            };
            addToCompare(itemData);
            setIsCompared(true);
        },
        [id, title, price, itemImages, type]
    );

    // CSS class
    const heartClass = isFavorited
        ? "flex items-center justify-center w-10 h-10 rounded-full bg-red-400 text-white hover:bg-red-500 shadow-lg"
        : "flex items-center justify-center w-10 h-10 rounded-full bg-white text-red-500 hover:bg-red-50 shadow-lg";

    const detailUrl = type === "ev" ? `/ev/${id}` : `/battery/${id}`;

    return (
        <Link to={detailUrl} state={id} className="block group">
            <div className="w-80 bg-white rounded-xl shadow-md border border-gray-200 transition-all duration-300 group-hover:shadow-xl group-hover:border-yellow-400 group-hover:-translate-y-1">
                {/* Ảnh sản phẩm */}
                <div className="relative">
                    <Slider {...carouselSettings}>
                        {displayImages.map((img, i) => (
                            <div key={i} className="aspect-w-16 aspect-h-9 relative">
                                <img
                                    src={img.imageUrl}
                                    alt={`${title}-${i}`}
                                    className="w-full p-2 rounded-2xl h-60 object-cover"
                                />
                                {isVerified && (
                                    <div className="absolute top-2 left-2">
                                        <VerifiedCheck />
                                    </div>
                                )}
                            </div>
                        ))}
                    </Slider>

                    {/* Nút hành động */}
                    <div className="absolute top-3 right-3 z-10 flex flex-col items-end space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {/* ❤️ Yêu thích */}
                        <button
                            onClick={handleFavoriteClick}
                            disabled={isProcessing}
                            className={`${heartClass} ${isProcessing ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                        >
                            <FiHeart className={`w-5 h-5 ${isFavorited ? "fill-white" : ""}`} />
                        </button>

                        {/* 📊 So sánh */}
                        <button
                            onClick={handleCompareClick}
                            className={`flex items-center justify-center px-4 py-2 rounded-md font-semibold text-xs shadow-md transition-all duration-300 ${isCompared
                                ? "bg-green-500 text-white hover:bg-green-600"
                                : "bg-white text-gray-900 hover:bg-gray-100"
                                }`}
                        >
                            <FiBarChart2 className="mr-1.5" />
                            {isCompared ? "Đã thêm" : "So sánh"}
                        </button>

                        {/* ⚡ Mua ngay / 🛒 Giỏ hàng */}
                        {type === "battery" && (
                            <div className="flex flex-col space-y-2">
                                <button
                                    onClick={handleBuyNow}
                                    disabled={isProcessing}
                                    className={`flex items-center justify-center px-4 py-2 rounded-md font-semibold text-xs bg-yellow-300 text-[#2C2C2C] hover:bg-yellow-400 shadow-md ${isProcessing ? "opacity-50 cursor-not-allowed" : ""
                                        }`}
                                >
                                    <FiZap className="mr-1.5" /> Mua ngay
                                </button>
                                <button
                                    onClick={handleAddToCart}
                                    disabled={isProcessing}
                                    className={`flex items-center justify-center px-4 py-2 rounded-md font-semibold text-xs bg-white text-gray-900 hover:bg-gray-100 shadow-md ${isProcessing ? "opacity-50 cursor-not-allowed" : ""
                                        }`}
                                >
                                    <FiShoppingCart className="mr-1.5" /> Thêm giỏ hàng
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Nội dung */}
                <div className="p-5">
                    <div className="flex items-center">
                        <h3 className="text-xl font-bold text-gray-900 truncate" title={title}>
                            {title}
                        </h3>
                    </div>

                    <div className="flex items-center text-sm text-gray-500 mt-2 space-x-4">
                        {year && <span>{year}</span>}
                        {!!mileage && <span>{mileage.toLocaleString()} km</span>}
                        <span className="capitalize">{type}</span>
                    </div>

                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Giá</p>
                            <p className="text-xl font-extrabold text-[#D97706] leading-tight">
                                {price.toLocaleString("vi-VN")}
                            </p>
                            <span className="text-base font-bold text-[#D97706]">VND</span>
                        </div>

                        <div className="flex items-center text-[#D97706] font-semibold text-sm hover:translate-x-1 transition-transform duration-300">
                            <span>Xem Chi Tiết</span>
                            <FiArrowRight className="ml-2 w-4 h-4" />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default memo(CardComponent);
