import React, { useEffect, useState } from "react";
import { Tag, CheckCircle, XCircle, Search } from "lucide-react";
import { Input, Select, Modal, Button, Spin, Alert } from "antd";
import ProductCreationModal from "../ItemForm/ProductCreationModal";
import walletApi from "../../api/walletApi";
import itemApi from "../../api/itemApi";
import commissionApi from "../../api/commissionApi";
import kycApi from "../../api/kycApi";
import userApi from "../../api/userApi";

export default function MyProducts() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [payType, setPayType] = useState(null); // "listing" | "moderation"
  const [payLoading, setPayLoading] = useState(false);
  const [inlineMsg, setInlineMsg] = useState(null);
  const [feeCommission, setFeeCommission] = useState(0);
  const [moderationCommission, setModerationCommission] = useState(0);

  const sellerId = localStorage.getItem("userId");
  const baseURL = import.meta.env.VITE_API_BASE_URL;

  const fetchProducts = async () => {
    if (!sellerId) return;
    setLoading(true);
    try {
      const user = await userApi.getUserByID(sellerId)
      let listingFee;
      let moderationFee;
      if (user.isStore) {
        listingFee = await commissionApi.getCommissionByFeeCode("FEESL")
        moderationFee = await commissionApi.getCommissionByFeeCode("FEESM")
      }
      else {
        listingFee = await commissionApi.getCommissionByFeeCode("FEEPL")
        moderationFee = await commissionApi.getCommissionByFeeCode("FEEPM")
      }
      setFeeCommission(listingFee.feeValue)
      setModerationCommission(moderationFee.feeValue)
      const res = await fetch(`${baseURL}sellers/${sellerId}/item`);
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

  const handlePayClick = async (item, type) => {
    try {
      setInlineMsg(null);
      setPayLoading(true);
      const [walletData, itemDetail] = await Promise.all([
        walletApi.getWalletByUser(sellerId),
        itemApi.getItemDetailByID(item.itemId),
      ]);
      setWallet(walletData);
      setSelectedItem(itemDetail);
      setPayType(type);
      setIsPayModalOpen(true);
    } catch (err) {
      console.error(err);
      setInlineMsg({ type: "error", text: "Không thể tải dữ liệu thanh toán." });
    } finally {
      setPayLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!wallet || (wallet.balance < feeCommission && payType == "listing") || (wallet.balance < moderationCommission && payType == "moderation")) {
      setInlineMsg({
        type: "error",
        text: `Số dư ví không đủ để thanh toán.`,
      });
      return;
    }

    setPayLoading(true);
    setInlineMsg(null);

    try {
      const userId = localStorage.getItem("userId");
      const amount = payType === "listing" ? feeCommission : moderationCommission
      await walletApi.withdrawWallet({
        userId,
        amount: amount,
        type: "Withdraw",
        ref: selectedItem.itemId,
        description:
          payType === "listing"
            ? `Phí đăng bán sản phẩm ${selectedItem.title}`
            : `Phí kiểm duyệt sản phẩm ${selectedItem.title}`,
      });

      const updatePayload = {
        ...selectedItem,
        updatedAt: new Date().toISOString(),
        updatedBy: sellerId,
      };
      if (payType === "listing") {
        const paymentState = updatePayload.status == "Auction_Pending_Pay" ? "Auction_Active" : "Active"
        updatePayload.status = paymentState;
      }
      if (payType === "moderation") updatePayload.moderation = "Pending";

      await itemApi.putItem(selectedItem.itemId, updatePayload);

      setInlineMsg({
        type: "success",
        text:
          payType === "listing"
            ? "✅ Thanh toán đăng bán thành công! Sản phẩm đã được kích hoạt."
            : "✅ Đã gửi yêu cầu kiểm duyệt thành công!",
      });

      setTimeout(() => {
        setIsPayModalOpen(false);
        fetchProducts();
      }, 1500);
    } catch (error) {
      console.error(error);
      setInlineMsg({ type: "error", text: "Có lỗi xảy ra khi xử lý thanh toán." });
    } finally {
      setPayLoading(false);
    }
  };

  const translateStatus = (status) => {
    switch (status) {
      case "Active":
        return "Đang hoạt động";
      case "Auction_Active":
        return "Đang hoạt động (Đấu giá)";
      case "Pending":
        return "Chờ duyệt";
      case "Pending_Pay":
        return "Chờ thanh toán";
      case "Auction_Pending_Pay":
        return "Chờ thanh toán"
      case "Rejected":
        return "Bị từ chối";
      default:
        return status || "Không xác định";
    }
  };

  const translateModeration = (mod) => {
    switch (mod) {
      case "Approved":
        return "Đã kiểm duyệt";
      case "Pending":
        return "Đang chờ kiểm duyệt";
      case "Rejected":
        return "Bị từ chối kiểm duyệt";
      default:
        return "Chưa kiểm duyệt";
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
        <h2 className="text-2xl font-bold text-gray-900">Sản phẩm của tôi</h2>
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
            { value: "Active", label: "Đang hoạt động" },
            { value: "Pending", label: "Chờ duyệt" },
            { value: "Pending_Pay", label: "Chờ thanh toán" },
            { value: "Rejected", label: "Bị từ chối" },
          ]}
          className="w-48"
        />
      </div>

      {/* Product List */}
      {filtered.length === 0 ? (
        <div className="flex justify-center items-center h-[40vh] text-gray-500">
          Không có sản phẩm nào phù hợp.
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
                  className={`absolute top-2 right-2 text-xs font-semibold px-2 py-1 rounded-full ${(item.status === "Active" || item.status === "Auction_Active")
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                    }`}
                >
                  {translateStatus(item.status)}
                </span>
              </div>

              <div className="p-4 flex flex-col justify-between flex-1">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 truncate mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                    {item.description || "Không có mô tả"}
                  </p>
                  <p className="text-xs text-gray-500 italic mb-2">
                    {translateModeration(item.moderation)}
                  </p>
                </div>

                {/* 2 nút hành động */}
                <div className="flex flex-col gap-2 mt-auto">
                  {(item.status === "Pending_Pay" || item.status === "Auction_Pending_Pay") && (
                    <Button
                      type="primary"
                      block
                      onClick={() => handlePayClick(item, "listing")}
                    >
                      Thanh toán đăng bán (₫{feeCommission})
                    </Button>
                  )}

                  {item.moderation !== "Approved" && item.moderation !== "Pending" && (
                    <Button
                      block
                      onClick={() => handlePayClick(item, "moderation")}
                    >
                      Yêu cầu kiểm duyệt (₫{moderationCommission})
                    </Button>
                  )}
                </div>
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
              {selectedItem.itemType === "Ev" ? "Xe điện (EV)" : "Pin (Battery)"}
            </p>
            <p className="text-gray-700 mb-2">
              <strong>Số dư ví hiện tại:</strong>{" "}
              {formatCurrency(wallet?.balance || 0)}
            </p>
            <p className="text-gray-700 mb-4">
              {payType == "listing" ?
                <><strong>Phí thanh toán: </strong> đ{feeCommission}</>:
                <><strong>Phí thanh toán: </strong> đ{moderationCommission}</>}

            </p>

            {inlineMsg && (
              <Alert
                type={inlineMsg.type}
                message={inlineMsg.text}
                showIcon
                className="mb-4"
              />
            )}

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