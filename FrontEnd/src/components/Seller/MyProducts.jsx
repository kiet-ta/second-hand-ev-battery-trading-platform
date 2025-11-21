import React, { useEffect, useState } from "react";
import { Tag, Search } from "lucide-react";
import { Form, Input, InputNumber, Checkbox, Select, Modal, Button, Spin, Alert } from "antd";
import ProductCreationModal from "../ItemForm/ProductCreationModal";
import walletApi from "../../api/walletApi";
import itemApi from "../../api/itemApi";
import commissionApi from "../../api/commissionApi";
import userApi from "../../api/userApi";
import { toast, ToastContainer } from "react-toastify";
import evData from "../../assets/datas/evData";
import "react-toastify/dist/ReactToastify.css";

export default function MyProducts() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [form] = Form.useForm();
  const brand = Form.useWatch("brand", form);
  const model = Form.useWatch("model", form);

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
        return "Bị từ chối";
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
          brand: values.brand,
          capacity: Number(values.capacity),
          condition: values.condition,
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
        categoryId: editingItem.categoryId,
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
                      setEditingItem(item);
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
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={null}
        title="Sửa sản phẩm"
        width={600}
      >
        {editingItem && (
          <div className="space-y-4">
            {/* THÔNG TIN CHUNG */}
            <Input
              value={editingItem.title}
              placeholder="Tên sản phẩm"
              onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
              className="w-full border p-2 rounded"
            />

            <TextArea
              rows={3}
              value={editingItem.description}
              placeholder="Mô tả chi tiết"
              onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
              className="w-full border p-2 rounded"
            />

            <InputNumber
              value={editingItem.price}
              onChange={(val) => setEditingItem({ ...editingItem, price: Number(val) })}
              className="w-full border p-2 rounded"
              min={1000}
              placeholder="Giá (VND)"
            />

            <InputNumber
              value={editingItem.quantity}
              onChange={(val) => setEditingItem({ ...editingItem, quantity: Number(val) })}
              className="w-full border p-2 rounded"
              min={1}
              placeholder="Số lượng"
            />

            {/* =================== EV DETAILS =================== */}
            {editingItem.itemType === "Ev" && (
              <>
                <h3 className="font-semibold text-gray-700 mt-4 mb-2">
                  Thông tin xe điện (EV)
                </h3>

                {/*  Brand (Dropdown từ evData) */}
                <Select
                  value={editingItem.brand}
                  className="w-full"
                  placeholder="Chọn hãng xe"
                  onChange={(val) => {
                    setEditingItem((prev) => ({
                      ...prev,
                      brand: val,
                      model: "", // reset model & version
                      version: "",
                    }));
                  }}
                >
                  {Object.keys(evData).map((brand) => (
                    <Option key={brand} value={brand}>{brand}</Option>
                  ))}
                </Select>

                {/*  Model (theo Brand) */}
                {editingItem.brand && (
                  <Select
                    value={editingItem.model}
                    className="w-full mt-2"
                    placeholder="Chọn mẫu xe"
                    onChange={(val) => {
                      setEditingItem((prev) => ({
                        ...prev,
                        model: val,
                        version: "",  // Reset version
                      }));
                    }}
                  >
                    {Object.keys(evData[editingItem.brand] || {}).map((model) => (
                      <Option key={model} value={model}>{model}</Option>
                    ))}
                  </Select>
                )}

                {/*  Version (theo Model) */}
                {editingItem.model && (
                  <Select
                    value={editingItem.version}
                    className="w-full mt-2"
                    placeholder="Chọn phiên bản"
                    onChange={(val) => setEditingItem({ ...editingItem, version: val })}
                  >
                    {(evData[editingItem.brand]?.[editingItem.model] || []).map((ver) => (
                      <Option key={ver} value={ver}>{ver}</Option>
                    ))}
                  </Select>
                )}

                {/*  Năm sản xuất */}
                <Select
                  value={editingItem.year}
                  className="w-full"
                  placeholder="Năm sản xuất"
                  onChange={(val) => setEditingItem({ ...editingItem, year: Number(val) })}
                >
                  {Array.from({ length: 20 }, (_, i) => 2024 - i).map((y) => (
                    <Option key={y} value={y}>{y}</Option>
                  ))}
                </Select>

                <Select
                  value={editingItem.categoryId}
                  className="w-full"
                  placeholder="Chọn loại sản phẩm"
                  onChange={(val) => setEditingItem({ ...editingItem, categoryId: val })}
                >
                  <Option value={1}>Xe điện (EV)</Option>
                  <Option value={2}>Pin</Option>
                  <Option value={3}>Phụ kiện</Option>
                </Select>

                {/*  Kiểu dáng */}
                <Select
                  value={editingItem.bodyStyle}
                  className="w-full"
                  placeholder="Kiểu dáng"
                  onChange={(val) => setEditingItem({ ...editingItem, bodyStyle: val })}
                >
                  {bodyStyles.map((b) => (
                    <Option key={b} value={b}>{b}</Option>
                  ))}
                </Select>

                {/*  Màu sắc */}
                <Select
                  value={editingItem.color}
                  className="w-full"
                  placeholder="Màu sắc"
                  onChange={(val) => setEditingItem({ ...editingItem, color: val })}
                >
                  {colors.map((c) => (
                    <Option key={c} value={c}>{c}</Option>
                  ))}
                </Select>

                <InputNumber
                  value={editingItem.mileage}
                  onChange={(val) => setEditingItem({ ...editingItem, mileage: Number(val) })}
                  className="w-full"
                  placeholder="Số km đã đi"
                />

                <InputNumber
                  value={editingItem.previousOwners}
                  onChange={(val) => setEditingItem({ ...editingItem, previousOwners: Number(val) })}
                  className="w-full"
                  placeholder="Số chủ sở hữu trước"
                />

                <Input
                  value={editingItem.licensePlate}
                  onChange={(e) => setEditingItem({ ...editingItem, licensePlate: e.target.value })}
                  className="w-full"
                  placeholder="Biển số xe (VD: 30A-123.45)"
                />

                <Checkbox
                  checked={editingItem.hasAccessories}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, hasAccessories: e.target.checked })
                  }
                >
                  Có phụ kiện kèm theo
                </Checkbox>
              </>
            )}

            {/* BUTTON SAVE */}
            <Button type="primary" block onClick={handleUpdateItem}>
              Lưu thay đổi
            </Button>
          </div>
        )}
      </Modal>


      <ToastContainer position="top-right" autoClose={2500} />
    </div>
  );
}
