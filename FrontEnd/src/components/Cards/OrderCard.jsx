import React, { useState, useEffect } from "react";
import { FiChevronRight } from "react-icons/fi";
import reviewApi from "../../api/reviewApi";
import paymentApi from "../../api/paymentApi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const STATUS_LABEL = {
  Pending: { label: "Chờ xác nhận", color: "text-gray-600", bg: "bg-gray-100" },
  Paid: { label: "Đã thanh toán", color: "text-blue-700", bg: "bg-blue-50" },
  Shipped: { label: "Đang giao", color: "text-yellow-700", bg: "bg-yellow-50" },
  Completed: { label: "Hoàn thành", color: "text-green-700", bg: "bg-green-50" },
  Canceled: { label: "Đã hủy", color: "text-red-700", bg: "bg-red-50" },
};

export default function OrderCard({ orderItem, order, onViewItem, onMarkReceived, onOpenReview, currentUserId }) {
  const [loading, setLoading] = useState(false);
  const [isReviewed, setIsReviewed] = useState(false);

  useEffect(() => {
    const fetchReviewStatus = async () => {
      if (orderItem.status === "Completed" && orderItem?.itemId && currentUserId) {
        try {
          const res = await reviewApi.getReviewByItemID(orderItem.itemId);
          const userReviews = res?.filter(r => r.reviewerId == currentUserId);
          setIsReviewed(userReviews?.length > 0);
        } catch {
          setIsReviewed(false);
        }
      }
    };
    fetchReviewStatus();
  }, [orderItem.status, orderItem.itemId, currentUserId]);
  const [isConfirmed, setIsConfirmed] = useState(false);
  console.log("OrderItem in OrderCard:", orderItem);
  const handleConfirmReceived = async () => {
    try {
      setLoading(true);
      setIsConfirmed(true);
      await paymentApi.confirmOrder(orderItem.orderItemId);
      onMarkReceived && onMarkReceived();
      toast.success("Bạn đã xác nhận nhận hàng!");
    } catch {
      setIsConfirmed(false); // revert if API fails
      toast.error("Cập nhật trạng thái thất bại.");
    } finally {
      setLoading(false);
    }
  };


  const detail = orderItem.detail || {};

  return (
    <div className="flex gap-4 p-4">
      <div className="flex-shrink-0 w-28 h-28 rounded-md overflow-hidden bg-gray-50 border">
        <img src={detail?.itemImage?.[0]?.imageUrl || "https://placehold.co/280x280"} alt={detail?.title || "product"} className="w-full h-full object-cover" />
      </div>

      <div className="flex-1">
        <div className="text-lg font-semibold text-gray-800 line-clamp-1">{detail?.title || "Sản phẩm"}</div>
        <div className="text-sm text-gray-500 mt-1">
          {detail?.evDetail
            ? `${detail.evDetail.brand} • ${detail.evDetail.model} • ${detail.evDetail.year}`
            : detail?.batteryDetail
              ? `${detail.batteryDetail.brand} • ${detail.batteryDetail.capacity} kWh`
              : ""}
        </div>
        <div className="mt-2 text-sm text-gray-500">
          Số lượng: {orderItem.quantity} | Đơn giá: {orderItem.price?.toLocaleString("vi-VN")}₫ | Thành tiền: {(orderItem.quantity * orderItem.price).toLocaleString("vi-VN")}₫
        </div>
      </div>

      <div className="w-44 flex flex-col justify-between items-end">
        {(orderItem.status === "Shipped" && !isConfirmed) && (
          <button
            onClick={handleConfirmReceived}
            disabled={loading}
            className="mb-2 px-4 py-2 rounded-md bg-green-600 text-white text-sm hover:bg-green-700"
          >
            {loading ? "Đang..." : "Đã nhận hàng"}
          </button>
        )}

        {(orderItem.status === "Shipped" && isConfirmed) && (
          <button disabled className="mb-2 px-4 py-2 rounded-md bg-gray-200 text-gray-500 text-sm cursor-not-allowed">
            Đã nhận hàng
          </button>
        )}
        {orderItem.status === "Completed" && !isReviewed && (
          <button onClick={() => onOpenReview?.(order, orderItem)} className="mb-2 px-4 py-2 rounded-md bg-orange-500 text-white text-sm hover:bg-orange-600">
            Đánh giá
          </button>
        )}

        {orderItem.status === "Completed" && isReviewed && (
          <button disabled className="mb-2 px-4 py-2 rounded-md bg-gray-200 text-gray-500 text-sm cursor-not-allowed">
            Đã đánh giá
          </button>
        )}

        <button onClick={() => onViewItem?.(orderItem)} className="flex items-center gap-2 px-4 py-2 rounded-md border border-gray-200 text-sm hover:shadow">
          Xem chi tiết <FiChevronRight />
        </button>
      </div>

      <ToastContainer />
    </div>
  );
}
