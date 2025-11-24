import React, { useState, useEffect } from "react";
import {
  Calendar,
  Car,
  DollarSign,
  User,
  Eye,
  Package
} from "lucide-react";
import { RiBattery2ChargeLine } from "react-icons/ri";
import { message } from "antd";
import itemApi from "../../api/itemApi";
import addressApi from "../../api/addressLocalApi";
import orderApi from "../../api/orderApi";

export default function HistorySold() {
  const [sales, setSales] = useState([]);
  const [filter, setFilter] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [selectedSale, setSelectedSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  const baseURL = import.meta.env.VITE_API_BASE_URL;
  const sellerId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price || 0);

  const getStatusColor = (status) => {
    switch ((status || "").toString()) {
      case "Pending": return "bg-yellow-100 text-yellow-800";
      case "Sold":
      case "Completed":
      case "Shipped": return "bg-green-100 text-green-800";
      case "Rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    switch ((status || "").toString()) {
      case "Pending": return "Chờ xử lý";
      case "Sold": return "Đã bán";
      case "Shipped": return "Đã giao";
      case "Completed": return "Hoàn tất";
      case "Rejected": return "Bị từ chối";
      default: return "Không xác định";
    }
  };

  // Fetch sales history
  useEffect(() => {
    const fetchSales = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${baseURL}history?sellerId=${sellerId}&PageNumber=1&PageSize=50`, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
        });
        if (!res.ok) throw new Error("Không thể tải dữ liệu lịch sử");
        const data = await res.json();
        const rawList = data?.items ?? data ?? [];

        const merged = await Promise.all(rawList.map(async (r) => {
          const order = r.order;
          let itemDetail = null;
          if (order?.itemId) {
            try {
              const resp = await itemApi.getItemDetailByID(order.itemId);
              itemDetail = resp?.data ?? resp;
            } catch (err) { console.error("Lỗi lấy chi tiết item", order.itemId, err); }
          }

          let buyerAddr = null;
          if (order?.addressId) {
            try {
              const addrResp = await addressApi.getAddressById(order.addressId);
              buyerAddr = addrResp?.data ?? addrResp;
            } catch (err) { console.error("Lỗi lấy địa chỉ", order.addressId, err); }
          }

          const itemType = itemDetail?.itemType ?? "Item";
          const totalAmount = Number(r.totalAmount ?? 0);
          const feeValue = Number(r.feeValue ?? 0);
          const quantity = Number(order?.quantity ?? itemDetail?.quantity ?? 1);
          const income = totalAmount - feeValue;
          const productCode = `CMS_${itemType.toUpperCase()}_${order?.orderId ?? ""}`;
          const imageUrl = itemDetail?.itemImage?.[0]?.imageUrl ?? null;

          const paymentRaw = r.paymentMethod ?? "";
          const paymentMethod = paymentRaw === "Wallet" ? "Ví" : /bank|transfer|ngân|banktransfer/i.test(paymentRaw) ? "Ngân hàng" : paymentRaw || "Khác";

          return {
            ...r,
            orderItemId: order?.orderItemId,
            orderId: order?.orderId,
            itemId: order?.itemId,
            status: order?.status,
            itemDetail,
            totalAmount,
            feeValue,
            quantity,
            income,
            productCode,
            imageUrl,
            paymentMethod,
            buyerAddress: buyerAddr
          };
        }));

        setSales(merged);
      } catch (err) {
        console.error("❌ Lỗi khi tải lịch sử bán:", err);
        message.error("Không thể tải lịch sử bán.");
        setSales([]);
      } finally { setLoading(false); }
    };
    fetchSales();
  }, [sellerId, token, baseURL]);

  const filteredSales = sales.filter(s => 
    (filter === "all" || s.status === filter) &&
    (filterType === "all" || s.itemDetail?.itemType === filterType)
  );

  if (loading) return <div className="p-8 max-w-5xl mx-auto space-y-3">{Array.from({length:3}).map((_,i)=><div key={i} className="animate-pulse bg-white p-6 rounded-lg shadow-sm h-40"></div>)}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* List */}
        {filteredSales.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Không có giao dịch nào</p>
          </div>
        ) : filteredSales.map((sale, index) => (
          <div key={sale.orderItemId ?? index} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow mb-4">
            <div className="p-6 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg mb-2">
                    {sale.itemDetail?.title ?? `Item ${sale.itemId}`}
                    <span className="ml-2 text-sm text-gray-500">{sale.productCode}</span>
                  </h3>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Ngày đặt: {new Date(sale.order?.createdAt).toLocaleDateString("vi-VN")}</span>
                    <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" /> {sale.paymentMethod}</span>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(sale.status)}`}>{getStatusText(sale.status)}</span>
              </div>

              {/* Details Button */}
              <div className="border-t pt-4 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Trị giá đơn hàng: {formatPrice(sale.totalAmount)}</p>
                  <p className="text-sm text-gray-500">Phí triết khấu: {formatPrice(sale.feeValue)}</p>
                  <p className="text-sm text-gray-500">Số lượng: {sale.quantity}</p>
                  <p className="text-sm text-gray-500 font-semibold text-green-700">Thu nhập: {formatPrice(sale.income)}</p>
                </div>
                <button onClick={() => setSelectedSale(sale)} className="flex items-center gap-2 px-4 py-2 border border-indigo-300 text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100">
                  <Eye className="w-4 h-4" /> Xem chi tiết
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Modal chi tiết */}
        {selectedSale && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Chi tiết giao dịch</h2>
                <button onClick={() => setSelectedSale(null)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                  <span className="font-medium">Trạng thái:</span>
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(selectedSale.status)}`}>
                    {getStatusText(selectedSale.status)}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Thông tin sản phẩm</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <img src={selectedSale.imageUrl} alt={selectedSale.itemDetail?.title} className="w-full h-56 object-cover rounded-lg mb-4" />
                    <p><b>Mã sản phẩm:</b> {selectedSale.productCode}</p>
                    <p><b>Loại:</b> {selectedSale.itemDetail?.itemType ?? "Item"}</p>
                  </div>
                </div>
                {selectedSale.buyerAddress && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Thông tin người mua</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-1">
                      <p><b>Họ tên:</b> {selectedSale.buyerAddress.recipientName}</p>
                      <p><b>SĐT:</b> {selectedSale.buyerAddress.phone}</p>
                      <p><b>Địa chỉ:</b> {`${selectedSale.buyerAddress.street}, ${selectedSale.buyerAddress.ward}, ${selectedSale.buyerAddress.district}, ${selectedSale.buyerAddress.province}`}</p>
                    </div>
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Thông tin giao dịch</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-1">
                    <p><b>Trị giá đơn hàng:</b> {formatPrice(selectedSale.totalAmount)}</p>
                    <p><b>Phí triết khấu:</b> {formatPrice(selectedSale.feeValue)}</p>
                    <p><b>Thu nhập:</b> {formatPrice(selectedSale.income)}</p>
                    <p><b>Số lượng:</b> {selectedSale.quantity}</p>
                    <p><b>Phương thức thanh toán:</b> {selectedSale.paymentMethod}</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button onClick={() => setSelectedSale(null)} className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Đóng</button>
                {["Pending"].includes(selectedSale.status) && (
                  <button
                    disabled={confirming}
                    onClick={async () => {
                      if (!confirm("Xác nhận đơn hàng đã giao?")) return;
                      try {
                        setConfirming(true);
                        await orderItemApi.putOrder(selectedSale.orderId, {...selectedSale, status: "Shipped"});
                        message.success("Đã xác nhận đơn hàng thành công!");
                        setSales(prev => prev.map(s => s.orderId === selectedSale.orderId ? {...s, status: "Shipped"} : s));
                        setSelectedSale(null);
                      } catch (err) {
                        console.error(err); message.error("Không thể xác nhận đơn hàng.");
                      } finally { setConfirming(false); }
                    }}
                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 disabled:opacity-70">
                    {confirming ? "Đang xử lý..." : "✅ Xác nhận đơn hàng"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
