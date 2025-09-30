import { useEffect, useState } from "react";
import "../assets/styles/AddressManagement.css";
import axios from "axios";

// API dùng chung
const baseURL = "https://open.oapi.vn/location";

const addressApi = {
    getProvinces: async () => {
        const res = await axios.get(`${baseURL}/provinces`, {
            params: { page: 0, size: 63 },
        });
        return res.data.data || [];
    },
    getDistricts: async (provinceCode) => {
        const res = await axios.get(`${baseURL}/districts/${provinceCode}`, {
            params: { page: 0, size: 999 },
        });
        return res.data.data || [];
    },
    getWards: async (districtCode) => {
        const res = await axios.get(`${baseURL}/wards/${districtCode}`, {
            params: { page: 0, size: 999 },
        });
        return res.data.data || [];
    },
};

const AddressManagement = () => {
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    const [savedAddresses, setSavedAddresses] = useState([
        {
            id: 1,
            provinceCode: "79",
            provinceName: "Thành phố Hồ Chí Minh",
            districtCode: "760",
            districtName: "Quận 1",
            wardCode: "26734",
            wardName: "Phường Bến Nghé",
            detail: "123 Nguyễn Huệ",
            isDefault: true,
        },
    ]);

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

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

    // Load provinces on mount
    useEffect(() => {
        addressApi.getProvinces().then(setProvinces).catch(() => setProvinces([]));
    }, []);

    // Load districts when province changes
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

    // Load wards when district changes
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

    // ----------------------
    // Handlers
    // ----------------------

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
        setEditingId(address.id);
        setFormData({
            provinceCode: "",
            provinceName: "",
            districtCode: "",
            districtName: "",
            wardCode: "",
            wardName: "",
            detail: address.detail,
            isDefault: address.isDefault,
        });
        setDistricts([]);
        setWards([]);
        setShowForm(true);
    };

    const handleProvinceChange = (e) => {
        const code = e.target.value;
        const province = provinces.find((p) => String(p.code) === String(code));
        setFormData({
            ...formData,
            provinceCode: code,
            provinceName: province?.name || "",
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
            districtName: district?.name || "",
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
            wardName: ward?.name || "",
        });
    };

    const handleSave = () => {
        if (
            !formData.provinceCode ||
            !formData.districtCode ||
            !formData.wardCode ||
            !formData.detail
        ) {
            alert("Vui lòng điền đầy đủ thông tin!");
            return;
        }

        if (editingId) {
            setSavedAddresses((prev) =>
                prev.map((addr) => {
                    if (addr.id === editingId) {
                        return { ...formData, id: addr.id };
                    }
                    if (formData.isDefault) {
                        return { ...addr, isDefault: false };
                    }
                    return addr;
                })
            );
        } else {
            const newAddress = {
                ...formData,
                id: Date.now(),
            };

            if (formData.isDefault) {
                setSavedAddresses((prev) => [
                    newAddress,
                    ...prev.map((addr) => ({ ...addr, isDefault: false })),
                ]);
            } else {
                setSavedAddresses((prev) => [...prev, newAddress]);
            }
        }

        setShowForm(false);
    };

    const handleDelete = (id) => {
        if (window.confirm("Bạn có chắc muốn xóa địa chỉ này?")) {
            setSavedAddresses((prev) => prev.filter((addr) => addr.id !== id));
        }
    };

    const handleSetDefault = (id) => {
        setSavedAddresses((prev) =>
            prev.map((addr) => ({
                ...addr,
                isDefault: addr.id === id,
            }))
        );
    };

    // ----------------------
    // Render
    // ----------------------

    return (
        <div className="address-container">
            <div className="address-header">
                <h2 className="address-title">Địa chỉ của tôi</h2>
                {!showForm && (
                    <button className="btn-add" onClick={handleAddNew}>
                        + Thêm địa chỉ mới
                    </button>
                )}
            </div>

            {/* LIST */}
            {!showForm && (
                <div className="address-list">
                    {savedAddresses.map((address) => (
                        <div key={address.id} className="address-card">
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
                                <p className="address-text">{address.detail}</p>
                                <p className="address-text">
                                    {address.wardName}, {address.districtName},{" "}
                                    {address.provinceName}
                                </p>
                            </div>
                            {!address.isDefault && (
                                <button
                                    className="btn-set-default"
                                    onClick={() => handleSetDefault(address.id)}
                                >
                                    Đặt làm mặc định
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* FORM */}
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
                                    {p.name}
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
                                    {d.name}
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
                                    {w.name}
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
