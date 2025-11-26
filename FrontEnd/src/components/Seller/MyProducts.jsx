import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Form, Input, InputNumber, Select, Modal, Button, Spin, Alert, Tag } from "antd";
import ProductCreationModal from "../ItemForm/ProductCreationModal";
import walletApi from "../../api/walletApi";
import itemApi from "../../api/itemApi";
import commissionApi from "../../api/commissionApi";
import userApi from "../../api/userApi";
import evData from "../../assets/datas/evData";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const { TextArea } = Input;
const { Option } = Select;

export default function MyProducts() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [form] = Form.useForm();
  const brand = Form.useWatch("brand", form);
  const model = Form.useWatch("model", form);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [payType, setPayType] = useState(null);
  const [payLoading, setPayLoading] = useState(false);
  const [inlineMsg, setInlineMsg] = useState(null);
  const [feeCommission, setFeeCommission] = useState(0);
  const [moderationCommission, setModerationCommission] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const sellerId = localStorage.getItem("userId");
  const baseURL = import.meta.env.VITE_API_BASE_URL;

  const bodyStyles = ["Sedan", "Hatchback", "SUV", "Crossover", "Coupe", "Convertible", "Pickup", "Van / Minivan", "Wagon", "Other"];
  const colors = ["White", "Black", "Silver", "Gray", "Blue", "Red", "Green", "Yellow", "Orange", "Brown", "Beige", "Gold", "Purple", "Other"];
  const batteryBrands = ["Panasonic", "Samsung SDI", "LG Chem", "CATL", "BYD", "Tesla", "Hitachi", "Toshiba", "A123 Systems", "SK Innovation", "Other"];

  const fetchProducts = async () => {
    if (!sellerId) return;
    setLoading(true);
    try {
      const user = await userApi.getUserByID(sellerId);
      let listingFee, moderationFee;
      if (user.isStore) {
        listingFee = await commissionApi.getCommissionByFeeCode("FEESL");
        moderationFee = await commissionApi.getCommissionByFeeCode("FEESM");
      } else {
        listingFee = await commissionApi.getCommissionByFeeCode("FEEPL");
        moderationFee = await commissionApi.getCommissionByFeeCode("FEEPM");
      }
      setFeeCommission(listingFee.feeValue);
      setModerationCommission(moderationFee.feeValue);

      const res = await fetch(`${baseURL}sellers/${sellerId}/item`);
      const data = await res.json();
      if (data.message !== "Seller has no active items.") setProducts(data);
      setFiltered(data);
    } catch (err) {
      toast.error("Lỗi tải sản phẩm!");
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

  const translateStatus = (status) => {
    switch (status) {
      case "Active": return "Đang hoạt động";
      case "Auction_Active": return "Đang đấu giá";
      case "Pending": return "Chờ duyệt";
      case "Pending_Pay": return "Chờ thanh toán";
      case "Auction_Pending_Pay": return "Chờ thanh toán";
      case "Sold": return "Đã bán";
      case "Rejected": return "Bị từ chối";
      default: return "Không xác định";
    }
  };

  const translateModeration = (mod) => {
    switch (mod) {
      case "Approved": return "Đã kiểm duyệt";
      case "Pending": return "Đang chờ kiểm duyệt";
      case "Rejected": return "Bị từ chối kiểm duyệt";
      case "Not_Submitted": return "Chưa kiểm duyệt";
      case "Sold": return "Đã bán";
      default: return "Chưa kiểm duyệt";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active": return "green";
      case "Auction_Active": return "cyan";
      case "Pending": return "orange";
      case "Pending_Pay": return "blue";
      case "Auction_Pending_Pay": return "blue";
      case "Sold": return "gray";
      case "Rejected": return "red";
      default: return "default";
    }
  };

  const getModerationColor = (mod) => {
    switch (mod) {
      case "Approved": return "green";
      case "Pending": return "orange";
      case "Rejected": return "red";
      case "Not_Submitted": return "blue";
      default: return "default";
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa sản phẩm này?")) return;
    try {
      setDeleteLoading(true);
      await itemApi.deleteItem(itemId);
      toast.success("🗑️ Đã xóa sản phẩm!");
      fetchProducts();
    } catch (error) {
      toast.error("Xóa thất bại!");
    } finally {
      setDeleteLoading(false);
    }
  };

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
      setInlineMsg({ type: "error", text: "Không thể tải dữ liệu thanh toán." });
    } finally {
      setPayLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!wallet || (wallet.balance < feeCommission && payType === "listing") || (wallet.balance < moderationCommission && payType === "moderation")) {
      setInlineMsg({ type: "error", text: "Số dư ví không đủ để thanh toán." });
      return;
    }

    setPayLoading(true);
    setInlineMsg(null);

    try {
      const userId = localStorage.getItem("userId");
      const amount = payType === "listing" ? feeCommission : moderationCommission;

      await walletApi.withdrawWallet({
        userId,
        amount,
        type: "Withdraw",
        ref: selectedItem.itemId,
        description: payType === "listing"
          ? `Phí đăng bán sản phẩm ${selectedItem.title}`
          : `Phí kiểm duyệt sản phẩm ${selectedItem.title}`,
      });

      await walletApi.revenueWallet({
        userId: 4,
        amount,
        type: "Revenue",
        ref: selectedItem.itemId,
        description: payType === "listing"
          ? `Phí đăng bán sản phẩm ${selectedItem.title}`
          : `Phí kiểm duyệt sản phẩm ${selectedItem.title}`,
      });

      const updatePayload = { ...selectedItem, updatedAt: new Date().toISOString(), updatedBy: sellerId };
      if (payType === "listing") {
        updatePayload.status = updatePayload.status === "Auction_Pending_Pay" ? "Auction_Active" : "Active";
      }
      if (payType === "moderation") updatePayload.moderation = "Pending";

      await itemApi.putItem(selectedItem.itemId, updatePayload);

      setInlineMsg({ type: "success", text: payType === "listing" ? "Thanh toán đăng bán thành công! Sản phẩm đã được kích hoạt." : "Đã gửi yêu cầu kiểm duyệt thành công!" });

      setTimeout(() => {
        setIsPayModalOpen(false);
        fetchProducts();
      }, 1500);
    } catch (error) {
      setInlineMsg({ type: "error", text: "Có lỗi xảy ra khi xử lý thanh toán." });
    } finally {
      setPayLoading(false);
    }
  };

  const handleUpdateItem = async () => {
    try {
      const values = form.getFieldsValue();
      const categoryId = editingItem.itemType === "Ev" ? 1 : 2;

      if (editingItem.itemType === "Ev") {
        const evPayload = {
          brand: values.brand,
          model: values.model,
          version: values.version,
          year: Number(values.year),
          bodyStyle: values.bodyStyle,
          color: values.color,
          licensePlate: values.licensePlate,
          hasAccessories: values.hasAccessories,
          previousOwners: Number(values.previousOwners),
          isRegistrationValid: values.isRegistrationValid,
          mileage: Number(values.mileage),
          licenseUrl: editingItem.licenseUrl || null,
        };
        await itemApi.putItemDetailEV(editingItem.itemId, evPayload);
      }

      if (editingItem.itemType === "Battery") {
        const batteryPayload = {
          brand: editingItem.brand,
          capacity: Number(values.capacity),
          condition: editingItem.condition || values.condition,
          voltage: Number(values.voltage),
          chargeCycles: Number(values.chargeCycles),
        };
        await itemApi.putItemDetailBattery(editingItem.itemId, batteryPayload);
      }

      const commonPayload = {
        itemType: editingItem.itemType,
        title: editingItem.title,
        description: editingItem.description,
        price: Number(editingItem.price),
        quantity: Number(editingItem.quantity),
        categoryId,
        status: editingItem.status || "Active",
        moderation: "Not_Submitted",
        updatedAt: new Date().toISOString(),
        updatedBy: localStorage.getItem("userId"),
      };

      await itemApi.putItem(editingItem.itemId, commonPayload);
      toast.success("Cập nhật sản phẩm thành công!");
      setIsEditModalOpen(false);
      fetchProducts();
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi cập nhật sản phẩm!");
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Sản phẩm của tôi</h2>
        <ProductCreationModal onSuccess={fetchProducts} />
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-3 mb-6">
        <Input
          prefix={<Search size={16} />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: "all", label: "Tất cả" },
            { value: "Active", label: "Hoạt động" },
            { value: "Pending", label: "Chờ duyệt" },
            { value: "Pending_Pay", label: "Chờ thanh toán" },
            { value: "Rejected", label: "Bị từ chối" },
          ]}
        />
      </div>

      {filtered.message === "Seller has no active items." ? (
        <div className="flex justify-center items-center h-[40vh] text-gray-500">
          Không có sản phẩm nào phù hợp.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((item) => (
            <div key={item.itemId} className="bg-white shadow-md rounded-xl overflow-hidden">
              <img
                src={item.images?.[0]?.imageUrl || "https://via.placeholder.com/400"}
                className="w-full h-48 object-cover"
              />
              <div className="p-4 flex flex-col h-full">
                <h3 className="font-semibold truncate">{item.title}</h3>
                <p className="text-gray-500 line-clamp-2">{item.description}</p>
                <div className="flex gap-2 mt-1 mb-2">
                  <Tag color={getModerationColor(item.moderation)}>{translateModeration(item.moderation)}</Tag>
                  <Tag color={getStatusColor(item.status)}>{translateStatus(item.status)}</Tag>
                </div>

                {item.status === "Active" && (item.moderation === "Pending" || item.moderation === "Not_Submitted") && (
                  <div className="flex gap-2 mt-2">
                    <Button
                      onClick={() => {
                        setEditingItem({ ...item, categoryId: item.itemType === "Ev" ? 1 : 2 });
                        setIsEditModalOpen(true);
                      }}
                      className="w-1/2"
                    >
                      Sửa
                    </Button>
                    <Button
                      danger
                      className="w-1/2"
                      loading={deleteLoading}
                      onClick={() => handleDeleteItem(item.itemId)}
                    >
                      Xoá
                    </Button>
                  </div>
                )}
                {(item.moderation === "Not_Submitted" || item.moderation === "Rejected") && (
                  <Button block onClick={() => handlePayClick(item, "moderation")}>
                    Yêu cầu kiểm duyệt (₫{moderationCommission})
                  </Button>
                )}
                {(item.status === "Pending_Pay" || item.status === "Auction_Pending_Pay") && (
                  <Button type="primary" block onClick={() => handlePayClick(item, "listing")}>
                    Thanh toán đăng bán (₫{feeCommission})
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={null}
        title="Sửa sản phẩm"
        width={650}
      >
        {editingItem && (
          <Form layout="vertical" className="space-y-4">
            <Form.Item label="Tên sản phẩm">
              <Input
                value={editingItem.title}
                onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
              />
            </Form.Item>
            <Form.Item label="Mô tả chi tiết">
              <TextArea
                rows={3}
                value={editingItem.description}
                onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
              />
            </Form.Item>
            <div className="grid grid-cols-2 gap-4">
              <Form.Item label="Giá (VND)">
                <InputNumber
                  min={1000}
                  value={editingItem.price}
                  onChange={(val) => setEditingItem({ ...editingItem, price: Number(val) })}
                  style={{ width: "100%" }}
                />
              </Form.Item>
              <Form.Item label="Số lượng">
                <InputNumber
                  min={1}
                  value={editingItem.quantity}
                  onChange={(val) => setEditingItem({ ...editingItem, quantity: Number(val) })}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </div>
            {/* EV and Battery fields remain unchanged */}
            <Button type="primary" block className="mt-4 !h-[45px] !text-base" onClick={handleUpdateItem}>
              Lưu thay đổi
            </Button>
          </Form>
        )}
      </Modal>

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
            <p><strong>Sản phẩm:</strong> {selectedItem?.title}</p>
            <p><strong>Loại:</strong> {selectedItem.itemType === "Ev" ? "Xe điện (EV)" : "Pin (Battery)"}</p>
            <p><strong>Số dư ví hiện tại:</strong> {formatCurrency(wallet?.balance || 0)}</p>
            <p><strong>Phí thanh toán:</strong> {payType === "listing" ? feeCommission : moderationCommission}</p>

            {inlineMsg && <Alert type={inlineMsg.type} message={inlineMsg.text} showIcon className="mb-4" />}

            <div className="flex justify-end gap-3">
              <Button onClick={() => setIsPayModalOpen(false)}>Hủy</Button>
              <Button type="primary" loading={payLoading} onClick={handleConfirmPayment}>Xác nhận thanh toán</Button>
            </div>
          </>
        ) : (
          <p className="text-center text-gray-500">Không có dữ liệu để hiển thị.</p>
        )}
      </Modal>

      <ToastContainer position="top-right" autoClose={2500} />
    </div>
  );
}
