import React, { useEffect, useState } from "react";
import { Calendar, Package, Star, Zap, GaugeCircle, Palette, Car } from "lucide-react";
import ReviewModal from "../components/ReviewModal";
import reviewApi from "../api/reviewApi";

export default function HistoryBought() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`https://localhost:7272/api/History/bought`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error("Failed to fetch orders");

      const data = await res.json();

      const formattedOrders = data.map(order => ({
        orderCode: order.orderCode,
        paymentCreatedAt: order.paymentCreatedAt,
        status: order.status,
        method: order.method,
        totalAmount: order.totalAmount,
        itemId: order.itemId,
        itemType: order.itemType,
        title: order.title,
        description: order.description,
        image: order.image || "https://static.vecteezy.com/system/resources/previews/020/336/975/original/electric-car-icon-on-transparent-background-free-png.png",
        brand: order.brand,
        model: order.model,
        year: order.year,
        color: order.color,
        mileage: order.mileage,
        capacity: order.capacity,
        voltage: order.voltage,
        chargeCycles: order.chargeCycles,
        sellerId: order.updatedBy || null,
        isReviewed: order.isReviewed || false,
      }));

      setOrders(formattedOrders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId && token) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [userId, token]);

  const handleReviewSubmit = async (reviewDataFromModal) => {
    // Create the final payload for the API, overriding the targetUserId.
    const apiPayload = {
      ...reviewDataFromModal,
      targetUserId: 1, // Hardcoded as requested.
    };

    try {
      await reviewApi.postReview(apiPayload);
      alert("Đánh giá của bạn đã được gửi thành công!");
      fetchOrders(); // Refresh the order list to show the updated review status
    } catch (error) {
      console.error("Failed to submit review:", error);
      alert(error.message || "Không thể gửi đánh giá. Vui lòng thử lại.");
    }
  };

  const handleOpenReviewModal = (order) => { setSelectedOrder(order); setIsModalOpen(true); };
  const handleCloseReviewModal = () => { setSelectedOrder(null); setIsModalOpen(false); };

  // --- UPDATED: Helper functions for UI ---
  const getStatusColor = (status) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "pending": case "processing": return "bg-yellow-100 text-yellow-800";
      case "failed": return "bg-red-100 text-red-800";
      case "canceled": return "bg-orange-100 text-orange-800";
      case "expired": return "bg-gray-200 text-gray-800"; // New status
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "completed": return "Hoàn thành";
      case "pending": case "processing": return "Đang xử lý";
      case "failed": return "Thất bại";
      case "canceled": return "Đã hủy";
      case "expired": return "Đã hết hạn"; // New status
      default: return "Không xác định";
    }
  };

  const formatPrice = (price) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>;
  }

  const filteredOrders = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-6 ">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Lịch sử mua hàng</h1>

          {/* --- UPDATED: Filter Buttons --- */}
          <div className="bg-white p-4 rounded-lg shadow mb-6 flex gap-3 flex-wrap">
            {["all", "completed", "pending", "failed", "canceled", "expired"].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === type ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
              >
                {type === "all" ? `Tất cả (${orders.length})` : `${getStatusText(type)} (${orders.filter((o) => o.status === type).length})`}
              </button>
            ))}
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-lg shadow">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Chưa có đơn hàng nào</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.orderCode} className="bg-white rounded-lg shadow-sm p-6 mb-4 hover:shadow-md transition-shadow">
                {/* Order Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Mã đơn hàng: #{order.orderCode}</p>
                    <p className="text-gray-500 flex items-center gap-1 text-sm"><Calendar className="w-4 h-4" /> Ngày thanh toán: {new Date(order.paymentCreatedAt).toLocaleDateString("vi-VN")}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>

                {/* Product Details */}
                <div className="flex gap-4 mb-4">
                  <img src={order.image} alt={order.title} className="w-36 h-28 rounded-lg object-cover border" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{order.brand} {order.model} - {order.year}</h3>
                    {order.itemType === 'ev' && (
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 mt-1">
                        <span className="flex items-center gap-1.5"><Car size={14} />{order.brand}</span>
                        <span className="flex items-center gap-1.5"><Palette size={14} />{order.color}</span>
                        <span className="flex items-center gap-1.5"><GaugeCircle size={14} />{order.mileage.toLocaleString('vi-VN')} km</span>
                      </div>
                    )}
                    {order.itemType === 'battery' && (
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 mt-1">
                        <span className="flex items-center gap-1.5"><Zap size={14} />{order.capacity} kWh</span>
                        <span className="flex items-center gap-1.5">Điện áp: {order.voltage}V</span>
                        <span className="flex items-center gap-1.5">Chu kỳ sạc: {order.chargeCycles}</span>
                      </div>
                    )}
                    <p className="text-gray-500 text-sm mt-2 line-clamp-2">{order.description}</p>
                  </div>
                </div>

                {/* Order Footer */}
                <div className="border-t pt-3 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">Thanh toán: <span className="font-medium text-gray-800">{order.method}</span></p>
                    <p className="text-2xl font-bold text-blue-600">{formatPrice(order.totalAmount)}</p>
                  </div>
                  {order.status === "completed" && (
                    <div>
                      {order.isReviewed ? (
                        <span className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-500 flex items-center gap-1">
                          <Star size={16} className="text-yellow-500" /> Đã đánh giá
                        </span>
                      ) : (
                        <button onClick={() => handleOpenReviewModal(order)} className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700">
                          Đánh giá
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedOrder && (
        <ReviewModal
          isOpen={isModalOpen}
          onClose={handleCloseReviewModal}
          order={selectedOrder}
          onReviewSubmit={handleReviewSubmit}
        />
      )}
    </>
  );
}