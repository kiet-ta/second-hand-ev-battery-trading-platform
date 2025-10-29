import React, { useEffect, useState } from "react";
import { Clock, Tag, CheckCircle, XCircle, Search } from "lucide-react";
import { Input, Select, Modal, Button, Spin } from "antd";
import ProductCreationModal from "../ItemForm/ProductCreationModal";
import walletApi from "../../api/walletApi";
import itemApi from "../../api/itemApi";

export default function MyProducts() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [payLoading, setPayLoading] = useState(false);

  const sellerId = localStorage.getItem("userId");
  const baseURL = import.meta.env.VITE_API_BASE_URL;

  const fetchProducts = async () => {
    if (!sellerId) return;
    setLoading(true);
    try {
      const res = await fetch(`${baseURL}item/seller/${sellerId}`);
      if (!res.ok) throw new Error("Không thể tải danh sách sản phẩm");
      const data = await res.json();
      setProducts(data);
      setFiltered(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    let data = [...products];
    if (searchTerm)
      data = data.filter(
        (p) =>
          p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    if (statusFilter !== "all") data = data.filter((p) => p.status === statusFilter);
    setFiltered(data);
  }, [searchTerm, statusFilter, products]);

  const formatCurrency = (num) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);

  const handlePayClick = async (item) => {
    try {
      setPayLoading(true);
      const [walletData, itemDetail] = await Promise.all([
        walletApi.getWalletByUser(sellerId),
        itemApi.getItemDetailByID(item.itemId),
      ]);
      setWallet(walletData);
      setSelectedItem(itemDetail);
      setIsPayModalOpen(true);
    } catch (err) {
      console.error(err);
    } finally {
      setPayLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!wallet || wallet.balance < 100000) {
      return;
    }

    setPayLoading(true);
    try {
      await walletApi.depositWallet({ userId: sellerId, amount: 100000 });
      setWallet((prev) => ({ ...prev, balance: prev.balance - 100000 }));

      const categoryId = selectedItem.itemType === "ev" ? 1 : 2;
      const updatePayload = {
        itemId: selectedItem.itemId,
        itemType: selectedItem.itemType,
        categoryId,
        title: selectedItem.title,
        description: selectedItem.description || "",
        price: selectedItem.price || 0,
        quantity: selectedItem.quantity || 1,
        createdAt: selectedItem.createdAt,
        updatedAt: new Date().toISOString(),
        updatedBy: sellerId,
        moderation: selectedItem.moderation || "approved",
        images:
          selectedItem.itemImage?.map((img) => ({
            imageId: img.imageId,
            imageUrl: img.imageUrl,
          })) || [],
        sellerName: selectedItem.sellerName || "",
        status: "active",
        itemDetail: JSON.stringify({}),
      };

      await itemApi.putItem(selectedItem.itemId, updatePayload);

      if (selectedItem.itemType === "ev" && selectedItem.evDetail) {
        await itemApi.putItemDetailEV(selectedItem.itemId, selectedItem.evDetail);
      } else if (selectedItem.itemType === "battery" && selectedItem.batteryDetail) {
        await itemApi.putItemDetailBattery(selectedItem.itemId, selectedItem.batteryDetail);
      }

      setIsPayModalOpen(false);
      fetchProducts();
    } catch (error) {
      console.error(error);
    } finally {
      setPayLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-[70vh] text-gray-500 text-lg">
        🔄 Đang tải sản phẩm...
      </div>
    );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Products</h2>
        <ProductCreationModal onSuccess={fetchProducts} />
      </div>

      {/* Filter + Search */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 mb-6">
        <Input
          prefix={<Search size={16} />}
          placeholder="Tìm sản phẩm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="sm:w-1/2"
        />
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: "all", label: "Tất cả" },
            { value: "active", label: "Đang hoạt động" },
            { value: "pending", label: "Chờ duyệt" },
            { value: "pending_pay", label: "Chờ thanh toán" },
            { value: "rejected", label: "Từ chối" },
          ]}
          className="w-48"
        />
      </div>

      {/* Products List */}
      {products.length === 0 ? (
        <div className="flex flex-col justify-center items-center h-[40vh] text-gray-500">
          <p className="text-lg font-medium">Người dùng chưa có sản phẩm.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col justify-center items-center h-[40vh] text-gray-500">
          <p className="text-lg font-medium">Không có sản phẩm nào phù hợp.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((item) => (
            <div
              key={item.itemId}
              className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col"
            >
              <div className="relative">
                <img
                  src={
                    item.images?.[0]?.imageUrl ||
                    "https://via.placeholder.com/400x250?text=No+Image"
                  }
                  alt={item.title}
                  className="w-full h-48 object-cover"
                />
                <span
                  className={`absolute top-2 right-2 text-xs font-semibold px-2 py-1 rounded-full ${
                    item.status === "active"
                      ? "bg-green-100 text-green-700"
                      : item.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : item.status === "pending_pay"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {item.status === "pending_pay" ? "Chờ thanh toán" : item.status}
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 truncate mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                    {item.description || "Không có mô tả"}
                  </p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-blue-600 font-semibold text-lg">
                      {formatCurrency(item.price)}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock size={12} />{" "}
                      {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Tag size={14} /> {item.categoryName || "N/A"}
                    </span>
                    <span className="flex items-center gap-1">
                      {item.status === "active" ? (
                        <CheckCircle size={14} className="text-green-600" />
                      ) : (
                        <XCircle size={14} className="text-gray-400" />
                      )}
                      {item.quantity} in stock
                    </span>
                  </div>
                </div>

                {item.status === "pending_pay" && (
                  <Button
                    type="primary"
                    block
                    className="mt-3"
                    onClick={() => handlePayClick(item)}
                  >
                    Thanh toán ₫100,000
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payment Modal */}
      <Modal
        title="Xác nhận thanh toán"
        open={isPayModalOpen}
        onCancel={() => setIsPayModalOpen(false)}
        footer={null}
      >
        {payLoading ? (
          <div className="flex justify-center py-6">
            <Spin />
          </div>
        ) : selectedItem ? (
          <>
            <p className="text-gray-700 mb-2">
              <strong>Sản phẩm:</strong> {selectedItem?.title}
            </p>
            <p className="text-gray-700 mb-2">
              <strong>Loại:</strong>{" "}
              {selectedItem.itemType === "ev" ? "Xe điện (EV)" : "Pin (Battery)"}
            </p>
            <p className="text-gray-700 mb-2">
              <strong>Số dư ví hiện tại:</strong>{" "}
              {formatCurrency(wallet?.balance || 0)}
            </p>
            <p className="text-gray-700 mb-4">
              <strong>Phí thanh toán:</strong> ₫100,000
            </p>
            <div className="flex justify-end gap-3">
              <Button onClick={() => setIsPayModalOpen(false)}>Hủy</Button>
              <Button
                type="primary"
                loading={payLoading}
                onClick={handleConfirmPayment}
              >
                Xác nhận thanh toán
              </Button>
            </div>
          </>
        ) : (
          <p className="text-center text-gray-500">Không có dữ liệu để hiển thị.</p>
        )}
      </Modal>
    </div>
  );
}
