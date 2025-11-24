import React, { useState, useEffect } from "react";
import {
    Calendar,
    Car,
    DollarSign,
    User,
    Eye,
    Download,
    Package,
} from "lucide-react";
import { RiBattery2ChargeLine } from "react-icons/ri";
import { message } from "antd";
import orderApi from "../../api/orderApi";
import itemApi from "../../api/itemApi"; // uses the getItemDetailByID method
import addressApi from "../../hooks/services/addressApi";

export default function HistorySold() {
    const [sales, setSales] = useState([]);
    const [filter, setFilter] = useState("all");
    const [filterType, setFilterType] = useState("all");
    const [selectedSale, setSelectedSale] = useState(null);
    const [loading, setLoading] = useState(true);
    const [confirming, setConfirming] = useState(false);
    const [addressDetail, setAddressDetail] = useState(null);

    const baseURL = import.meta.env.VITE_API_BASE_URL;

    const sellerId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    // Helper formatters
    const formatPrice = (price) =>
        new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price || 0);

    const getStatusColor = (status) => {
        switch ((status || "").toString()) {
            case "Active":
            case "Auction_Active":
                return "bg-blue-100 text-blue-800";

            case "Pending":
            case "Auction_Pending_Pay":
            case "Pending_Pay":
                return "bg-yellow-100 text-yellow-800";

            case "Sold":
            case "Completed":
            case "Shipped":
                return "bg-green-100 text-green-800";

            case "Rejected":
                return "bg-red-100 text-red-800";

            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getStatusText = (status) => {
        switch ((status || "").toString()) {
            case "Active":
                return "Đang bán";
            case "Auction_Active":
                return "Đang đấu giá";

            case "Pending":
                return "Chờ xử lý";
            case "Pending_Pay":
                return "Chờ thanh toán";
            case "Auction_Pending_Pay":
                return "Chờ thanh toán (Đấu giá)";

            case "Sold":
                return "Đã bán";
            case "Shipped":
                return "Đã giao";
            case "Completed":
                return "Hoàn tất";

            case "Rejected":
                return "Bị từ chối";

            default:
                return "Không xác định";
        }
    };

    useEffect(() => {
        const fetchSales = async () => {
            setLoading(true);
            try {
                // Fetch history (handle both old/detailed and new/minimal shapes)
                const res = await fetch(
                    `${baseURL}history?sellerId=${sellerId}&PageNumber=1&PageSize=50`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                if (!res.ok) {
                    throw new Error("Không thể tải dữ liệu lịch sử");
                }

                const data = await res.json();
                // support both: { items: [...] } (old) or [...] (new)
                const rawList = data?.items ?? data ?? [];

                // For each raw entry, fetch item detail and then merge fields.
                const merged = await Promise.all(
                    rawList.map(async (r) => {
                        // Some APIs return different field names; normalize:
                        const orderItemId = r.orderItemId ?? r.orderItemID ?? r.id ?? null;
                        const orderId = r.orderId ?? r.orderID ?? r.order_id ?? r.order ?? null;
                        const itemId = r.itemId ?? r.itemID ?? r.item_id ?? r.item ?? null;

                        // fetch item detail if we have itemId
                        let itemDetail = null;
                        try {
                            if (itemId != null) {
                                // itemApi.getItemDetailByID should return the object shown in your example
                                const resp = await itemApi.getItemDetailByID(itemId);
                                // If itemApi returns wrapped response, try to normalize:
                                itemDetail = resp?.data ?? resp;
                            }
                        } catch (err) {
                            console.error("Lỗi lấy chi tiết item", itemId, err);
                        }

                        // Determine useful numeric fields with fallback to older field names
                        const totalAmount =
                            Number(r.totalAmount ?? r.total_amount ?? r.actualPrice ?? r.price ?? 0) || 0;
                        const feeValue =
                            Number(r.feeValue ?? r.fee_value ?? r.fee ?? 0) || 0;
                        const quantity =
                            Number(r.quantity ?? itemDetail?.quantity ?? 1) || 1;

                        // Payment method mapping: API uses "Wallet" or maybe "Bank" / "BankTransfer"
                        const paymentRaw = r.paymentMethod ?? r.paymentMethodName ?? r.payment ?? "";
                        const paymentMethod =
                            paymentRaw === "Wallet" || paymentRaw === "Ví" || paymentRaw === "Vi"
                                ? "Ví"
                                : /bank|transfer|ngân|banktransfer/i.test(paymentRaw)
                                    ? "Ngân hàng"
                                    : paymentRaw || "Khác";

                        // item type: prefer itemDetail.itemType else fallback to r.itemType
                        const itemType = (itemDetail?.itemType ?? r.itemType ?? "").toString();

                        // Compute income
                        const income = totalAmount - feeValue;

                        // Product code format: CMS_<ITEMTYPE>_<ORDERID>
                        const productCode = `CMS_${(itemType || "ITEM").toUpperCase()}_${orderId ?? ""}`;

                        // Image url fallback
                        const imageUrl =
                            // try old shapes
                            r.imageUrl ??
                            r.image?.imageUrl ??
                            (itemDetail?.itemImage && itemDetail.itemImage.length > 0
                                ? itemDetail.itemImage[0].imageUrl
                                : null);

                        // Buyer object might live in r.buyer or in nested fields in old API
                        const buyer =
                            r.buyer ??
                            r.customer ??
                            (r.buyerFullName || r.buyerName
                                ? {
                                    fullName: r.buyerFullName ?? r.buyerName,
                                    phone: r.buyerPhone ?? r.buyerTel,
                                    address: r.buyerAddress ?? r.address,
                                }
                                : null);

                        // Keep old fields if present (soldAt, listedPrice, actualPrice)
                        const soldAt = r.soldAt ?? r.orderDate ?? r.order_date ?? null;
                        const listedPrice = Number(r.listedPrice ?? r.listed_price ?? itemDetail?.price ?? 0);
                        const actualPrice = Number(r.actualPrice ?? totalAmount);

                        return {
                            // normalized fields
                            ...r,
                            orderItemId,
                            orderId,
                            itemId,
                            itemDetail,
                            totalAmount,
                            feeValue,
                            quantity,
                            paymentMethod,
                            itemType,
                            income,
                            productCode,
                            imageUrl,
                            buyer,
                            soldAt,
                            listedPrice,
                            actualPrice,
                        };
                    })
                );

                // set to state
                setSales(merged);
            } catch (err) {
                console.error("❌ Lỗi khi tải lịch sử bán:", err);
                message.error("Không thể tải lịch sử bán.");
                setSales([]);
            } finally {
                setLoading(false);
            }
        };

        fetchSales();
    }, [sellerId, token, baseURL]);

    // Derived totals (EV / Battery) from merged sales
    const totalRevenueEV = sales
        .filter(
            (s) =>
                (s.itemType === "Ev" || s.itemDetail?.itemType === "Ev") &&
                ["Sold", "Completed", "Shipped"].includes(s.status)
        )
        .reduce((sum, s) => sum + (s.actualPrice || s.totalAmount || 0), 0);

    const totalRevenueBattery = sales
        .filter(
            (s) =>
                (s.itemType === "Battery" || s.itemDetail?.itemType === "Battery") &&
                ["Sold", "Completed", "Shipped"].includes(s.status)
        )
        .reduce((sum, s) => sum + (s.actualPrice || s.totalAmount || 0), 0);

    const totalSoldEV = sales.filter(
        (s) =>
            (s.itemType === "Ev" || s.itemDetail?.itemType === "Ev") &&
            ["Sold", "Completed", "Shipped"].includes(s.status)
    ).length;

    const totalSoldBattery = sales.filter(
        (s) =>
            (s.itemType === "Battery" || s.itemDetail?.itemType === "Battery") &&
            ["Sold", "Completed", "Shipped"].includes(s.status)
    ).length;

    const filteredSales = sales.filter((s) => {
        const matchStatus = filter === "all" || s.status === filter;
        const matchType = filterType === "all" || (s.itemType || s.itemDetail?.itemType) === filterType;
        return matchStatus && matchType;
    });

    // Loading skeleton
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
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow-sm p-6 flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Doanh thu Xe điện</p>
                            <p className="text-2xl font-bold text-gray-800">
                                {formatPrice(totalRevenueEV)}
                            </p>
                        </div>
                        <div className="bg-gray-100 p-3 rounded-lg">
                            <Car className="w-6 h-6 text-gray-600" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6 flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Xe điện đã bán</p>
                            <p className="text-2xl font-bold text-gray-800">{totalSoldEV}</p>
                        </div>
                        <div className="bg-gray-100 p-3 rounded-lg">
                            <Car className="w-6 h-6 text-gray-600" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6 flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Doanh thu Pin</p>
                            <p className="text-2xl font-bold text-gray-800">
                                {formatPrice(totalRevenueBattery)}
                            </p>
                        </div>
                        <div className="bg-gray-100 p-3 rounded-lg">
                            <RiBattery2ChargeLine className="w-6 h-6 text-gray-600" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6 flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Pin đã bán</p>
                            <p className="text-2xl font-bold text-gray-800">{totalSoldBattery}</p>
                        </div>
                        <div className="bg-gray-100 p-3 rounded-lg">
                            <RiBattery2ChargeLine className="w-6 h-6 text-gray-600" />
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-3 flex-wrap mb-4">
                    {[
                        { label: "Tất cả", value: "all" },
                        { label: "Đang bán", value: "Active" },
                        { label: "Đấu giá", value: "Auction_Active" },
                        { label: "Chờ xử lý", value: "Pending" },
                        { label: "Chờ thanh toán", value: "Pending_Pay" },
                        { label: "Đang thanh toán (Đấu giá)", value: "Auction_Pending_Pay" },
                        { label: "Đã bán", value: "Sold" },
                        { label: "Đã giao", value: "Shipped" },
                        { label: "Hoàn tất", value: "Completed" },
                        { label: "Từ chối", value: "Rejected" },
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

                {/* Type filter (Ev / Battery) */}
                <div className="flex gap-3 flex-wrap mb-6">
                    {[
                        { label: "Tất cả loại", value: "all" },
                        { label: "Xe điện", value: "Ev" },
                        { label: "Pin", value: "Battery" },
                    ].map((btn) => (
                        <button
                            key={btn.value}
                            onClick={() => setFilterType(btn.value)}
                            className={`px-3 py-2 rounded-lg border text-sm font-medium ${filterType === btn.value ? "bg-indigo-50 border-indigo-300 text-indigo-700" : "bg-white border-slate-200 hover:bg-slate-50"}`}
                        >
                            {btn.label}
                        </button>
                    ))}
                </div>

                {/* List */}
                {filteredSales.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">Không có giao dịch nào</p>
                    </div>
                ) : (
                    filteredSales.map((sale, index) => (
                        <div
                            key={`${sale.itemId ?? sale.orderItemId ?? index}-${index}`}
                            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow mb-4"
                        >
                            <div className="p-6 flex flex-col gap-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-gray-900 text-lg mb-2">
                                            {sale.itemDetail?.title ?? sale.title ?? `Item ${sale.itemId}`}
                                            <span className="ml-2 text-sm text-gray-500">{sale.productCode}</span>
                                        </h3>
                                        <div className="flex gap-4 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                Đặt:{" "}
                                                {sale.soldAt
                                                    ? new Date(sale.soldAt).toLocaleDateString("vi-VN")
                                                    : sale.orderDate
                                                        ? new Date(sale.orderDate).toLocaleDateString("vi-VN")
                                                        : "--"}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <DollarSign className="w-4 h-4" />
                                                {sale.paymentMethod}
                                            </span>
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
                                            src={sale.imageUrl ?? sale.itemDetail?.itemImage?.[0]?.imageUrl}
                                            alt={sale.itemDetail?.title ?? sale.title}
                                            className="w-36 h-28 object-cover rounded-lg border"
                                        />
                                        <div className="text-sm text-gray-700">
                                            {sale.itemDetail?.itemType === "Ev" || sale.itemType === "Ev" ? (
                                                <>
                                                    <p>
                                                        <b>Màu:</b> {sale.itemDetail?.evDetail?.color ?? sale.color ?? "-"}
                                                    </p>
                                                    <p>
                                                        <b>Năm:</b> {sale.itemDetail?.evDetail?.year ?? sale.year ?? "-"}
                                                    </p>
                                                    <p>
                                                        <b>ODO:</b> {sale.itemDetail?.evDetail?.mileage ? sale.itemDetail.evDetail.mileage.toLocaleString("vi-VN") + " km" : (sale.mileage ? sale.mileage.toLocaleString("vi-VN") + " km" : "-")}
                                                    </p>
                                                </>
                                            ) : (
                                                <>
                                                    <p>
                                                        <b>Dung lượng:</b> {sale.itemDetail?.batteryDetail?.capacity ?? sale.capacity ?? "-"} kWh
                                                    </p>
                                                    <p>
                                                        <b>Điện áp:</b> {sale.itemDetail?.batteryDetail?.voltage ?? sale.voltage ?? "-"} V
                                                    </p>
                                                    <p>
                                                        <b>Chu kỳ sạc:</b> {sale.itemDetail?.batteryDetail?.chargeCycles ?? sale.chargeCycles ?? "-"}
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
                                            <p className="text-gray-400 italic">Chưa có thông tin người mua</p>
                                        )}
                                    </div>
                                </div>

                                <div className="border-t pt-4 flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-gray-500">Trị giá đơn hàng</p>
                                        <p className="text-xl font-bold text-gray-600">
                                            {formatPrice(sale.totalAmount)}
                                        </p>

                                        <div className="mt-2 text-sm text-gray-500">
                                            <p><b>Phí triết khấu:</b> {formatPrice(sale.feeValue)}</p>
                                            <p><b>Số lượng:</b> {sale.quantity}</p>
                                            <p><b>Thu nhập:</b> <span className="font-semibold text-green-700">{formatPrice(sale.income)}</span></p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={async () => {
                                                setSelectedSale(sale)
                                                try {
                                                    const addrRes = await addressApi.getAddressById(sale.buyer?.addressId);
                                                    setAddressDetail(addrRes);
                                                } catch (err) {
                                                    console.error("Lỗi lấy địa chỉ:", err);
                                                    setAddressDetail(null);
                                                }
                                            }}
                                            className="flex items-center gap-2 px-4 py-2 border border-indigo-300 text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100 hover:shadow-sm transition-all duration-200"
                                        >
                                            <Eye className="w-4 h-4" /> Xem chi tiết
                                        </button>
                                    </div>
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
                            <h2 className="text-2xl font-bold text-gray-900">Chi tiết giao dịch</h2>
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
                                        src={selectedSale.imageUrl ?? selectedSale.itemDetail?.itemImage?.[0]?.imageUrl}
                                        alt={selectedSale.itemDetail?.title ?? selectedSale.title}
                                        className="w-full h-56 object-cover rounded-lg mb-4"
                                    />
                                    <p><b>Mã sản phẩm:</b> {selectedSale.productCode}</p>
                                    <p>
                                        <b>Loại:</b>{" "}
                                        {selectedSale.itemDetail?.itemType === "Ev" || selectedSale.itemType === "Ev"
                                            ? "Xe điện"
                                            : "Pin"}
                                    </p>

                                    {selectedSale.itemDetail?.itemType === "Ev" || selectedSale.itemType === "Ev" ? (
                                        <>
                                            <p><b>Tiêu đề:</b> {selectedSale.itemDetail?.title}</p>
                                            <p><b>Biển số:</b> {selectedSale.itemDetail?.evDetail?.licensePlate ?? selectedSale.licensePlate}</p>
                                            <p><b>Năm:</b> {selectedSale.itemDetail?.evDetail?.year ?? selectedSale.year}</p>
                                            <p><b>Màu:</b> {selectedSale.itemDetail?.evDetail?.color ?? selectedSale.color}</p>
                                            <p><b>ODO:</b> {selectedSale.itemDetail?.evDetail?.mileage ? selectedSale.itemDetail.evDetail.mileage.toLocaleString("vi-VN") + " km" : (selectedSale.mileage ? selectedSale.mileage.toLocaleString("vi-VN") + " km" : "-")}</p>
                                        </>
                                    ) : (
                                        <>
                                            <p><b>Tiêu đề:</b> {selectedSale.itemDetail?.title}</p>
                                            <p><b>Dung lượng:</b> {selectedSale.itemDetail?.batteryDetail?.capacity ?? selectedSale.capacity} kWh</p>
                                            <p><b>Điện áp:</b> {selectedSale.itemDetail?.batteryDetail?.voltage ?? selectedSale.voltage} V</p>
                                            <p><b>Chu kỳ sạc:</b> {selectedSale.itemDetail?.batteryDetail?.chargeCycles ?? selectedSale.chargeCycles}</p>
                                        </>
                                    )}
                                </div>
                            </div>

                            {selectedSale.buyer && (
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-3">Thông tin người mua</h3>
                                    <div className="bg-gray-50 rounded-lg p-4 space-y-1">
                                        <p><b>Họ tên:</b> {selectedSale.buyer.fullName}</p>
                                        <p><b>SĐT:</b> {selectedSale.buyer.phone}</p>

                                        {/* địa chỉ cũ */}
                                        <p><b>Địa chỉ (text):</b> {selectedSale.buyer.address}</p>

                                        {/* địa chỉ chi tiết lấy từ API */}
                                        {addressDetail && (
                                            <div className="mt-2 border-t pt-2">
                                                <p className="font-semibold text-gray-800 mb-1">Địa chỉ chi tiết:</p>
                                                <p>- {addressDetail.fullName}</p>
                                                <p>- {addressDetail.phoneNumber}</p>
                                                <p>- {addressDetail.addressDetail}</p>
                                                <p>- {addressDetail.wardName}, {addressDetail.districtName}, {addressDetail.provinceName}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-3">Thông tin giao dịch</h3>
                                <div className="bg-gray-50 rounded-lg p-4 space-y-1">
                                    <p><b>Trị giá đơn hàng:</b> {formatPrice(selectedSale.totalAmount)}</p>
                                    <p><b>Phí triết khấu:</b> {formatPrice(selectedSale.feeValue)}</p>
                                    <p><b>Thu nhập:</b> <span className="font-semibold">{formatPrice(selectedSale.income)}</span></p>
                                    <p><b>Số lượng:</b> {selectedSale.quantity}</p>
                                    <p><b>Phương thức thanh toán:</b> {selectedSale.paymentMethod}</p>
                                    <p><b>Ngày đặt:</b> {selectedSale.soldAt ? new Date(selectedSale.soldAt).toLocaleString("vi-VN") : (selectedSale.orderDate ? new Date(selectedSale.orderDate).toLocaleString("vi-VN") : "--")}</p>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex flex-col sm:flex-row gap-3 mt-6">
                            <button
                                onClick={() => setSelectedSale(null)}
                                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                            >
                                Đóng
                            </button>

                            {["Pending", "Processing", "Pending_Pay", "Auction_Pending_Pay"].includes(selectedSale.status) && (
                                <button
                                    disabled={confirming}
                                    onClick={async () => {
                                        const confirmed = confirm("Xác nhận đơn hàng này đã được giao?");
                                        if (!confirmed) return;
                                        try {
                                            setConfirming(true);

                                            // call orderApi (assume existing API)
                                            // keep payload minimal: just status change
                                            await orderApi.putOrder(selectedSale.orderId, {
                                                ...selectedSale,
                                                status: "Shipped",
                                            });

                                            message.success("Đã xác nhận đơn hàng thành công!");
                                            // update local state
                                            setSales((prev) =>
                                                prev.map((s) =>
                                                    (s.orderId === selectedSale.orderId && s.itemId === selectedSale.itemId)
                                                        ? { ...s, status: "Shipped" }
                                                        : s
                                                )
                                            );
                                            setSelectedSale(null);
                                        } catch (error) {
                                            console.error("Lỗi xác nhận:", error);
                                            message.error("Không thể xác nhận đơn hàng.");
                                        } finally {
                                            setConfirming(false);
                                        }
                                    }}
                                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 disabled:opacity-70"
                                >
                                    {confirming ? "Đang xử lý..." : "✅ Xác nhận đơn hàng"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
