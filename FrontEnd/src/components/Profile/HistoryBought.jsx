import React, { useEffect, useState } from "react";
import { Calendar, Package, Star, Zap, GaugeCircle, Palette, Car } from "lucide-react";
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
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 10,
  });
  const baseURL = import.meta.env.VITE_API_BASE_URL;

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    fetchOrders(newPage, pagination.pageSize);
  };


  const fetchOrders = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${baseURL}history/me/bought?pageNumber=${page}&pageSize=${pageSize}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();

      const formattedOrders = data.items.map((order) => ({
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
          order.itemImage?.[0]?.imageUrl ||
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

      setPagination({
        currentPage: data.pageNumber,
        totalPages: Math.ceil(data.totalCount / data.pageSize),
        totalCount: data.totalCount,
        pageSize: data.pageSize,
      });
    } catch (err) {
      console.error(err);
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
      fetchOrders();
    } catch (error) {
      console.error("Failed to submit review:", error);
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
      case "Completed":
        return "bg-green-100 !text-green-800";
      case "Pending":
      case "Failed":
        return "bg-red-100 !text-red-800";
      case "Expired":
        return "bg-gray-200 !text-gray-800";
      default:
        return "bg-gray-100 !text-gray-800";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "Completed":
        return "Hoàn thành";
      case "Pending":
        return "Đợi"
      case "Failed":
        return "Thất bại";
      case "Expired":
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


  const filteredOrders = orders.filter((o) => {
    const matchStatus = filter === "all" || o.status === filter;
    const matchType = filterType === "all" || o.itemType === filterType;
    const withinTime =
      timeFilter === "all" ||
      (new Date(new Date().getTime() + 7 * 60 * 60 * 1000) - new Date(o.paymentCreatedAt)) / (1000 * 60 * 60 * 24) <= Number(timeFilter);
    return matchStatus && matchType && withinTime;
  });

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
                {orders.filter((o) => o.status === "Completed").length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow text-center">
              <p className="text-sm text-gray-500">Đang xử lý</p>
              <p className="text-xl font-bold text-yellow-600">
                {orders.filter((o) => o.status === "Pending").length}
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
              {["all", "Completed", "Pending", "Failed", "Canceled", "Expired"].map((type) => (
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
                <option value="Ev">Xe điện</option>
                <option value="Battery">Pin</option>
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

                    {order.itemType === "Ev" && (
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

                    {order.itemType === "Battery" && (
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
        {/* --- Pagination --- */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-8">
            <button
              disabled={pagination.currentPage === 1}
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              className={`px-4 py-2 rounded-lg border ${pagination.currentPage === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white hover:bg-gray-100 text-gray-700"
                }`}
            >
              ← Trước
            </button>

            <span className="text-gray-600 text-sm">
              Trang {pagination.currentPage} / {pagination.totalPages}
            </span>

            <button
              disabled={pagination.currentPage === pagination.totalPages}
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              className={`px-4 py-2 rounded-lg border ${pagination.currentPage === pagination.totalPages
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white hover:bg-gray-100 text-gray-700"
                }`}
            >
              Sau →
            </button>
          </div>
        )}

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
