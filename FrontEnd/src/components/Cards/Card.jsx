import React, { useEffect, useState, useMemo, useCallback, memo } from "react";
import { Link, useNavigate } from "react-router-dom";
import Slider from "react-slick";
import { FiHeart, FiZap, FiShoppingCart, FiArrowRight } from "react-icons/fi";
import orderItemApi from "../../api/orderItemApi";
import favouriteApi from "../../api/favouriteApi";
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
    const [isProcessing, setIsProcessing] = useState(false); // 🧩 To prevent spam clicking

    // ✅ Derived data (memoized)
    const userId = useMemo(() => localStorage.getItem("userId"), []);
    const displayImages = useMemo(
        () =>
            itemImages?.length
                ? itemImages
                : [{ imageUrl: "https://placehold.co/600x400/e2e8f0/e2e8f0?text=." }],
        [itemImages]
    );

    // ✅ Initialize favorite state
    useEffect(() => {
        const favoriteItem = userFavorites.find((fav) => fav.itemId === id);
        setIsFavorited(!!favoriteItem);
        setFavoriteId(favoriteItem?.favId ?? null);
    }, [userFavorites, id]);

    // ✅ Shared slider settings
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

    // ✅ Add to cart
    const handleAddToCartClick = useCallback(
        async (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (isProcessing) return;
            setIsProcessing(true);

            try {
                const payload = {
                    buyerId: userId,
                    itemId: id,
                    quantity: 1,
                    price,
                };
                await orderItemApi.postOrderItem(payload);
            } catch (err) {
                console.error("Error adding item to cart", err);
            } finally {
                setIsProcessing(false);
            }
        },
        [id, price, userId, isProcessing]
    );

    // ✅ Buy now
    const handleBuyNowClick = useCallback(
        async (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (isProcessing) return;
            setIsProcessing(true);

            try {
                const payload = {
                    buyerId: userId,
                    itemId: id,
                    quantity: 1,
                    price,
                };
                await orderItemApi.postOrderItem(payload);
                navigate("/cart", { state: { selectedItemId: id } });
            } catch (err) {
                console.error("Error adding item to cart", err);
            } finally {
                setIsProcessing(false);
            }
        },
        [userId, id, price, navigate, isProcessing]
    );

    // ✅ Favorite toggle (prevent spam)
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
                } else {
                    const newFav = await favouriteApi.postFavourite({
                        userId: parseInt(userId, 10),
                        itemId: id,
                        createdAt: new Date().toISOString(),
                    });
                    setIsFavorited(true);
                    setFavoriteId(newFav?.favId ?? null);
                }
            } catch (err) {
                console.error("Failed to update favorite:", err);
            } finally {
                setIsProcessing(false);
            }
        },
        [isFavorited, favoriteId, userId, id, isProcessing]
    );

    // ✅ Dynamic styling
    const heartClasses = isFavorited
        ? "flex items-center justify-center w-10 h-10 rounded-full bg-red-400 text-white hover:bg-red-500 transition-all duration-300 shadow-lg"
        : "flex items-center justify-center w-10 h-10 rounded-full bg-white text-red-500 hover:bg-red-50 transition-all duration-300 shadow-lg";

    const detailUrl = type === "ev" ? `/ev/${id}` : `/battery/${id}`;

    return (
        <Link to={detailUrl} state={id} className="block group">
            <div className="w-80 h-110 bg-white rounded-xl shadow-md border border-gray-200 transition-all duration-300 group-hover:shadow-xl group-hover:border-yellow-400 group-hover:-translate-y-1">
                {/* IMAGE */}
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

                    {/* ACTION BUTTONS */}
                    <div className="absolute top-3 right-3 z-10 flex flex-col items-end space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                            onClick={handleFavoriteClick}
                            disabled={isProcessing}
                            className={`${heartClasses} ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
                            title={isFavorited ? "Bỏ yêu thích" : "Thêm yêu thích"}
                        >
                            <FiHeart className={`w-5 h-5 ${isFavorited ? "fill-white" : ""}`} />
                        </button>

                        {type === "battery" && (
                            <div className="flex flex-col space-y-2">
                                <button
                                    onClick={handleBuyNowClick}
                                    disabled={isProcessing}
                                    className={`flex items-center justify-center px-4 py-2 rounded-md font-semibold text-xs bg-yellow-300 text-[#2C2C2C] hover:bg-yellow-400 transition-all duration-300 shadow-md ${isProcessing ? "opacity-50 cursor-not-allowed" : ""
                                        }`}
                                >
                                    <FiZap className="mr-1.5" />
                                    Mua ngay
                                </button>
                                <button
                                    onClick={handleAddToCartClick}
                                    disabled={isProcessing}
                                    className={`flex items-center justify-center px-4 py-2 rounded-md font-semibold text-xs bg-white text-gray-900 hover:bg-gray-100 transition-all duration-300 shadow-md ${isProcessing ? "opacity-50 cursor-not-allowed" : ""
                                        }`}
                                >
                                    <FiShoppingCart className="mr-1.5" />
                                    Thêm giỏ hàng
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* CONTENT */}
                <div className="p-5">
                    <div className="flex items-center">
                        <h3 className="text-xl font-bold text-gray-900 truncate" title={title}>
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
                        {/* Price */}
                        <div className="">
                            <p className="text-xs text-gray-500 mb-1">Giá</p>
                            <p className="text-xl font-extrabold text-[#D97706] leading-tight">
                                {price.toLocaleString("vi-VN")} 
                            </p>
                            <span className="text-base font-bold text-[#D97706]">VND</span>
                        </div>

                        {/* View Details */}
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
