import React, {
    useEffect,
    useState,
    useMemo,
    useCallback,
    memo,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import Slider from "react-slick";
import {
    FiHeart,
    FiZap,
    FiShoppingCart,
    FiArrowRight,
    FiBarChart2,
} from "react-icons/fi";
import orderItemApi from "../../api/orderItemApi";
import favouriteApi from "../../api/favouriteApi";
import {
    addToCompare,
    getCompareList,
    removeFromCompare,
} from "../../utils/compareUtils";
import { message } from "antd";
import addressLocalApi from "../../api/addressLocalApi";
import orderApi from "../../api/orderApi";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// ✅ Small reusable Verified badge
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

    // ✅ Load favorites & compare state
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

    // ✅ Slider settings
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

    // ✅ Handle cart actions
    const handleAddToCart = useCallback(
        async (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (isProcessing) return;
            setIsProcessing(true);
            try {
                const payload = { buyerId: userId, itemId: id, quantity: 1, price };
                await orderItemApi.postOrderItem(payload);
                message.success("Đã thêm vào giỏ hàng");
            } catch (err) {
                console.error("Error adding item:", err);
            } finally {
                setIsProcessing(false);
            }
        },
        [id, price, userId, isProcessing]
    );

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
                price: price,
            };

            const createdOrderItem = await orderItemApi.postOrderItem(orderItemPayload);
            if (!createdOrderItem?.orderItemId)
                throw new Error("Không thể tạo OrderItem.");

            // 2️⃣ Lấy địa chỉ mặc định
            const allAddresses = await addressLocalApi.getAddressByUserId(userId);
            const defaultAddress =
                allAddresses.find((addr) => addr.isDefault) || allAddresses[0];

            if (!defaultAddress) {
                message.warning("Vui lòng thêm địa chỉ giao hàng trong hồ sơ!");
                navigate("/profile/address");
                return;
            }

            // 3️⃣ Tạo Order
            const orderPayload = {
                buyerId: userId,
                addressId: defaultAddress.addressId,
                orderItemIds: [createdOrderItem.orderItemId],
                createdAt: new Date().toISOString().split("T")[0],
                updatedAt: new Date().toISOString().split("T")[0],
            };

            const createdOrder = await orderApi.postOrderNew(orderPayload);
            if (!createdOrder?.orderId) throw new Error("Không thể tạo Order.");

            // 4️⃣ Chuyển sang trang Checkout
            navigate("/checkout", {
                state: {
                    fromBuyNow: true,
                    orderId: createdOrder.orderId,
                    totalAmount: price,
                    orderItems: [
                        {
                            id: id,
                            name: title || "Sản phẩm",
                            price: price,
                            quantity: 1,
                            image:
                                itemImages?.[0]?.imageUrl ||
                                "https://placehold.co/100x100",
                        },
                    ],
                    allAddresses,
                    selectedAddressId: defaultAddress.addressId,
                },
            });
        } catch (err) {
            console.error("❌ Lỗi mua ngay:", err);
            message.error("Không thể mua ngay. Vui lòng thử lại.");
        } finally {
            setIsProcessing(false);
        }
    };


    // ✅ Handle favorite toggle
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
                    message.info("❎ Đã xoá khỏi yêu thích");
                } else {
                    const res = await favouriteApi.postFavourite({
                        userId: parseInt(userId, 10),
                        itemId: id,
                        createdAt: new Date().toISOString(),
                    });
                    setIsFavorited(true);
                    setFavoriteId(res?.favId ?? null);
                    message.success("❤️ Đã thêm vào yêu thích");
                }
            } catch (err) {
                console.error("Favourite failed:", err);
            } finally {
                setIsProcessing(false);
            }
        },
        [isFavorited, favoriteId, userId, id, isProcessing]
    );

    // Handle Compare toggle
    const handleCompareClick = useCallback(
        (e) => {
            e.preventDefault();
            e.stopPropagation();

            const list = getCompareList();
            const already = list.some((x) => x.itemId === id);

            //Nếu đã có trong danh sách → xoá
            if (already) {
                removeFromCompare(id);
                setIsCompared(false);
                return;
            }

            //Danh sách xe đi với danh sách xe
            if (list.length > 0 && list[0].itemType !== type) {
                message.error(
                    `❌ Bạn chỉ có thể so sánh các sản phẩm cùng loại (${list[0].itemType.toUpperCase()}).`
                );
                return;
            }

            // Giới hạn tối đa 3 item
            if (list.length >= 3) {
                message.warning("⚠️ Chỉ có thể so sánh tối đa 3 sản phẩm.");
                return;
            }

            //Thêm vào danh sách
            const itemData = {
                itemId: id,
                name: title,
                price,
                imageUrl: itemImages?.[0]?.imageUrl || "https://placehold.co/400x300",
                itemType: type,
            };
            addToCompare(itemData);
            setIsCompared(true);
            message.success("✅ Đã thêm vào danh sách so sánh");
        },
        [id, title, price, itemImages, type]
    );


    // Classes
    const heartClass = isFavorited
        ? "flex items-center justify-center w-10 h-10 rounded-full bg-red-400 text-white hover:bg-red-500 shadow-lg"
        : "flex items-center justify-center w-10 h-10 rounded-full bg-white text-red-500 hover:bg-red-50 shadow-lg";

    const detailUrl = type === "ev" ? `/ev/${id}` : `/battery/${id}`;

    return (
        <Link to={detailUrl} state={id} className="block group">
            <div className="w-80 bg-white rounded-xl shadow-md border border-gray-200 transition-all duration-300 group-hover:shadow-xl group-hover:border-yellow-400 group-hover:-translate-y-1">
                {/* Image */}
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

                    {/* Action buttons */}
                    <div className="absolute top-3 right-3 z-10 flex flex-col items-end space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {/* Favorite */}
                        <button
                            onClick={handleFavoriteClick}
                            disabled={isProcessing}
                            className={`${heartClass} ${isProcessing ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                        >
                            <FiHeart
                                className={`w-5 h-5 ${isFavorited ? "fill-white" : ""}`}
                            />
                        </button>

                        {/* Compare */}
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

                        {/* Cart buttons (only for battery) */}
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

                {/* Content */}
                <div className="p-5">
                    <div className="flex items-center">
                        <h3
                            className="text-xl font-bold text-gray-900 truncate"
                            title={title}
                        >
                            {title}
                        </h3>
                        {isVerified && <VerifiedCheck className="ml-2" />}
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
