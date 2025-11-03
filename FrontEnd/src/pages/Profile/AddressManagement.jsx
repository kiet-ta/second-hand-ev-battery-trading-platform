import { useEffect, useState } from "react";
import "../../assets/styles/AddressManagement.css";
import addressApi from "../../hooks/services/addressApi";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const GHN_TOKEN = import.meta.env.VITE_GHN_TOKEN;

const AddressManagement = () => {
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    const baseURL = import.meta.env.VITE_API_BASE_URL;
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

    // ======================= 🧭 LOAD USER =======================
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

    // ======================= 📦 LOAD ADDRESS =======================
    const loadAddresses = async () => {
        try {
            const userId = localStorage.getItem("userId");
            if (!userId) return;

            const res = await addressApi.getUserAddresses(userId);
            const mapped = res.map((addr) => ({
                addressId: addr.addressId,
                street: addr.street,
                ward: addr.ward,
                district: addr.district,
                province: addr.province,
                wardCode: addr.wardCode,
                districtCode: addr.districtCode,
                provinceCode: addr.provinceCode,
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

    // ======================= 🗺 LOAD GHN DATA =======================
    useEffect(() => {
        axios
            .get("/ghn/shiip/public-api/master-data/province", {
                headers: { Token: GHN_TOKEN },
            })
            .then((res) => setProvinces(res.data.data))
            .catch((err) => console.error("Lỗi load tỉnh:", err));
    }, []);

    useEffect(() => {
        if (formData.provinceCode) {
            axios
                .post(
                    "/ghn/shiip/public-api/master-data/district",
                    { province_id: Number(formData.provinceCode) },
                    { headers: { Token: GHN_TOKEN } }
                )
                .then((res) => setDistricts(res.data.data))
                .catch((err) => console.error("Lỗi load huyện:", err));
            setWards([]);
        } else {
            setDistricts([]);
            setWards([]);
        }
    }, [formData.provinceCode]);

    useEffect(() => {
        if (formData.districtCode) {
            axios
                .post(
                    "/ghn/shiip/public-api/master-data/ward",
                    { district_id: Number(formData.districtCode) },
                    { headers: { Token: GHN_TOKEN } }
                )
                .then((res) => setWards(res.data.data))
                .catch((err) => console.error("Lỗi load xã:", err));
        } else {
            setWards([]);
        }
    }, [formData.districtCode]);

    // ======================= 🎛 FORM HANDLERS =======================
    const handleProvinceChange = (e) => {
        const code = e.target.value;
        const province = provinces.find((p) => String(p.ProvinceID) === code);
        setFormData({
            ...formData,
            provinceCode: code,
            provinceName: province?.ProvinceName || "",
            districtCode: "",
            districtName: "",
            wardCode: "",
            wardName: "",
        });
    };

    const handleDistrictChange = (e) => {
        const code = e.target.value;
        const district = districts.find((d) => String(d.DistrictID) === code);
        setFormData({
            ...formData,
            districtCode: code,
            districtName: district?.DistrictName || "",
            wardCode: "",
            wardName: "",
        });
    };

    const handleWardChange = (e) => {
        const code = e.target.value;
        const ward = wards.find((w) => String(w.WardCode) === code);
        setFormData({
            ...formData,
            wardCode: code,
            wardName: ward?.WardName || "",
        });
    };

    // ======================= ✏️ CRUD HANDLERS =======================
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
        setShowForm(true);
    };

    const handleEdit = (address) => {
        setEditingId(address.addressId);
        setFormData({
            provinceCode: address.provinceCode || "",
            provinceName: address.province,
            districtCode: address.districtCode || "",
            districtName: address.district,
            wardCode: address.wardCode || "",
            wardName: address.ward,
            detail: address.street,
            isDefault: address.isDefault,
        });
        setShowForm(true);
    };

    const handleSave = async () => {
        if (
            !formData.detail ||
            !formData.provinceName ||
            !formData.districtName ||
            !formData.wardName
        ) {
            alert("Vui lòng điền đầy đủ thông tin!");
            return;
        }

        try {
            const addressPayload = {
                recipientName: currentUser?.fullName || "Unknown",
                phone: currentUser?.phone || "0000000000",
                street: formData.detail,
                ward: formData.wardName,
                district: formData.districtName,
                province: formData.provinceName,
                wardCode: formData.wardCode,
                districtCode: formData.districtCode,
                provinceCode: formData.provinceCode,
                isDefault: formData.isDefault,
            };

            if (editingId) {
                await addressApi.updateAddress(editingId, addressPayload);
            } else {
                await addressApi.addAddress(addressPayload);
            }

            await loadAddresses();
            setShowForm(false);
            setEditingId(null);
        } catch (err) {
            console.error("Lỗi lưu địa chỉ:", err);
            alert("Có lỗi khi lưu địa chỉ!");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc muốn xóa địa chỉ này?")) {
            try {
                await addressApi.deleteAddress(id);
                await loadAddresses(); // ✅ reload danh sách sau khi xóa
            } catch (err) {
                console.error("Lỗi xóa address:", err);
                alert("Có lỗi khi xóa địa chỉ!");
            }
        }
    };

    const handleSetDefault = async (id) => {
        try {
            const userId = localStorage.getItem("userId");
            if (!userId) return;

            const res = await addressApi.getUserAddresses(userId);
            for (const addr of res) {
                const updated = { ...addr, isDefault: addr.addressId === id };
                await addressApi.updateAddress(addr.addressId, updated);
            }
            await loadAddresses();
        } catch (err) {
            console.error("❌ Lỗi đặt mặc định:", err);
        }
    };

    // ======================= 🧱 RENDER =======================
    return (
        <div className="address-container h-screen overflow-y-auto">
            <div className="address-header">
                <h2 className="address-title">Địa chỉ của tôi</h2>
                {!showForm && (
                    <button className="btn-add" onClick={handleAddNew}>
                        + Thêm địa chỉ mới
                    </button>
                )}
            </div>

            {/* Danh sách địa chỉ */}
            {!showForm && (
                <div className="address-list">
                    <AnimatePresence>
                        {savedAddresses.map((address) => (
                            <motion.div
                                key={address.addressId}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ type: "spring", stiffness: 120, damping: 14 }}
                                className={`address-card ${address.isDefault ? "highlight" : ""}`}
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
                                                onClick={() =>
                                                    handleDelete(address.addressId)
                                                }
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
                                        onClick={() =>
                                            handleSetDefault(address.addressId)
                                        }
                                    >
                                        Đặt làm mặc định
                                    </button>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Form thêm/sửa */}
            {showForm && (
                <div className="form-card">
                    <h3 className="form-title">
                        {editingId ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}
                    </h3>

                    {/* Tỉnh */}
                    <div className="form-group">
                        <label className="form-label">Tỉnh/Thành phố *</label>
                        <select
                            className="form-select"
                            value={formData.provinceCode}
                            onChange={handleProvinceChange}
                        >
                            <option value="">-- Chọn Tỉnh/Thành --</option>
                            {provinces.map((p) => (
                                <option key={p.ProvinceID} value={p.ProvinceID}>
                                    {p.ProvinceName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Huyện */}
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
                                <option key={d.DistrictID} value={d.DistrictID}>
                                    {d.DistrictName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Xã */}
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
                                <option key={w.WardCode} value={w.WardCode}>
                                    {w.WardName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Chi tiết */}
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

                    {/* Checkbox */}
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

                    {/* Actions */}
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
