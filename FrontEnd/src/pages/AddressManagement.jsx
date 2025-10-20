import { useEffect, useState } from "react";
import "../assets/styles/AddressManagement.css";
import addressApi from "../hooks/services/addressApi";

const AddressManagement = () => {
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    const [savedAddresses, setSavedAddresses] = useState([]);

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userId = localStorage.getItem("userId");
                if (!userId)
                    return;

                const res = await fetch(`https://localhost:7272/api/User/${userId}`);
                if (!res.ok) throw new Error("Không lấy được thông tin user");
                const data = await res.json();
                setCurrentUser(data);
            } catch (err) {
                console.error("Lỗi load user:", err);
            }
        };

        fetchUser();
    }, []);

    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const userId = localStorage.getItem("userId");
                if (!userId) return;

                const res = await addressApi.getUserAddresses(userId);

                // Map DB fields -> UI fields
                const mapped = res.map(addr => ({
                    id: addr.addressId,         // <-- map đúng primary key từ DB
                    street: addr.street,
                    ward: addr.ward,
                    district: addr.district,
                    province: addr.province,
                    isDefault: addr.isDefault
                }));

                setSavedAddresses(mapped);
            } catch (err) {
                console.error("Lỗi load addresses:", err);
            }
        };

        fetchAddresses();
    }, []);

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

    // Load provinces
    useEffect(() => {
        addressApi.getProvinces().then(setProvinces).catch(() => setProvinces([]));
    }, []);

    // Load districts khi chọn tỉnh
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

    // Load wards khi chọn huyện
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
            provinceName: address.province,
            districtCode: "",
            districtName: address.district,
            wardCode: "",
            wardName: address.ward,
            detail: address.street,
            isDefault: address.isDefault,
        });
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

    const handleSave = async () => {
        if (!formData.detail || !formData.provinceName || !formData.districtName || !formData.wardName) {
            alert("Vui lòng điền đầy đủ thông tin!");
            return;
        }

        try {
            const userId = localStorage.getItem("userId");

            const addressPayload = {
                userId: userId,
                recipientName: currentUser?.fullName || "Unknown",
                phone: currentUser?.phone || "0000000000",
                street: formData.detail,
                ward: formData.wardName,
                district: formData.districtName,
                province: formData.provinceName,
                isDefault: formData.isDefault,
            };

            if (editingId) {
                // Cập nhật
                await addressApi.updateAddress(editingId, addressPayload);
            } else {
                // Thêm mới
                await addressApi.addAddress(addressPayload);
            }

            // Reload danh sách từ DB
            const res = await addressApi.getUserAddresses(userId);
            const mapped = res.map(addr => ({
                id: addr.addressId,
                street: addr.street,
                ward: addr.ward,
                district: addr.district,
                province: addr.province,
                isDefault: addr.isDefault
            }));
            setSavedAddresses(mapped);

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
                const userId = localStorage.getItem("userId");
                const res = await addressApi.getUserAddresses(userId);
                setSavedAddresses(res);
            } catch (err) {
                alert("Có lỗi khi xóa địa chỉ!");
            }
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
        <div className="address-container h-screen overflow-y-auto">
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
