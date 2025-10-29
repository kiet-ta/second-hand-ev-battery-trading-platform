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
import { message } from "antd";
import { RiBattery2ChargeLine } from "react-icons/ri";

export default function HistorySold() {
    const [sales, setSales] = useState([]);
    const [filter, setFilter] = useState("all"); // trạng thái
    const [filterType, setFilterType] = useState("all"); // loại sản phẩm: all | ev | battery
    const [selectedSale, setSelectedSale] = useState(null);
    const [loading, setLoading] = useState(true);
    const baseURL = import.meta.env.VITE_API_BASE_URL;

    const sellerId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchSales = async () => {
            try {
                const res = await fetch(`${baseURL}History/${sellerId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });
                if (!res.ok) throw new Error("Không thể tải dữ liệu");
                const data = await res.json();
                console.log("📦 API trả về:", data);
                setSales(data?.items || []); // ✅ CHỈ LẤY MẢNG TRONG items
            } catch (err) {
                console.error("❌ Lỗi khi tải lịch sử bán:", err);
                message.error("Không thể tải dữ liệu lịch sử bán hàng");
            } finally {
                setLoading(false);
            }
        };
        fetchSales();
    }, [sellerId, token]);


    // Format
    const formatPrice = (price) =>
        new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price || 0);

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case "sold":
                return "bg-green-100 text-green-800";
            case "processing":
                return "bg-blue-100 text-blue-800";
            case "pending":
            case "pending_approval":
                return "bg-yellow-100 text-yellow-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getStatusText = (status) => {
        switch (status?.toLowerCase()) {
            case "sold":
            case "completed":
                return "Hoàn thành";
            case "processing":
                return "Đang xử lý";
            case "pending":
            case "pending_approval":
                return "Chờ thanh toán";
            default:
                return "Không xác định";
        }
    };

    // Tính toán thống kê theo loại sản phẩm
    const totalRevenueEV = sales
        .filter(
            (s) =>
                s.itemType === "ev" &&
                (s.status?.toLowerCase() === "sold" ||
                    s.status?.toLowerCase() === "completed")
        )
        .reduce((sum, s) => sum + (s.actualPrice || 0), 0);

    const totalRevenueBattery = sales
        .filter(
            (s) =>
                s.itemType === "battery" &&
                (s.status?.toLowerCase() === "sold" ||
                    s.status?.toLowerCase() === "completed")
        )
        .reduce((sum, s) => sum + (s.actualPrice || 0), 0);

    const totalSoldEV = sales.filter(
        (s) =>
            s.itemType === "ev" &&
            (s.status?.toLowerCase() === "sold" ||
                s.status?.toLowerCase() === "completed")
    ).length;

    const totalSoldBattery = sales.filter(
        (s) =>
            s.itemType === "battery" &&
            (s.status?.toLowerCase() === "sold" ||
                s.status?.toLowerCase() === "completed")
    ).length;

    // Lọc dữ liệu
    const filteredSales = sales.filter((s) => {
        const matchStatus = filter === "all" || s.status?.toLowerCase() === filter;
        const matchType = filterType === "all" || s.itemType === filterType;
        return matchStatus && matchType;
    });

    // Xuất CSV
    const exportToCSV = () => {
        if (sales.length === 0) {
            message.info("Không có dữ liệu để xuất.");
            return;
        }
        const headers = [
            "Mã SP",
            "Tiêu đề",
            "Loại SP",
            "Trạng thái",
            "Giá niêm yết",
            "Giá thực tế",
            "Ngày bán",
        ];
        const rows = sales.map((s) => [
            s.itemId,
            s.title,
            s.itemType,
            getStatusText(s.status),
            s.listedPrice,
            s.actualPrice,
            s.soldAt ? new Date(s.soldAt).toLocaleDateString("vi-VN") : "--",
        ]);
        const csv =
            "data:text/csv;charset=utf-8," +
            [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
        const link = document.createElement("a");
        link.href = encodeURI(csv);
        link.download = `sales_history_${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
    };

    // Loading
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
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8 flex-wrap gap-3">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-1">Lịch sử bán hàng</h1>
                        <p className="text-gray-600">Theo dõi giao dịch bán xe & pin của bạn</p>
                    </div>
                    <button
                        onClick={exportToCSV}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                        <Download className="w-4 h-4" /> Xuất CSV
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow-sm p-6 flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Doanh thu Xe điện</p>
                            <p className="text-2xl font-bold text-600">
                                {formatPrice(totalRevenueEV)}
                            </p>
                        </div>
                        <div className="bg-100 p-3 rounded-lg">
                            <Car className="w-6 h-6 text-600" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6 flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Xe điện đã bán</p>
                            <p className="text-2xl font-bold text-black-600">{totalSoldEV}</p>
                        </div>
                        <div className="bg-100 p-3 rounded-lg">
                            <Car className="w-6 h-6 text-600" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6 flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Doanh thu Pin</p>
                            <p className="text-2xl font-bold text-black-600">
                                {formatPrice(totalRevenueBattery)}
                            </p>
                        </div>
                        <div className="bg-100 p-3 rounded-lg">
                            <RiBattery2ChargeLine className="w-6 h-6 " />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6 flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Pin đã bán</p>
                            <p className="text-2xl font-bold text-600">{totalSoldBattery}</p>
                        </div>
                        <div className="bg-100 p-3 rounded-lg">
                            <RiBattery2ChargeLine className="w-6 h-6 text-600" />
                        </div>
                    </div>
                </div>

                {/* Bộ lọc */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex gap-3 flex-wrap justify-between">
                    <div className="flex gap-3 flex-wrap">
                        {[
                            { label: "Tất cả", value: "all" },
                            { label: "Hoàn thành", value: "sold" },
                            { label: "Đang xử lý", value: "processing" },
                            { label: "Chờ thanh toán", value: "pending" },
                        ].map((btn) => (
                            <button
                                key={btn.value}
                                onClick={() => setFilter(btn.value)}
                                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-300 ${filter === btn.value
                                    ? "bg-indigo-50 border-indigo-300 text-indigo-700 shadow-sm"
                                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                                    }`}
                            >
                                {btn.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-3">
                        {[
                            { label: "Tất cả SP", value: "all" },
                            { label: "Xe điện", value: "ev" },
                            { label: "Pin", value: "battery" },
                        ].map((btn) => (
                            <button
                                key={btn.value}
                                onClick={() => setFilterType(btn.value)}
                                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-300 ${filterType === btn.value
                                    ? "bg-indigo-50 border-indigo-300 text-indigo-700 shadow-sm"
                                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                                    }`}
                            >
                                {btn.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Danh sách */}
                {filteredSales.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">Không có giao dịch nào</p>
                    </div>
                ) : (
                    filteredSales.map((sale, index) => (
                        <div
                            key={`${sale.itemId}-${sale.itemType}-${index}`}
                            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow mb-4"
                        >
                            <div className="p-6 flex flex-col gap-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-gray-900 text-lg mb-2">
                                            {sale.title}{sale.brand}
                                        </h3>
                                        <div className="flex gap-4 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                Bán:{" "}
                                                {sale.soldAt
                                                    ? new Date(sale.soldAt).toLocaleDateString("vi-VN")
                                                    : "--"}
                                            </span>
                                            {sale.itemType === "ev" && (
                                                <span className="flex items-center gap-1">
                                                    <Car className="w-4 h-4" /> Biển số:{" "}
                                                    {sale.licensePlate || "--"}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                            sale.status
                                        )}`}
                                    >
                                        {getStatusText(sale.status)}
                                    </span>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6 mt-3">
                                    <div className="flex gap-4">
                                        <img
                                            src={sale.imageUrl}
                                            alt={sale.title}
                                            className="w-36 h-28 object-cover rounded-lg border"
                                        />
                                        <div className="text-sm text-gray-700">
                                            {sale.itemType === "ev" ? (
                                                <>
                                                    <p>
                                                        <b>Màu:</b> {sale.color}
                                                    </p>
                                                    <p>
                                                        <b>Năm:</b> {sale.year}
                                                    </p>
                                                    <p>
                                                        <b>ODO:</b>{" "}
                                                        {sale.mileage?.toLocaleString("vi-VN")} km
                                                    </p>
                                                </>
                                            ) : (
                                                <>
                                                    <p>
                                                        <b>Dung lượng:</b> {sale.capacity} kWh
                                                    </p>
                                                    <p>
                                                        <b>Điện áp:</b> {sale.voltage}V
                                                    </p>
                                                    <p>
                                                        <b>Chu kỳ sạc:</b> {sale.chargeCycles}
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                                            <User className="w-4 h-4 mr-2" /> Người mua
                                        </h4>
                                        {sale.buyer ? (
                                            <div className="space-y-1 text-sm text-gray-700">
                                                <p>
                                                    <b>Họ tên:</b> {sale.buyer.fullName}
                                                </p>
                                                <p>
                                                    <b>SĐT:</b> {sale.buyer.phone}
                                                </p>
                                                <p>
                                                    <b>Địa chỉ:</b> {sale.buyer.address}
                                                </p>
                                            </div>
                                        ) : (
                                            <p className="text-gray-400 italic">Chưa có người mua</p>
                                        )}
                                    </div>
                                </div>

                                <div className="border-t pt-4 flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-gray-500">Giá bán thực tế</p>
                                        <p className="text-xl font-bold text-gray-600">
                                            {formatPrice(sale.actualPrice)}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setSelectedSale(sale)}
                                        className="flex items-center gap-2 px-4 py-2 border border-indigo-300 text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100 hover:shadow-sm transition-all duration-200"
                                    >
                                        <Eye className="w-4 h-4" /> Xem chi tiết
                                    </button>

                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal chi tiết */}
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
                                <h3 className="font-semibold text-gray-900 mb-3">Thông tin sản phẩm</h3>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <img
                                        src={selectedSale.imageUrl}
                                        alt={selectedSale.title}
                                        className="w-full h-56 object-cover rounded-lg mb-4"
                                    />
                                    <p>
                                        <b>Loại:</b>{" "}
                                        {selectedSale.itemType === "ev" ? "Xe điện" : "Pin"}
                                    </p>
                                    {selectedSale.itemType === "ev" ? (
                                        <>
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
                                                <b>ODO:</b>{" "}
                                                {selectedSale.mileage?.toLocaleString("vi-VN")} km
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <p>
                                                <b>Dung lượng:</b> {selectedSale.capacity} kWh
                                            </p>
                                            <p>
                                                <b>Điện áp:</b> {selectedSale.voltage}V
                                            </p>
                                            <p>
                                                <b>Chu kỳ sạc:</b> {selectedSale.chargeCycles}
                                            </p>
                                        </>
                                    )}
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
                                            ? new Date(selectedSale.createdAt).toLocaleDateString("vi-VN")
                                            : "--"}
                                    </p>
                                    <p>
                                        <b>Ngày bán:</b>{" "}
                                        {selectedSale.soldAt
                                            ? new Date(selectedSale.soldAt).toLocaleDateString("vi-VN")
                                            : "--"}
                                    </p>
                                    <p>
                                        <b>Giá niêm yết:</b> {formatPrice(selectedSale.listedPrice)}
                                    </p>
                                    <p>
                                        <b>Giá bán thực tế:</b> {formatPrice(selectedSale.actualPrice)}
                                    </p>
                                    <p>
                                        <b>Phương thức thanh toán:</b>{" "}
                                        {selectedSale.paymentMethod || "Không xác định"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Footer hành động */}
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setSelectedSale(null)}
                                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                            >
                                Đóng
                            </button>
                            <button
                                onClick={() => message.success('🧾 Đang tạo hóa đơn PDF... (chưa implement)')}
                                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                            >
                                <Download className="w-5 h-5" /> Tải hóa đơn
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

