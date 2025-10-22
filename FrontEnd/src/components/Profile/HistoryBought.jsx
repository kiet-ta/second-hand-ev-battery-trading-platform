import React, { useEffect, useState } from "react";
import { Calendar, Package, Star, Zap, GaugeCircle, Palette, Car } from "lucide-react";
import { message } from "antd";
import ReviewModal from "../Modals/ReviewModal";
import reviewApi from "../../api/reviewApi";

export default function HistoryBought() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
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

      const formattedOrders = data.map((order) => ({
        orderCode: order.orderCode,
        paymentCreatedAt: order.paymentCreatedAt,
        status: order.status,
        method: order.method,
        totalAmount: order.totalAmount,
        itemId: order.itemId,
        itemType: order.itemType,
        title: order.title,
        description: order.description,
        image:
          order.image ||
          "https://static.vecteezy.com/system/resources/previews/020/336/975/original/electric-car-icon-on-transparent-background-free-png.png",
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
      message.error("Không thể tải lịch sử mua hàng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId && token) fetchOrders();
    else setLoading(false);
  }, [userId, token]);

  const handleReviewSubmit = async (reviewDataFromModal) => {
    const apiPayload = {
      ...reviewDataFromModal,
      targetUserId: 1,
    };

    try {
      await reviewApi.postReview(apiPayload);
      message.success("🎉 Đánh giá của bạn đã được gửi thành công!");
      fetchOrders();
    } catch (error) {
      console.error("Failed to submit review:", error);
      message.error("❌ Gửi đánh giá thất bại. Vui lòng thử lại.");
    }
  };

  const handleOpenReviewModal = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };
  const handleCloseReviewModal = () => {
    setSelectedOrder(null);
    setIsModalOpen(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "canceled":
        return "bg-orange-100 text-orange-800";
      case "expired":
        return "bg-gray-200 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "completed":
        return "Hoàn thành";
      case "pending":
      case "processing":
        return "Đang xử lý";
      case "failed":
        return "Thất bại";
      case "canceled":
        return "Đã hủy";
      case "expired":
        return "Đã hết hạn";
      default:
        return "Không xác định";
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  const exportToCSV = () => {
    if (orders.length === 0) {
      message.info("Không có dữ liệu để xuất.");
      return;
    }

    const headers = ["Mã đơn", "Ngày thanh toán", "Trạng thái", "Phương thức", "Tổng tiền"];
    const rows = orders.map((o) => [
      o.orderCode,
      new Date(o.paymentCreatedAt).toLocaleDateString("vi-VN"),
      getStatusText(o.status),
      o.method,
      o.totalAmount,
    ]);
    const csv =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = `order_history_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  // --- Lọc nâng cao ---
  const filteredOrders = orders.filter((o) => {
    const matchStatus = filter === "all" || o.status === filter;
    const matchType = filterType === "all" || o.itemType === filterType;
    const withinTime =
      timeFilter === "all" ||
      (new Date() - new Date(o.paymentCreatedAt)) / (1000 * 60 * 60 * 24) <= Number(timeFilter);
    return matchStatus && matchType && withinTime;
  });

  // === Loading State ===
  if (loading) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="animate-pulse bg-white p-6 rounded-lg shadow-sm">
            <div className="h-5 bg-gray-200 rounded w-1/4 mb-3"></div>
            <div className="h-32 bg-gray-100 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
            <h1 className="text-3xl font-bold">🛒 Lịch sử mua hàng</h1>
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Xuất CSV
            </button>
          </div>

          {/* --- Quick Stats --- */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow text-center">
              <p className="text-sm text-gray-500">Tổng đơn hàng</p>
              <p className="text-xl font-bold">{orders.length}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow text-center">
              <p className="text-sm text-gray-500">Hoàn thành</p>
              <p className="text-xl font-bold text-green-600">
                {orders.filter((o) => o.status === "completed").length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow text-center">
              <p className="text-sm text-gray-500">Đang xử lý</p>
              <p className="text-xl font-bold text-yellow-600">
                {orders.filter((o) => o.status === "pending").length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow text-center">
              <p className="text-sm text-gray-500">Tổng chi tiêu</p>
              <p className="text-xl font-bold text-blue-600">
                {formatPrice(orders.reduce((sum, o) => sum + o.totalAmount, 0))}
              </p>
            </div>
          </div>

          {/* --- Filter Bar --- */}
          <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-wrap gap-3 items-center justify-between">
            <div className="flex gap-3 flex-wrap">
              {["all", "completed", "pending", "failed", "canceled", "expired"].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === type
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  {type === "all"
                    ? `Tất cả (${orders.length})`
                    : `${getStatusText(type)} (${orders.filter((o) => o.status === type).length
                    })`}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">Tất cả loại SP</option>
                <option value="ev">Xe điện</option>
                <option value="battery">Pin</option>
              </select>

              <select
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                onChange={(e) => setTimeFilter(e.target.value)}
              >
                <option value="all">Tất cả thời gian</option>
                <option value="7">7 ngày gần đây</option>
                <option value="30">30 ngày gần đây</option>
                <option value="90">3 tháng gần đây</option>
              </select>
            </div>
          </div>

          {/* --- Orders List --- */}
          {filteredOrders.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-lg shadow">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Chưa có đơn hàng nào</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order.orderCode}
                className="bg-white rounded-lg shadow-sm p-6 mb-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Mã đơn hàng: #{order.orderCode}
                    </p>
                    <p className="text-gray-500 flex items-center gap-1 text-sm">
                      <Calendar className="w-4 h-4" /> Ngày thanh toán:{" "}
                      {new Date(order.paymentCreatedAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {getStatusText(order.status)}
                  </span>
                </div>

                <div className="flex gap-4 mb-4">
                  <img
                    src={order.image}
                    alt={order.title}
                    className="w-36 h-28 rounded-lg object-cover border"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">
                      {order.brand} {order.model} - {order.year}
                    </h3>

                    {order.itemType === "ev" && (
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 mt-1">
                        <span className="flex items-center gap-1.5">
                          <Car size={14} />
                          {order.brand}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Palette size={14} />
                          {order.color}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <GaugeCircle size={14} />
                          {order.mileage.toLocaleString("vi-VN")} km
                        </span>
                      </div>
                    )}

                    {order.itemType === "battery" && (
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 mt-1">
                        <span className="flex items-center gap-1.5">
                          <Zap size={14} />
                          {order.capacity} kWh
                        </span>
                        <span className="flex items-center gap-1.5">
                          Điện áp: {order.voltage}V
                        </span>
                        <span className="flex items-center gap-1.5">
                          Chu kỳ sạc: {order.chargeCycles}
                        </span>
                      </div>
                    )}

                    <p className="text-gray-500 text-sm mt-2 line-clamp-2">
                      {order.description}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-3 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">
                      Thanh toán:{" "}
                      <span className="font-medium text-gray-800">{order.method}</span>
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatPrice(order.totalAmount)}
                    </p>
                  </div>

                  {order.status === "completed" && (
                    <div>
                      {order.isReviewed ? (
                        <span className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-500 flex items-center gap-1">
                          <Star size={16} className="text-yellow-500" /> Đã đánh giá
                        </span>
                      ) : (
                        <button
                          onClick={() => handleOpenReviewModal(order)}
                          className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
                        >
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
