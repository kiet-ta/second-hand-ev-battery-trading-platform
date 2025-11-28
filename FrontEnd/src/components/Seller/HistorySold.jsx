import React, { useState, useEffect } from "react";
import { Calendar, Car, DollarSign, User, Eye, Package } from "lucide-react";
import { RiBattery2ChargeLine } from "react-icons/ri";
import orderItemApi from "../../api/orderItemApi";
import itemApi from "../../api/itemApi";
import userApi from "../../api/userApi";
import addressApi from "../../api/addressLocalApi";

export default function HistorySold() {
  const [sales, setSales] = useState([]);
  const [filter, setFilter] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [selectedSale, setSelectedSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const baseURL = import.meta.env.VITE_API_BASE_URL;
  const [message, setMessage] = useState("");
  const sellerId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price || 0);

  const getStatusColor = (status) => {
    switch ((status || "").toString()) {
      case "Active":
      case "Auction_Active":
        return "bg-blue-100 text-blue-800";
      case "Pending":
      case "Pending_Pay":
      case "Auction_Pending_Pay":
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
        return "Đang hoạt động";
      case "Pending":
        return "Chờ xử lý";
      case "Shipped":
        return "Đã giao"
      case "Sold":
        return "Đã bán hết";
      default:
        return "Không xác định";
    }
  };
  const handleConfirmShipping = async (orderItemId) => {
    await orderItemApi.confirmShipping(orderItemId)
    setMessage("Xác nhận đơn hàng thành công!");
    const updatedSales = sales.map(sale => {
      if (sale.orderItemId === orderItemId) {
        return { ...sale, status: "Shipped" };
      }
      return sale;
    });
    setSales(updatedSales);
  }
  useEffect(() => {
    const fetchSales = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${baseURL}history?sellerId=${sellerId}&PageNumber=1&PageSize=50`, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });

        if (!res.ok) throw new Error("Không thể tải dữ liệu lịch sử");

        const data = await res.json();
        const rawList = data?.items ?? data ?? [];

        const merged = await Promise.all(
          rawList.map(async (r) => {
            const order = r.order;
            const orderItemId = order?.orderItemId;
            const orderId = order?.orderId;
            const itemId = order?.itemId;
            const quantity = order?.quantity ?? 1;
            const status = r.status ?? order?.status ?? "Pending";
            const totalAmount = r.totalAmount ?? order?.price ?? 0;
            const feeValue = r.feeValue ?? 0;
            const paymentMethodRaw = r.paymentMethod ?? "Ví";
            const paymentMethod = /wallet|ví/i.test(paymentMethodRaw) ? "Ví" : "Ngân hàng";
            const addressId = r.addressId;

            // Item detail
            let itemDetail = null;
            try {
              if (itemId) {
                const resp = await itemApi.getItemDetailByID(itemId);
                itemDetail = resp?.data ?? resp;
              }
            } catch (err) {
              console.error("Lỗi lấy chi tiết item", itemId, err);
            }

            // Buyer info
            let buyerInfo = null;
            try {
              if (order?.buyerId) {
                const userResp = await userApi.getUserByID(order.buyerId);
                buyerInfo = userResp?.data ?? userResp;
              }
            } catch (err) {
              console.error("Lỗi lấy thông tin người mua", order?.buyerId, err);
            }

            // Buyer address
            const addrResp = await addressApi.getAddressById(addressId);
            const buyer = {
              fullName: buyerInfo?.fullName ?? "N/A",
              phone: buyerInfo?.phone ?? "N/A",
              address: addrResp
                ? `${addrResp.street}, ${addrResp.ward}, ${addrResp.district}, ${addrResp.province}`
                : "N/A",
            };

            const income = totalAmount - feeValue;
            const itemType = itemDetail?.itemType ?? "Item";
            const productCode = `CMX_${itemType.toUpperCase()}_${orderId}`;
            const imageUrl = itemDetail?.itemImage?.[0]?.imageUrl ?? "https://via.placeholder.com/150";

            return {
              ...r,
              orderItemId,
              orderId,
              itemId,
              itemDetail,
              quantity,
              status,
              totalAmount,
              feeValue,
              paymentMethod,
              income,
              productCode,
              imageUrl,
              buyer,
            };
          })
        );

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

  const filteredSales = sales.filter((s) => {
    const matchStatus = filter === "all" || s.status === filter;
    const matchType = filterType === "all" || (s.itemType || s.itemDetail?.itemType) === filterType;
    return matchStatus && matchType;
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Filters */}
        <div className="flex gap-3 flex-wrap mb-6">
          {[{ label: "Tất cả", value: "all" }, { label: "Đang bán", value: "Active" }, { label: "Đấu giá", value: "Auction_Active" }, { label: "Chờ xử lý", value: "Pending" }, { label: "Chờ thanh toán", value: "Pending_Pay" }, { label: "Đang thanh toán (Đấu giá)", value: "Auction_Pending_Pay" }, { label: "Đã bán", value: "Sold" }, { label: "Đã giao", value: "Shipped" }, { label: "Hoàn tất", value: "Completed" }, { label: "Từ chối", value: "Rejected" }].map(btn => (
            <button key={btn.value} onClick={() => setFilter(btn.value)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-300 ${filter === btn.value ? "bg-indigo-50 border-indigo-300 text-indigo-700 shadow-sm" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"}`}>
              {btn.label}
            </button>
          ))}
        </div>

        <div className="flex gap-3 flex-wrap mb-6">
          {[{ label: "Tất cả loại", value: "all" }, { label: "Xe điện", value: "Ev" }, { label: "Pin", value: "Battery" }].map(btn => (
            <button key={btn.value} onClick={() => setFilterType(btn.value)}
              className={`px-3 py-2 rounded-lg border text-sm font-medium ${filterType === btn.value ? "bg-indigo-50 border-indigo-300 text-indigo-700" : "bg-white border-slate-200 hover:bg-slate-50"}`}>
              {btn.label}
            </button>
          ))}
        </div>

        {filteredSales.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Không có giao dịch nào</p>
          </div>
        ) : (
          filteredSales.map((sale, index) => (
            <div key={`${sale.itemId ?? sale.orderItemId ?? index}-${index}`} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow mb-4">
              <div className="p-6 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg mb-2">
                      {sale.itemDetail?.title ?? `Item ${sale.itemId}`}
                      <span className="ml-2 text-sm text-gray-500">{sale.productCode}</span>
                    </h3>
                    <div className="flex gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" /> Đặt: {sale.order?.createdAt ? new Date(sale.order.createdAt).toLocaleDateString("vi-VN") : "--"}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" /> {sale.paymentMethod}
                      </span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(sale.status)}`}>
                    {getStatusText(sale.status)}
                  </span>
                </div>

                {/* Card details */}
                <div className="grid md:grid-cols-2 gap-6 mt-3">
                  <div className="flex gap-4">
                    <img src={sale.imageUrl} alt={sale.itemDetail?.title} className="w-36 h-28 object-cover rounded-lg border" />
                    <div className="text-sm text-gray-700">
                      {sale.itemDetail?.itemType === "Ev" || sale.itemType === "Ev" ? (
                        <>
                          <p><b>Màu:</b> {sale.itemDetail?.evDetail?.color ?? "-"}</p>
                          <p><b>Năm:</b> {sale.itemDetail?.evDetail?.year ?? "-"}</p>
                          <p><b>ODO:</b> {sale.itemDetail?.evDetail?.mileage?.toLocaleString("vi-VN") ?? "-"}</p>
                        </>
                      ) : (
                        <>
                          <p><b>Dung lượng:</b> {sale.itemDetail?.batteryDetail?.capacity ?? "-"} kWh</p>
                          <p><b>Điện áp:</b> {sale.itemDetail?.batteryDetail?.voltage ?? "-"} V</p>
                          <p><b>Chu kỳ sạc:</b> {sale.itemDetail?.batteryDetail?.chargeCycles ?? "-"}</p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <User className="w-4 h-4 mr-2" /> Người mua
                    </h4>
                    <div className="space-y-1 text-sm text-gray-700">
                      <p><b>Họ tên:</b> {sale.buyer.fullName}</p>
                      <p><b>SĐT:</b> {sale.buyer.phone}</p>
                      <p><b>Địa chỉ:</b> {sale.buyer.address}</p>
                      <p><b>Trị giá đơn hàng:</b> {formatPrice(sale.totalAmount)}</p>
                      <p><b>Phí triết khấu:</b> {formatPrice(sale.feeValue)}</p>
                      <p><b>Phí ship</b> {formatPrice(sale.shippingPrice)}</p>
                      <p><b>Số lượng:</b> {sale.quantity}</p>
                      <p><b>Thu nhập:</b> <span className="font-semibold text-green-700">{formatPrice(sale.income)}</span></p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4 flex justify-end gap-4">
                  <div>{message && <p className="text-green-600 mb-2">{message}</p>}</div>
                  <button onClick={() => setSelectedSale(sale)}
                    className="flex items-center gap-2 px-4 py-2 border border-indigo-300 text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100 hover:shadow-sm transition-all duration-200">
                    <Eye className="w-4 h-4" /> Xem chi tiết
                  </button>
                  {sale.status === "Pending" && (
                    <button onClick={() => handleConfirmShipping(sale.orderItemId)}
                      className="flex items-center gap-2 px-4 py-2 border border-green-300 text-green-700 bg-green-50 rounded-lg hover:bg-green-100 hover:shadow-sm transition-all duration-200">
                      <Eye className="w-4 h-4" /> Xác nhận đơn hàng
                    </button>

                  )}

                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {selectedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
            <button onClick={() => setSelectedSale(null)} className="absolute top-3 right-3 text-gray-500 hover:text-gray-800">
              ✕
            </button>
            <div className="p-6 flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0 w-full md:w-1/2">
                <img src={selectedSale.imageUrl} alt={selectedSale.itemDetail?.title} className="w-full h-64 object-cover rounded-lg border" />
                <div className="mt-4 text-gray-700">
                  <h3 className="font-semibold text-lg">{selectedSale.itemDetail?.title}</h3>
                  {selectedSale.itemDetail?.itemType === "Ev" ? (
                    <>
                      <p><b>Màu:</b> {selectedSale.itemDetail?.evDetail?.color ?? "-"}</p>
                      <p><b>Năm:</b> {selectedSale.itemDetail?.evDetail?.year ?? "-"}</p>
                      <p><b>ODO:</b> {selectedSale.itemDetail?.evDetail?.mileage?.toLocaleString("vi-VN") ?? "-"}</p>
                    </>
                  ) : (
                    <>
                      <p><b>Dung lượng:</b> {selectedSale.itemDetail?.batteryDetail?.capacity ?? "-"} kWh</p>
                      <p><b>Điện áp:</b> {selectedSale.itemDetail?.batteryDetail?.voltage ?? "-"} V</p>
                      <p><b>Chu kỳ sạc:</b> {selectedSale.itemDetail?.batteryDetail?.chargeCycles ?? "-"}</p>
                    </>
                  )}
                </div>
              </div>
              <div className="flex-1 bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <User className="w-4 h-4 mr-2" /> Người mua
                </h4>
                <div className="space-y-1 text-sm text-gray-700">
                  <p><b>Mã đơn hàng:</b> {selectedSale.productCode}</p>
                  <p><b>Họ tên:</b> {selectedSale.buyer.fullName}</p>
                  <p><b>SĐT:</b> {selectedSale.buyer.phone}</p>
                  <p><b>Địa chỉ:</b> {selectedSale.buyer.address}</p>
                  <p><b>Trị giá đơn hàng:</b> {formatPrice(selectedSale.totalAmount)}</p>
                  <p><b>Phí triết khấu:</b> {formatPrice(selectedSale.feeValue)}</p>
                  <p><b>Phí giao hàng:</b> {formatPrice(selectedSale.shippingPrice)}</p>
                  <p><b>Số lượng:</b> {selectedSale.quantity}</p>
                  <p><b>Thu nhập:</b> <span className="font-semibold text-green-700">{formatPrice(selectedSale.income)}</span></p>
                  <p><b>Thanh toán:</b> {selectedSale.paymentMethod}</p>
                  <p><b>Trạng thái:</b> {getStatusText(selectedSale.status)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
