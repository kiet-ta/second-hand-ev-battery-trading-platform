import React, { useEffect, useState } from "react";
import { Tag, Search } from "lucide-react";
import { Form, Input, InputNumber, Checkbox, Select, Modal, Button, Spin, Alert, Divider } from "antd";
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
  const [payType, setPayType] = useState(null); // "listing" | "moderation"
  const [payLoading, setPayLoading] = useState(false);
  const [inlineMsg, setInlineMsg] = useState(null);
  const [feeCommission, setFeeCommission] = useState(0);
  const [moderationCommission, setModerationCommission] = useState(0);



  const evBrands = Object.keys(evData);
  const evModels = brand ? Object.keys(evData[brand]) : [];
  const evVersions = brand && model ? evData[brand][model] : [];

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const sellerId = localStorage.getItem("userId");
  const baseURL = import.meta.env.VITE_API_BASE_URL;
  const { TextArea } = Input;

  const bodyStyles = [
    "Sedan", "Hatchback", "SUV", "Crossover", "Coupe",
    "Convertible", "Pickup", "Van / Minivan", "Wagon", "Other"
  ];

  const colors = [
    "White", "Black", "Silver", "Gray", "Blue", "Red", "Green", "Yellow",
    "Orange", "Brown", "Beige", "Gold", "Purple", "Other"
  ];

  const batteryBrands = [
    "Panasonic", "Samsung SDI", "LG Chem", "CATL", "BYD", "Tesla",
    "Hitachi", "Toshiba", "A123 Systems", "SK Innovation", "Other"
  ];

  // FETCH DATA
  const fetchProducts = async () => {
    if (!sellerId) return;
    setLoading(true);
    try {
      const res = await fetch(`${baseURL}sellers/${sellerId}/item`);
      const data = await res.json();
      setProducts(data);
      setFiltered(data);
    } catch (err) {
      toast.error(" Lỗi tải sản phẩm!");
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

  useEffect(() => {
    if (editingItem?.itemType === "Ev") {
      form.setFieldsValue({
        brand: editingItem.brand,
        model: editingItem.model,
        version: editingItem.version,
        title: editingItem.title,
        description: editingItem.description,
        price: editingItem.price,
        mileage: editingItem.mileage,
        previousOwners: editingItem.previousOwners,
        licensePlate: editingItem.licensePlate,
      });
    }
  }, [editingItem]);

  const translateStatus = (status) => {
    switch (status) {
      case "Active":
        return "Đang hoạt động";
      case "Pending":
        return "Chờ duyệt";
      case "Pending_Pay":
        return "Chờ thanh toán";
      case "Auction_Pending_Pay":
        return "Chờ thanh toán"
      case "Sold":
        return "Đã bán";

      case "Rejected":
        return "Bị từ chối";
      default:
        return "Không xác định";
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
      case "Not_Submitted":
        return "Chưa kiểm duyệt";
      case "Sold":
        return "Đã bán";
      default:
        return "Chưa kiểm duyệt";
    }
  };

  // DELETE ITEM ------------------------
  const handleDeleteItem = async (itemId) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa sản phẩm này?")) return;
    try {
      setDeleteLoading(true);
      await itemApi.deleteItem(itemId);
      toast.success("🗑️ Đã xóa sản phẩm!");
      fetchProducts();
    } catch (error) {
      toast.error(" Xóa thất bại!");
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
            ? " Thanh toán đăng bán thành công! Sản phẩm đã được kích hoạt."
            : " Đã gửi yêu cầu kiểm duyệt thành công!",
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

  const categoryId = editingItem?.itemType === "Ev" ? 1 : 2;

  const handleUpdateItem = async () => {
    try {
      const values = form.getFieldsValue();
      if (!editingItem.categoryId) {
        toast.error("Sản phẩm này thiếu Category, vui lòng chọn loại sản phẩm!");
        return;
      }

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
        categoryId: categoryId,
        status: editingItem.status || "Active",
        moderation: "Not_Submitted",
        updatedAt: new Date().toISOString(),
        updatedBy: sellerId,
      };

      await itemApi.putItem(editingItem.itemId, commonPayload);

      toast.success(" Cập nhật sản phẩm thành công!");
      setIsEditModalOpen(false);
      fetchProducts();
    } catch (err) {
      console.error(" UPDATE ERROR:", err.response?.data || err);
      toast.error(" Lỗi khi cập nhật sản phẩm! Kiểm tra console để biết thêm.");
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
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Sản phẩm của tôi</h2>
        <ProductCreationModal onSuccess={fetchProducts} />
      </div>

      {/* SEARCH + FILTER */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 mb-6">
        <Input
          prefix={<Search size={16} />}
          placeholder="Tìm sản phẩm..."
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

      {/* PRODUCT LIST */}
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
              <p className="text-xs text-gray-500 italic">{translateModeration(item.moderation)}</p>

              {/* CHỈ SHOW SỬA + XOÁ NẾU Active + Pending */}
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
              {item.status === "Pending_Pay" || item.status === "Auction_Pending_Pay" ? (
                <Button
                  type="primary"
                  block
                  onClick={() => handlePayClick(item, "listing")}
                >
                  Thanh toán đăng bán (₫{feeCommission})
                </Button>
              ) : null}
            </div>
          </div>
        ))}
      </div>

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
                placeholder="Nhập tên sản phẩm..."
                onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
              />
            </Form.Item>

            <Form.Item label="Mô tả chi tiết">
              <TextArea
                rows={3}
                value={editingItem.description}
                placeholder="Mô tả sản phẩm..."
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

            {/* ===== XE ĐIỆN EV ===== */}
            {editingItem?.itemType === "Ev" && (
              <>

                {/* Brand / Model */}
                <div className="grid grid-cols-2 gap-4">
                  <Form.Item label="Hãng xe">
                    <Select
                      value={editingItem.brand}
                      onChange={(val) => setEditingItem({ ...editingItem, brand: val, model: "", version: "" })}
                    >
                      {Object.keys(evData).map((b) => (
                        <Option key={b} value={b}>{b}</Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item label="Mẫu xe">
                    <Select
                      value={editingItem.model}
                      disabled={!editingItem.brand}
                      onChange={(val) => setEditingItem({ ...editingItem, model: val, version: "" })}
                    >
                      {Object.keys(evData[editingItem.brand] || {}).map((m) => (
                        <Option key={m} value={m}>{m}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>

                {/* Version / Year */}
                <div className="grid grid-cols-2 gap-4">
                  <Form.Item label="Phiên bản">
                    <Select
                      value={editingItem.version}
                      disabled={!editingItem.model}
                      onChange={(val) => setEditingItem({ ...editingItem, version: val })}
                    >
                      {(evData[editingItem.brand]?.[editingItem.model] || []).map((v) => (
                        <Option key={v} value={v}>{v}</Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item label="Năm sản xuất">
                    <Select
                      value={editingItem.year}
                      onChange={(val) => setEditingItem({ ...editingItem, year: Number(val) })}
                    >
                      {Array.from({ length: 20 }, (_, i) => 2024 - i).map((y) => (
                        <Option key={y} value={y}>{y}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>

                {/* Body / Color */}
                <div className="grid grid-cols-2 gap-4">
                  <Form.Item label="Kiểu dáng">
                    <Select
                      value={editingItem.bodyStyle}
                      onChange={(val) => setEditingItem({ ...editingItem, bodyStyle: val })}
                    >
                      {bodyStyles.map((b) => (
                        <Option key={b} value={b}>{b}</Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item label="Màu sắc">
                    <Select
                      value={editingItem.color}
                      onChange={(val) => setEditingItem({ ...editingItem, color: val })}
                    >
                      {colors.map((c) => (
                        <Option key={c} value={c}>{c}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>
              </>
            )}

            {/* ===== PIN BATTERY ===== */}
            {editingItem?.itemType === "Battery" && (
              <>

                <Form.Item label="Thương hiệu">
                  <Select
                    value={editingItem.brand}
                    onChange={(val) => setEditingItem({ ...editingItem, brand: val })}
                  >
                    {batteryBrands.map((b) => (
                      <Option key={b} value={b}>{b}</Option>
                    ))}
                  </Select>
                </Form.Item>

                <div className="grid grid-cols-3 gap-4">
                  <Form.Item label="Dung lượng (kWh)">
                    <InputNumber
                      value={editingItem.capacity}
                      onChange={(val) => setEditingItem({ ...editingItem, capacity: Number(val) })}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>

                  <Form.Item label="Điện áp (V)">
                    <InputNumber
                      value={editingItem.voltage}
                      onChange={(val) => setEditingItem({ ...editingItem, voltage: Number(val) })}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>

                  <Form.Item label="Chu kỳ sạc">
                    <InputNumber
                      value={editingItem.chargeCycles}
                      onChange={(val) => setEditingItem({ ...editingItem, chargeCycles: Number(val) })}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </div>

                <Form.Item label="Tình trạng pin">
                  <Select
                    value={editingItem.condition}
                    onChange={(val) => setEditingItem({ ...editingItem, condition: val })}
                  >
                    <Option value="New">Mới</Option>
                    <Option value="Old">Cũ</Option>
                  </Select>
                </Form.Item>
              </>
            )}

            {/* BUTTON SAVE */}
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
                <><strong>Phí thanh toán: </strong> đ{feeCommission}</> :
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


      <ToastContainer position="top-right" autoClose={2500} />
    </div>
  );
}
