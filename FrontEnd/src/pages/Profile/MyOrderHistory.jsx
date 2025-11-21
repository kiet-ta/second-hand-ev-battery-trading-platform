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
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [reviewPayload, setReviewPayload] = useState(null);
  const buyerId = localStorage.getItem("userId");

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await orderApi.getOrdersByBuyerId(buyerId);
      const enriched = await Promise.all(
        (res || []).map(async (order) => {
          const items = await Promise.all(
            (order.items || []).map(async (it) => {
              try {
                const detail = await itemApi.getItemDetailByID(it.itemId);
                return { ...it, detail };
              } catch (err) {
                console.error("item detail fetch failed", err);
                return { ...it, detail: null };
              }
            })
          );
          return { ...order, items };
        })
      );
      setOrders(enriched);
    } catch (err) {
      console.error("fetchOrders error", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [buyerId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleOpenItemModal = (itemId) => {
    setSelectedItemId(itemId);
    setItemModalOpen(true);
  };

  const handleOpenReview = (order, item) => {
    setReviewPayload({ order, item });
  };

  // filter & search
  const filtered = orders
    .filter((o) => (activeTab === "All" ? true : o.status === activeTab))
    .filter((order) => {
      if (!search) return true;
      const s = search.toLowerCase();
      // search in order code, any item title or brand/model
      if ((order.orderCode || "").toLowerCase().includes(s)) return true;
      return order.items.some((it) => {
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
              placeholder="Bạn có thể tìm kiếm theo tên Shop, ID đơn hàng hoặc Tên Sản phẩm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={() => fetchOrders()}
            className="px-4 py-2 bg-[#D97706] text-white rounded-md hover:bg-[#b86f06]"
          >
            Tải lại
          </button>
        </div>

        {/* List */}
        {loading ? (
          <div className="w-full py-20 flex justify-center">
            <div className="animate-pulse text-gray-500">Đang tải đơn hàng...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="w-full py-20 text-center text-gray-500">Không có đơn hàng</div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map((order) => (
              <OrderCard
                key={order.orderId}
                order={order}
                onViewItem={(item) => handleOpenItemModal(item.detail?.itemId)}
                onMarkReceived={fetchOrders}
                onOpenReview={handleOpenReview}
                currentUserId={buyerId}
              />
            ))}
          </div>
        )}
      </div>

      {/* Item Detail Modal */}
      {selectedItemId && (
        <ItemDetailModal
          itemId={selectedItemId}
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
