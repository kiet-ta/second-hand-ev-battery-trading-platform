import { useEffect, useState } from "react";
import "../../assets/styles/AddressManagement.css";
import addressApi from "../../hooks/services/addressApi";
import { motion, AnimatePresence } from "framer-motion";
import addressLocalApi from "../../api/addressLocalApi";
import { Spin } from "antd";

const AddressManagement = () => {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    provinceCode: "",
    provinceName: "",
    districtCode: "",
    districtName: "",
    wardCode: "",
    wardName: "",
    detail: "",
    isDefault: false,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState("success");

  const baseURL = import.meta.env.VITE_API_BASE_URL;

  // ===== Fetch current user =====
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) return;
        const res = await fetch(`${baseURL}users/${userId}`);
        if (!res.ok) throw new Error("Không lấy được thông tin user");
        const data = await res.json();
        setCurrentUser(data);
      } catch (err) {
        console.error("Lỗi load user:", err);
      }
    };
    fetchUser();
  }, []);

  // ===== Fetch all addresses =====
  const loadAddresses = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) return;
      const res = await addressLocalApi.getAddressByUserId(userId);
      const mapped = res.map((addr) => ({
        id: addr.addressId,
        street: addr.street,
        ward: addr.ward,
        district: addr.district,
        province: addr.province,
        isDefault: addr.isDefault,
      }));
      setSavedAddresses(mapped);
    } catch (err) {
      console.error("Lỗi load addresses:", err);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  // ===== Fetch province/district/ward data =====
  useEffect(() => {
    addressApi.getProvinces().then(setProvinces).catch(() => setProvinces([]));
  }, []);

  useEffect(() => {
    if (formData.provinceCode) {
      addressApi
        .getDistricts(formData.provinceCode)
        .then(setDistricts)
        .catch(() => setDistricts([]));
      setWards([]);
    } else {
      setDistricts([]);
      setWards([]);
    }
  }, [formData.provinceCode]);

  useEffect(() => {
    if (formData.districtCode) {
      addressApi
        .getWards(formData.districtCode)
        .then(setWards)
        .catch(() => setWards([]));
    } else {
      setWards([]);
    }
  }, [formData.districtCode]);

  // ===== Form Handlers =====
  const handleAddNew = () => {
    setEditingId(null);
    setFormData({
      provinceCode: "",
      provinceName: "",
      districtCode: "",
      districtName: "",
      wardCode: "",
      wardName: "",
      detail: "",
      isDefault: false,
    });
    setDistricts([]);
    setWards([]);
    setMessage(null);
    setShowForm(true);
  };

  const handleEdit = (address) => {
    setEditingId(address.id);
    setFormData({
      provinceCode: "",
      provinceName: address.province,
      districtCode: "",
      districtName: address.district,
      wardCode: "",
      wardName: address.ward,
      detail: address.street,
      isDefault: address.isDefault,
    });
    setMessage(null);
    setShowForm(true);
  };

  const handleProvinceChange = (e) => {
    const code = e.target.value;
    const province = provinces.find((p) => String(p.code) === String(code));
    setFormData({
      ...formData,
      provinceCode: code,
      provinceName: province?.name_with_type || "",
      districtCode: "",
      districtName: "",
      wardCode: "",
      wardName: "",
    });
  };

  const handleDistrictChange = (e) => {
    const code = e.target.value;
    const district = districts.find((d) => String(d.code) === String(code));
    setFormData({
      ...formData,
      districtCode: code,
      districtName: district?.name_with_type || "",
      wardCode: "",
      wardName: "",
    });
  };

  const handleWardChange = (e) => {
    const code = e.target.value;
    const ward = wards.find((w) => String(w.code) === String(code));
    setFormData({
      ...formData,
      wardCode: code,
      wardName: ward?.name_with_type || "",
    });
  };

  // ===== Save =====
  const handleSave = async () => {
    setMessage(null);
    if (
      !formData.detail ||
      !formData.provinceName ||
      !formData.districtName ||
      !formData.wardName
    ) {
      setMessageType("error");
      setMessage("⚠️ Vui lòng điền đầy đủ thông tin!");
      return;
    }

    try {
      setLoading(true);
      const userId = localStorage.getItem("userId");

      const addressPayload = {
        userId,
        recipientName: currentUser?.fullName || "Unknown",
        phone: currentUser?.phone || "0000000000",
        street: formData.detail,
        ward: formData.wardName,
        district: formData.districtName,
        province: formData.provinceName,
        isDefault: formData.isDefault,
      };

      let response;
      if (editingId) {
        response = await addressLocalApi.updateAddress(editingId, addressPayload);
      } else {
        response = await addressLocalApi.addAddress(addressPayload);
      }

      if (response) {
        await loadAddresses();
        setShowForm(false);
        setEditingId(null);
        setMessageType("success");
        setMessage("✅ Đã lưu địa chỉ thành công!");
      } else {
        throw new Error("Không có phản hồi hợp lệ từ server");
      }
    } catch (err) {
      console.error("Lỗi lưu địa chỉ:", err);
      setMessageType("error");
      setMessage("❌ Có lỗi khi lưu địa chỉ!");
    } finally {
      setLoading(false);
    }
  };

  // ===== Delete =====
  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await addressLocalApi.deleteAddress(id);
      await loadAddresses();
      setMessageType("success");
      setMessage("🗑️ Đã xóa địa chỉ thành công!");
    } catch (err) {
      console.error("Lỗi xóa địa chỉ:", err);
      setMessageType("error");
      setMessage("❌ Có lỗi khi xóa địa chỉ!");
    } finally {
      setLoading(false);
    }
  };

  // ===== Set Default =====
  const handleSetDefault = async (id) => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      const allAddresses = await addressLocalApi.getAddressByUserId(userId);
      for (const addr of allAddresses) {
        const updated = { ...addr, isDefault: addr.addressId === id };
        await addressLocalApi.updateAddress(addr.addressId, updated);
      }
      await loadAddresses();
      setMessageType("success");
      setMessage("⭐ Đã đặt làm địa chỉ mặc định!");
    } catch (err) {
      console.error("❌ Lỗi đặt mặc định:", err);
      setMessageType("error");
      setMessage("❌ Có lỗi khi đặt mặc định!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="address-container h-screen overflow-y-auto">
      {loading && (
        <div className="loading-overlay">
          <Spin size="large" tip="Đang xử lý..." />
        </div>
      )}

      <div className="address-header">
        <h2 className="address-title">Địa chỉ của tôi</h2>
        {!showForm && (
          <button className="btn-add" onClick={handleAddNew}>
            + Thêm địa chỉ mới
          </button>
        )}
      </div>

      {message && (
        <div
          className={`inline-message ${
            messageType === "success" ? "msg-success" : "msg-error"
          }`}
        >
          {message}
        </div>
      )}

      {!showForm && (
        <div className="address-list">
          <AnimatePresence>
            {savedAddresses.map((address) => (
              <motion.div
                key={address.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 120, damping: 14 }}
                className={`address-card ${
                  address.isDefault ? "highlight" : ""
                }`}
              >
                <div className="address-card-header">
                  <div>
                    <strong className="address-name">Địa chỉ giao hàng</strong>
                    {address.isDefault && (
                      <span className="default-badge">Mặc định</span>
                    )}
                  </div>
                  <div className="address-actions">
                    <button
                      className="btn-edit"
                      onClick={() => handleEdit(address)}
                    >
                      Chỉnh sửa
                    </button>
                    {savedAddresses.length > 1 && (
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(address.id)}
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                </div>

                <div className="address-detail">
                  <p className="address-text">
                    {address.ward}, {address.district}, {address.province}
                  </p>
                  <p className="address-text">{address.street}</p>
                </div>

                {!address.isDefault && (
                  <button
                    className="btn-set-default"
                    onClick={() => handleSetDefault(address.id)}
                  >
                    Đặt làm mặc định
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {showForm && (
        <div className="form-card">
          <h3 className="form-title">
            {editingId ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}
          </h3>

          <div className="form-group">
            <label className="form-label">Tỉnh/Thành phố *</label>
            <select
              className="form-select"
              value={formData.provinceCode}
              onChange={handleProvinceChange}
            >
              <option value="">-- Chọn Tỉnh/Thành --</option>
              {provinces.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name_with_type}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Quận/Huyện *</label>
            <select
              className="form-select"
              value={formData.districtCode}
              onChange={handleDistrictChange}
              disabled={!formData.provinceCode}
            >
              <option value="">-- Chọn Quận/Huyện --</option>
              {districts.map((d) => (
                <option key={d.code} value={d.code}>
                  {d.name_with_type}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Phường/Xã *</label>
            <select
              className="form-select"
              value={formData.wardCode}
              onChange={handleWardChange}
              disabled={!formData.districtCode}
            >
              <option value="">-- Chọn Phường/Xã --</option>
              {wards.map((w) => (
                <option key={w.code} value={w.code}>
                  {w.name_with_type}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Địa chỉ chi tiết *</label>
            <input
              type="text"
              className="form-input"
              placeholder="Số nhà, tên đường..."
              value={formData.detail}
              onChange={(e) =>
                setFormData({ ...formData, detail: e.target.value })
              }
            />
          </div>

          <div className="checkbox-group">
            <input
              type="checkbox"
              id="isDefault"
              checked={formData.isDefault}
              onChange={(e) =>
                setFormData({ ...formData, isDefault: e.target.checked })
              }
              className="form-checkbox"
            />
            <label htmlFor="isDefault" className="checkbox-label">
              Đặt làm địa chỉ mặc định
            </label>
          </div>

          <div className="form-actions">
            <button className="btn-cancel" onClick={() => setShowForm(false)}>
              Hủy
            </button>
            <button className="btn-save" onClick={handleSave}>
              Lưu địa chỉ
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressManagement;
