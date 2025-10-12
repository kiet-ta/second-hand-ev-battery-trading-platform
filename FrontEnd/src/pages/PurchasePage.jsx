import { useState } from "react";
import mockOrders from "../assets/datas/orderData";
import RatingModal from "../components/RatingModal";

const tabs = [
  "All",
  "Pending",
  "Shipping",
  "To Receive",
  "Completed",
  "Cancelled",
  "Returns/Refunds",
];

export default function PurchasePage() {

    const [activeTab, setActiveTab] = useState("All");
  const [orders, setOrders] = useState(mockOrders);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const filteredOrders =
    activeTab === "All"
      ? orders
      : orders.filter((order) => order.status === activeTab);

  const openRatingModal = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  const submitReview = (orderId, rating, comment) => {
    const updatedOrders = orders.map((o) =>
      o.id === orderId ? { ...o, rating, comment } : o
    );
    setOrders(updatedOrders);
    closeModal();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-start py-10">
      <div className="w-4/5 bg-white rounded-lg shadow">
        {/* Tabs */}
        <div className="border-b">
          <div className="flex space-x-6 px-6">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 border-b-2 text-sm font-medium transition-colors
                  ${
                    activeTab === tab
                      ? "border-[var(--color-maincolor)] text-[var(--color-maincolor-darker)]"
                      : "border-transparent text-gray-500 hover:text-[var(--color-maincolor-darker)]"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length > 0 ? (
          <div className="divide-y">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="flex justify-between items-center px-6 py-4"
              >
                {/* Left: Product info */}
                <div className="flex items-center space-x-4">
                  <img
                    src={order.image}
                    alt={order.title}
                    className="w-20 h-20 object-cover rounded-md border"
                  />
                  <div>
                    <h3 className="font-medium">{order.title}</h3>
                    <p className="text-sm text-gray-500">
                      {order.shopName} • {order.category}
                    </p>
                    <p className="text-sm text-gray-600">
                      Qty: {order.quantity} • ${order.price.toFixed(2)}{" "}
                      {order.discount > 0 && (
                        <span className="text-red-500 ml-2">
                          -{order.discount}%
                        </span>
                      )}
                    </p>
                    {/* Status */}
                    <p className="text-xs mt-1 font-medium text-[var(--color-maincolor-darker)]">
                      Status: {order.status}
                    </p>
                  </div>
                </div>

                {/* Right: Rating Button */}
                <div className="text-right">
                  {order.status === "Completed" ? (
                    <button
                      onClick={() => openRatingModal(order)}
                      className="text-[var(--color-maincolor-darker)] text-sm hover:underline"
                    >
                      {order.rating ? `⭐ ${order.rating}` : "Rate Product"}
                    </button>
                  ) : (
                    <span className="text-gray-400 text-sm">—</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center text-gray-500">
            <p className="text-gray-600 font-medium">No orders yet</p>
          </div>
        )}
      </div>

      {/* Rating Modal */}
      <RatingModal
        visible={showModal}
        onCancel={closeModal}
        onSubmit={submitReview}
        order={selectedOrder}
      />
    </div>
  );
}