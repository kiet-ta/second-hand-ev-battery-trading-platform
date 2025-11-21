import React, { useState, useEffect } from "react";
import orderApi from "../../api/orderApi";
import reviewApi from "../../api/reviewApi"; // 👈 make sure this exists
import { FiChevronRight } from "react-icons/fi";
import userApi from "../../api/userApi";
import paymentApi from "../../api/paymentApi";

const STATUS_LABEL = {
    Pending: { label: "Chờ xác nhận", color: "text-gray-600", bg: "bg-gray-100" },
    Paid: { label: "Đã thanh toán", color: "text-blue-700", bg: "bg-blue-50" },
    Shipped: { label: "Đang giao", color: "text-yellow-700", bg: "bg-yellow-50" },
    Completed: { label: "Hoàn thành", color: "text-green-700", bg: "bg-green-50" },
    Canceled: { label: "Đã hủy", color: "text-red-700", bg: "bg-red-50" },
};

const progressFor = (status) => {
    switch (status) {
        case "Pending": return 10;
        case "Paid": return 40;
        case "Shipped": return 70;
        case "Completed": return 100;
        default: return 0;
    }
};

export default function OrderCard({ order, onViewItem, onMarkReceived, onOpenReview, currentUserId }) {
    const [loading, setLoading] = useState(false);
    const [isReviewed, setIsReviewed] = useState(false);
    const [sellerProfile, setSellerProfile] = useState(null);


    const firstItem = order?.items?.[0] || {};
    const detail = firstItem?.detail || {};

    useEffect(() => {
        const fetchSeller = async () => {
            try {
                const sellerId = detail?.updatedBy || firstItem?.updatedBy;
                if (sellerId) {
                    const res = await userApi.getUserByID(sellerId);
                    setSellerProfile(res);
                }
            } catch (err) {
                console.error("Failed to fetch seller:", err);
            }
        };
        fetchSeller();
    }, [detail?.updatedBy, firstItem?.updatedBy]);
    useEffect(() => {
        const fetchReviewStatus = async () => {
            if (order?.status === "Completed" && firstItem?.itemId && currentUserId) {
                try {
                    const res = await reviewApi.getReviewByItemID(firstItem.itemId);
                    const userReviews = res?.filter(
                        (r) => r.reviewerId == currentUserId
                    );
                    const latestReview = userReviews?.sort(
                        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                    )[0];
                    setIsReviewed(!!latestReview);
                } catch (err) {
                    console.error("Failed to check review status:", err);
                }
            }
        };
        fetchReviewStatus();
    }, [order?.status, firstItem?.itemId, currentUserId]);

    const handleConfirmReceived = async () => {
        try {
            setLoading(true);
            await paymentApi.confirmOrder(order.orderId)
            onMarkReceived && onMarkReceived();
        } catch (err) {
            console.error("update order failed", err);
            alert("Cập nhật trạng thái thất bại");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
                <div className="flex items-center gap-3">
                    <img
                        src={
                            sellerProfile?.avatarProfile ||
                            "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"
                        }
                        alt={sellerProfile?.fullName || "Shop"}
                        className="w-9 h-9 rounded-full object-cover border"
                    />
                    <div>
                        <div className="text-sm font-semibold text-gray-800">
                            {sellerProfile?.fullName
                                ? sellerProfile.fullName
                                : "Đang tải..."}
                        </div>
                        <div className="text-xs text-gray-500">
                            {new Date(order.createdAt).toLocaleString()}
                        </div>
                    </div>
                </div>

                <div className={`px-3 py-1 rounded text-xs font-medium ${STATUS_LABEL[order.status]?.bg || "bg-gray-100"} ${STATUS_LABEL[order.status]?.color || "text-gray-600"}`}>
                    {STATUS_LABEL[order.status]?.label || order.status}
                </div>
            </div>

            {/* main horizontal content */}
            <div className="flex gap-4 p-4">
                {/* left image */}
                <div className="flex-shrink-0 w-28 h-28 rounded-md overflow-hidden bg-gray-50 border">
                    <img
                        src={
                            detail?.itemImage?.[0]?.imageUrl ||
                            "https://placehold.co/280x280"
                        }
                        alt={detail?.title || "product"}
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* center info */}
                <div className="flex-1">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="text-lg font-semibold text-gray-800 line-clamp-1">
                                {detail?.title || "Sản phẩm"}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                                {detail?.evDetail
                                    ? `${detail.evDetail.brand} • ${detail.evDetail.model} • ${detail.evDetail.year}`
                                    : detail?.batteryDetail
                                        ? `${detail.batteryDetail.brand} • ${detail.batteryDetail.capacity} kWh`
                                        : ""}
                            </div>
                        </div>

                        <div className="text-right">
                            <div className="text-sm text-gray-500">
                                x{firstItem?.quantity || 1}
                            </div>
                            <div className="text-xl font-extrabold text-[#D97706]">
                                {(firstItem?.price * firstItem?.quantity).toLocaleString("vi-VN")}₫
                            </div>
                            <div>
                                <span className="text-sm text-gray-500"> ({firstItem?.quantity} x {firstItem?.price?.toLocaleString("vi-VN")}₫)</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            Thành tiền:{" "}
                            <span className="font-semibold text-gray-800">
                                {(
                                    order?.items?.reduce(
                                        (s, it) => s + (it.price || 0) * (it.quantity || 1),
                                        0
                                    ) || 0
                                ).toLocaleString("vi-VN")}
                                ₫
                            </span>
                        </div>
                        <div className="text-sm text-gray-400">Mã: #{order.orderId}</div>
                    </div>

                    {/* progress */}
                    <div className="mt-3">
                        <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                            <div
                                style={{ width: `${progressFor(order.status)}%` }}
                                className="h-2 bg-amber-400 transition-all duration-300"
                            />
                        </div>
                        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                            <div>Chờ xác nhận</div>
                            <div>Hoàn thành</div>
                        </div>
                    </div>
                </div>

                {/* right actions */}
                <div className="w-44 flex flex-col justify-between items-end">
                    <div className="text-right">
                        {order.status === "Shipped" && (
                            <button
                                onClick={handleConfirmReceived}
                                disabled={loading}
                                className="mb-3 px-4 py-2 rounded-md bg-green-600 text-white text-sm hover:bg-green-700"
                            >
                                {loading ? "Đang..." : "Đã nhận được hàng"}
                            </button>
                        )}

                        {order.status === "Completed" && !isReviewed && (
                            <button
                                onClick={() => onOpenReview?.(order, firstItem)}
                                className="mb-3 px-4 py-2 rounded-md bg-orange-500 text-white text-sm hover:bg-orange-600"
                            >
                                Đánh giá
                            </button>
                        )}

                        {order.status === "Completed" && isReviewed && (
                            <button
                                disabled
                                className="mb-3 px-4 py-2 rounded-md bg-gray-200 text-gray-500 text-sm cursor-not-allowed"
                            >
                                Đã đánh giá
                            </button>
                        )}

                        <button
                            onClick={() => onViewItem?.(firstItem)}
                            className="flex items-center gap-2 px-4 py-2 rounded-md border border-gray-200 text-sm hover:shadow"
                        >
                            Xem chi tiết <FiChevronRight />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
