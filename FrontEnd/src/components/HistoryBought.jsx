import React, { useEffect, useState } from "react";
import { Calendar, Package } from "lucide-react";

export default function HistoryBought() {
    const [orders, setOrders] = useState([]);
    const [filter, setFilter] = useState("all");
    const [loading, setLoading] = useState(true);

    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await fetch(`https://localhost:7272/api/History/bought?userId=${userId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });
                if (!res.ok) throw new Error("Failed to fetch orders");
                const data = await res.json();
                setOrders(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [userId]);

    const getStatusColor = (status) => {
        switch (status) {
            case "completed":
                return "bg-green-100 text-green-800";
            case "pending":
            case "processing":
                return "bg-yellow-100 text-yellow-800";
            case "failed":
            case "canceled":
                return "bg-red-100 text-red-800";
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
            case "canceled":
                return "Đã hủy";
            default:
                return "Không xác định";
        }
    };

    const formatPrice = (price) =>
        new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>;
    }

    const filteredOrders = filter === "all" ? orders : orders.filter((o) => o.status === filter);

    return (
        <div className="min-h-screen bg-gray-50 p-6 ">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Lịch sử mua hàng</h1>

                {/* Bộ lọc */}
                <div className="bg-white p-4 rounded-lg shadow mb-6 flex gap-3 flex-wrap">
                    {["all", "completed", "pending", "failed"].map((type) => (
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

                {/* Danh sách đơn */}
                {filteredOrders.length === 0 ? (
                    <div className="bg-white p-12 text-center rounded-lg shadow">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">Chưa có đơn hàng nào</p>
                    </div>
                ) : (
                    filteredOrders.map((order, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-lg shadow-sm p-6 mb-4 hover:shadow-md transition-shadow"
                        >
                            {/* Header đơn hàng */}
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
                                    className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(
                                        order.status
                                    )}`}
                                >
                                    {getStatusText(order.status)}
                                </span>
                            </div>

                            {/* Sản phẩm */}
                            <div className="flex gap-4 mb-4">
                                <img
                                    src={
                                        order.image ||
                                        "https://static.vecteezy.com/system/resources/previews/020/336/975/original/electric-car-icon-on-transparent-background-free-png.png"
                                    }
                                    alt={order.title}
                                    className="w-32 h-24 rounded-lg object-cover border"
                                />
                                <div>
                                    <h3 className="text-lg font-semibold">{order.title}</h3>
                                    <p className="text-sm text-gray-600">
                                        Loại: {order.itemType} | Mã sản phẩm: {order.itemId}
                                    </p>
                                    {order.description && (
                                        <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                                            {order.description}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Footer đơn hàng */}
                            <div className="border-t pt-3 flex justify-between items-center">
                                <p className="text-sm text-gray-600">
                                    Thanh toán:{" "}
                                    <span className="font-medium text-gray-800">{order.method}</span>
                                </p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {formatPrice(order.totalAmount)}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
