import React, { useState, useEffect } from "react";
import {
    Calendar,
    Car,
    DollarSign,
    User,
    Phone,
    MapPin,
    Eye,
    Download,
    Package,
} from "lucide-react";

export default function HistorySold() {
    const [sales, setSales] = useState([]);
    const [filter, setFilter] = useState("all");
    const [selectedSale, setSelectedSale] = useState(null);
    const [loading, setLoading] = useState(true);

    const sellerId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchSales = async () => {
            try {
                const res = await fetch(
                    `https://localhost:7272/api/History/${sellerId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",

                        },
                    }

                );
                if (!res.ok) throw new Error("Không thể tải dữ liệu");
                const data = await res.json();
                console.log("Dữ liệu lịch sử bán hàng từ API:", data);
                console.log("Các status nhận được:", data.map(x => x.status));
                setSales(data);
            } catch (err) {
                console.error("Lỗi khi tải lịch sử bán:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSales();
    }, [sellerId, token]);

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case "completed":
            case "sold":
                return "bg-green-100 text-green-800";
            case "processing":
                return "bg-blue-100 text-blue-800";
            case "pending_payment":
            case "pending":
                return "bg-yellow-100 text-yellow-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getStatusText = (status) => {
        switch (status?.toLowerCase()) {
            case "completed":
            case "sold":
                return "Hoàn thành";
            case "processing":
                return "Đang xử lý";
            case "pending_payment":
            case "pending":
                return "Chờ thanh toán";
            default:
                return "Không xác định";
        }
    };

    const formatPrice = (price) =>
        new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price || 0);

    const filteredSales =
        filter === "all"
            ? sales
            : sales.filter((s) => s.status?.toLowerCase() === filter);

    const totalRevenue = sales
        .filter(
            (s) =>
                s.status?.toLowerCase() === "completed" ||
                s.status?.toLowerCase() === "sold"
        )
        .reduce((sum, sale) => sum + (sale.actualPrice || 0), 0);

    const totalSold = sales.filter(
        (s) =>
            s.status?.toLowerCase() === "completed" ||
            s.status?.toLowerCase() === "sold"
    ).length;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Lịch Sử Bán Hàng
                    </h1>
                    <p className="text-gray-600">
                        Theo dõi các giao dịch bán của bạn
                    </p>
                </div>

                {/* Loading */}
                {loading ? (
                    <div className="text-center text-gray-500 py-20">
                        Đang tải dữ liệu...
                    </div>
                ) : (
                    <>
                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            <div className="bg-white rounded-lg shadow-sm p-6 flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Tổng doanh thu</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {formatPrice(totalRevenue)}
                                    </p>
                                </div>
                                <div className="bg-green-100 p-3 rounded-lg">
                                    <DollarSign className="w-6 h-6 text-green-600" />
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm p-6 flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Xe đã bán</p>
                                    <p className="text-2xl font-bold text-blue-600">{totalSold}</p>
                                </div>
                                <div className="bg-blue-100 p-3 rounded-lg">
                                    <Car className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </div>

                        {/* Filter */}
                        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex gap-3 flex-wrap">
                            {[
                                { label: "Tất cả", value: "all" },
                                { label: "Hoàn thành", value: "completed" },
                                { label: "Đang xử lý", value: "processing" },
                                { label: "Chờ thanh toán", value: "pending_payment" },
                            ].map((btn) => (
                                <button
                                    key={btn.value}
                                    onClick={() => setFilter(btn.value)}
                                    className={`px-4 py-2 rounded-lg font-medium transition ${filter === btn.value
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                        }`}
                                >
                                    {btn.label}
                                </button>
                            ))}
                        </div>

                        {/* Sales List */}
                        {filteredSales.length === 0 ? (
                            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 text-lg">Không có giao dịch nào</p>
                            </div>
                        ) : (
                            filteredSales.map((sale) => (
                                <div
                                    key={sale.itemId}
                                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow mb-4"
                                >
                                    <div className="p-6 flex flex-col gap-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="text-sm font-semibold text-gray-900">
                                                        {sale.title}
                                                    </span>
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                                            sale.status
                                                        )}`}
                                                    >
                                                        {getStatusText(sale.status)}
                                                    </span>
                                                </div>
                                                <div className="flex gap-4 text-sm text-gray-500">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="w-4 h-4" />
                                                        Đăng:{" "}
                                                        {sale.createdAt
                                                            ? new Date(sale.createdAt).toLocaleDateString(
                                                                "vi-VN"
                                                            )
                                                            : "--"}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="w-4 h-4" />
                                                        Bán:{" "}
                                                        {sale.soldAt
                                                            ? new Date(sale.soldAt).toLocaleDateString(
                                                                "vi-VN"
                                                            )
                                                            : "--"}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Car + Buyer */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="flex gap-4">
                                                <img
                                                    src={sale.imageUrl}
                                                    alt={sale.title}
                                                    className="w-32 h-24 object-cover rounded-lg"
                                                />
                                                <div>
                                                    <p className="text-sm text-gray-700">
                                                        <b>Biển số:</b> {sale.licensePlate}
                                                    </p>
                                                    <p className="text-sm text-gray-700">
                                                        <b>Màu:</b> {sale.color}
                                                    </p>
                                                    <p className="text-sm text-gray-700">
                                                        <b>Năm:</b> {sale.year}
                                                    </p>
                                                    <p className="text-sm text-gray-700">
                                                        <b>ODO:</b> {sale.mileage?.toLocaleString()} km
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                                                    <User className="w-4 h-4 mr-2" />
                                                    Người mua
                                                </h4>
                                                {sale.buyer ? (
                                                    <div className="space-y-2 text-sm text-gray-700">
                                                        <div className="flex items-center">
                                                            <User className="w-4 h-4 mr-2 text-gray-500" />
                                                            {sale.buyer.fullName}
                                                        </div>
                                                        <div className="flex items-center">
                                                            <Phone className="w-4 h-4 mr-2 text-gray-500" />
                                                            {sale.buyer.phone}
                                                        </div>
                                                        <div className="flex items-center">
                                                            <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                                                            {sale.buyer.address}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-gray-400 italic">
                                                        Chưa có người mua
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Price */}
                                        <div className="border-t pt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-500 mb-1">Giá niêm yết</p>
                                                <p className="font-semibold text-gray-900">
                                                    {formatPrice(sale.listedPrice)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 mb-1">Giá thực tế</p>
                                                <p className="font-semibold text-green-600">
                                                    {formatPrice(sale.actualPrice)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 mb-1">Thanh toán</p>
                                                <p className="font-medium text-gray-900">
                                                    {sale.paymentMethod}
                                                </p>
                                            </div>
                                            <div className="flex gap-3 items-center justify-end">
                                                <button
                                                    onClick={() => setSelectedSale(sale)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                                >
                                                    <Eye className="w-4 h-4" /> Xem chi tiết
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </>
                )}
            </div>

            {/* Modal Chi tiết */}
            {selectedSale && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-2xl font-bold text-gray-900">
                                Chi tiết giao dịch
                            </h2>
                            <button
                                onClick={() => setSelectedSale(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Nội dung */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                                <span className="font-medium">Trạng thái:</span>
                                <span
                                    className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                                        selectedSale.status
                                    )}`}
                                >
                                    {getStatusText(selectedSale.status)}
                                </span>
                            </div>

                            <div>
                                <h3 className="font-semibold text-gray-900 mb-3">Thông tin xe</h3>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <img
                                        src={selectedSale.imageUrl}
                                        alt={selectedSale.title}
                                        className="w-full h-56 object-cover rounded-lg mb-4"
                                    />
                                    <p>
                                        <b>Biển số:</b> {selectedSale.licensePlate}
                                    </p>
                                    <p>
                                        <b>Năm:</b> {selectedSale.year}
                                    </p>
                                    <p>
                                        <b>Màu:</b> {selectedSale.color}
                                    </p>
                                    <p>
                                        <b>ODO:</b> {selectedSale.mileage?.toLocaleString()} km
                                    </p>
                                </div>
                            </div>

                            {selectedSale.buyer && (
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-3">
                                        Thông tin người mua
                                    </h3>
                                    <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                                        <p>
                                            <b>Họ tên:</b> {selectedSale.buyer.fullName}
                                        </p>
                                        <p>
                                            <b>Điện thoại:</b> {selectedSale.buyer.phone}
                                        </p>
                                        <p>
                                            <b>Địa chỉ:</b> {selectedSale.buyer.address}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div>
                                <h3 className="font-semibold text-gray-900 mb-3">
                                    Thông tin giao dịch
                                </h3>
                                <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-2">
                                    <p>
                                        <b>Ngày đăng:</b>{" "}
                                        {selectedSale.createdAt
                                            ? new Date(selectedSale.createdAt).toLocaleDateString(
                                                "vi-VN"
                                            )
                                            : "--"}
                                    </p>
                                    <p>
                                        <b>Ngày bán:</b>{" "}
                                        {selectedSale.soldAt
                                            ? new Date(selectedSale.soldAt).toLocaleDateString(
                                                "vi-VN"
                                            )
                                            : "--"}
                                    </p>
                                    <p>
                                        <b>Giá niêm yết:</b> {formatPrice(selectedSale.listedPrice)}
                                    </p>
                                    <p>
                                        <b>Giá bán thực tế:</b>{" "}
                                        {formatPrice(selectedSale.actualPrice)}
                                    </p>
                                    <p>
                                        <b>Phương thức thanh toán:</b>{" "}
                                        {selectedSale.paymentMethod}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setSelectedSale(null)}
                                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                            >
                                Đóng
                            </button>
                            <button className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
                                <Download className="w-5 h-5" /> Tải hóa đơn
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
