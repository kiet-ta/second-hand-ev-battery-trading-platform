import React, { useEffect, useState, useCallback } from "react";
import { FiSearch } from "react-icons/fi";
import orderApi from "../../api/orderApi";
import itemApi from "../../api/itemApi";
import OrderCard from "../../components/Cards/OrderCard";
import ItemDetailModal from "../../components/Modals/ItemDetailModal";
import ReviewModal from "../../components/Modals/ReviewModal";

const TABS = [
  { key: "All", label: "Tất cả" },
  { key: "Pending", label: "Chờ xác nhận" },
  { key: "Paid", label: "Đã thanh toán" },
  { key: "Shipped", label: "Vận chuyển" },
  { key: "Completed", label: "Hoàn thành" },
  { key: "Canceled", label: "Đã hủy" },
];


export default function OrderPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderItem, setSelectedOrderItem] = useState(null);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [reviewPayload, setReviewPayload] = useState(null);
  const buyerId = localStorage.getItem("userId");

  // ✅ fetchOrders only runs on mount or when buyerId changes
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await orderApi.getOrdersByBuyerId(buyerId);
      console.log(res, "res")
      const enrichedOrders = await Promise.all(
        (res || []).map(async (order) => {
          const itemsWithDetails = await Promise.all(
            (order.items || []).map(async (it) => {
              try {
                const detail = await itemApi.getItemDetailByID(it.itemId);
                return { ...it, detail };
              } catch {
                return { ...it, detail: null };
              }
            })
          );
          const itemsTotal = order.items.reduce((acc, it) => acc + (it.price * it.quantity), 0);
          const totalPrice = itemsTotal + (order.shippingPrice || 0);

          return { ...order, items: itemsWithDetails, totalPrice };
        })
      );

      setOrders(enrichedOrders);
    } catch (err) {
      console.error(err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [buyerId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);



  const handleOpenItemModal = (order, item) => {
    setSelectedItemId(item.detail?.itemId);
    setSelectedOrder(order);
    setSelectedOrderItem(item);
    setItemModalOpen(true);
  };

  const handleOpenReview = (order, item) => {
    setReviewPayload({ order, item });
  };
  const translateStatus = (status) => {
    const map = {
      Pending: "Chờ xác nhận",
      Paid: "Đã thanh toán",
      Shipped: "Đã giao hàng",
      Completed: "Hoàn thành",
      Canceled: "Đã hủy"
    };
    return map[status] || status;
  };
  // Filter by tab & search
  const filteredOrders = orders
    .filter((o) => (activeTab === "All" ? true : o.status === activeTab))
    .filter((o) => {
      if (!search) return true;
      const s = search.toLowerCase();
      if ((o.orderId?.toString() || "").includes(s)) return true;
      return o.items.some((it) => {
        const title = it.detail?.title || "";
        const brandModel =
          it.detail?.evDetail
            ? `${it.detail.evDetail.brand} ${it.detail.evDetail.model}`
            : it.detail?.batteryDetail
              ? `${it.detail.batteryDetail.brand}`
              : "";
        return (
          title.toLowerCase().includes(s) ||
          brandModel.toLowerCase().includes(s)
        );
      });
    });

  return (
    <div className="min-h-screen bg-[#FAF8F3] py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Tabs */}
        <div className="flex items-center gap-4 mb-4 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === t.key
                ? "bg-white text-[#D97706] border border-[#D97706]"
                : "bg-white/60 text-gray-700 hover:bg-white"
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative w-full max-w-lg">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:shadow-sm"
              placeholder="Tìm kiếm sản phẩm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={fetchOrders}
            className="px-4 py-2 bg-[#D97706] text-white rounded-md hover:bg-[#b86f06]"
          >
            Tải lại
          </button>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="w-full py-20 flex justify-center">
            <div className="animate-pulse text-gray-500">Đang tải đơn hàng...</div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="w-full py-20 text-center text-gray-500">Không có đơn hàng</div>
        ) : (
          <div className="flex flex-col gap-6">
            {filteredOrders.map((order) => (
              <div
                key={order.orderId}
                className="bg-white shadow-md rounded-lg p-4 border border-[#E8E4DC]"
              >
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <span className="font-bold text-gray-700">
                      Đơn hàng #{order.orderId}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-500 text-sm">Phí giao hàng: </span>
                    <span className="font-semibold text-[#B8860B]">
                      {order.shippingPrice?.toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      })}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {order.items.map((it) => (
                    <div
                      key={it.orderItemId}
                      className="p-4 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition"
                    >
                      {/* Status */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-500">
                          Trạng thái:
                          <span
                            className={`ml-1 font-semibold ${it.status === "Completed"
                              ? "text-green-600"
                              : it.status === "Canceled"
                                ? "text-red-500"
                                : "text-[#D97706]"
                              }`}
                          >
                            {translateStatus(it.status)}
                          </span>
                        </span>
                      </div>

                      <OrderCard
                        orderItem={it}
                        order={order}
                        onViewItem={() => handleOpenItemModal(order, it)}
                        onMarkReceived={() => { }}
                        onOpenReview={handleOpenReview}
                        currentUserId={buyerId}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex justify-end mt-4">
                  <span className="font-bold text-lg text-[#D4AF37]">
                    Tổng:{" "}
                    {order.totalPrice.toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Item Detail Modal */}
      {selectedItemId && (
        <ItemDetailModal
          itemId={selectedItemId}
          orderItem={selectedOrderItem}
          orderInfo={selectedOrder}
          open={itemModalOpen}
          onClose={() => setItemModalOpen(false)}
        />
      )}

      {/* Review Modal */}
      {reviewPayload && (
        <ReviewModal
          order={{
            image: reviewPayload.item.detail?.itemImage?.[0]?.imageUrl,
            title: reviewPayload.item.detail?.title,
            orderCode: reviewPayload.order.orderId,
            itemId: reviewPayload.item.itemId,
          }}
          isOpen={!!reviewPayload}
          onClose={() => setReviewPayload(null)}
          onReviewSubmit={() => {
            setReviewPayload(null);
            fetchOrders();
          }}
        />
      )}
    </div>
  );
}
