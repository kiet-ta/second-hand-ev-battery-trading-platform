import React, { useEffect, useState, useCallback } from "react";
import { Button, Spin } from "antd";
import addressApi from "../../../hooks/services/addressApi";

const Step3BusinessInfo = ({ formData, setFormData, nextStep, prevStep }) => {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  // --------------------------
  // Load Provinces
  // --------------------------
  useEffect(() => {
    setLoadingProvinces(true);
    addressApi.getProvinces()
      .then(setProvinces)
      .catch(() => setProvinces([]))
      .finally(() => setLoadingProvinces(false));
  }, []);

  // --------------------------
  // Load Districts when province changes
  // --------------------------
  useEffect(() => {
    if (!formData.storeAddress.provinceCode) {
      setDistricts([]);
      setWards([]);
      return;
    }
    setLoadingDistricts(true);
    addressApi.getDistricts(formData.storeAddress.provinceCode)
      .then(setDistricts)
      .catch(() => setDistricts([]))
      .finally(() => setLoadingDistricts(false));
    setWards([]);
    handleChange("districtCode", "");
    handleChange("district", "");
    handleChange("wardCode", "");
    handleChange("ward", "");
  }, [formData.storeAddress.provinceCode]);

  // --------------------------
  // Load Wards when district changes
  // --------------------------
  useEffect(() => {
    if (!formData.storeAddress.districtCode) {
      setWards([]);
      return;
    }
    setLoadingWards(true);
    addressApi.getWards(formData.storeAddress.districtCode)
      .then(setWards)
      .catch(() => setWards([]))
      .finally(() => setLoadingWards(false));
    handleChange("wardCode", "");
    handleChange("ward", "");
  }, [formData.storeAddress.districtCode]);

  // --------------------------
  // Helper: update storeAddress fields
  // --------------------------
  const handleChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      storeAddress: {
        ...prev.storeAddress,
        [field]: value,
      },
    }));
  }, [setFormData]);

  // --------------------------
  // Loading overlay
  // --------------------------
  const loading = loadingProvinces || loadingDistricts || loadingWards;

  return (
    <div className="space-y-6 p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800">Thông tin cửa hàng</h2>

      {loading && (
        <div className="absolute inset-0 w-screen h-screen flex items-center justify-center bg-white bg-opacity-70 z-10">
          <Spin tip="Đang tải thông tin..." size="large" />
        </div>
      )}

      {/* Store Name */}
      <input
        type="text"
        placeholder="Tên cửa hàng"
        value={formData.storeAddress.recipientName}
        onChange={e => handleChange("recipientName", e.target.value)}
        className="form-input w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring focus:border-blue-300"
      />

      {/* Phone */}
      <input
        type="text"
        placeholder="SĐT cửa hàng"
        value={formData.storeAddress.phone}
        onChange={e => handleChange("phone", e.target.value)}
        className="form-input w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring focus:border-blue-300"
      />

      {/* Street */}
      <input
        type="text"
        placeholder="Địa chỉ (số nhà, tên đường)"
        value={formData.storeAddress.street}
        onChange={e => handleChange("street", e.target.value)}
        className="form-input w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring focus:border-blue-300"
      />

      {/* Province */}
      <select
        value={formData.storeAddress.provinceCode || ""}
        onChange={(e) => {
          const selected = provinces.find(p => String(p.code) === e.target.value);
          handleChange("provinceCode", e.target.value);
          handleChange("province", selected?.name_with_type || "");
        }}
        className="form-select w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring focus:border-blue-300"
      >
        <option value="">-- Chọn Tỉnh/Thành --</option>
        {provinces.map(p => (
          <option key={p.code} value={String(p.code)}>
            {p.name_with_type}
          </option>
        ))}
      </select>

      {/* District */}
      <select
        value={formData.storeAddress.districtCode || ""}
        onChange={(e) => {
          const selected = districts.find(d => String(d.code) === e.target.value);
          handleChange("districtCode", e.target.value);
          handleChange("district", selected?.name_with_type || "");
        }}
        disabled={!formData.storeAddress.provinceCode}
        className="form-select w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring focus:border-blue-300"
      >
        <option value="">-- Chọn Quận/Huyện --</option>
        {districts.map(d => (
          <option key={d.code} value={String(d.code)}>
            {d.name_with_type}
          </option>
        ))}
      </select>

      {/* Ward */}
      <select
        value={formData.storeAddress.wardCode || ""}
        onChange={(e) => {
          const selected = wards.find(w => String(w.code) === e.target.value);
          handleChange("wardCode", e.target.value);
          handleChange("ward", selected?.name_with_type || "");
        }}
        disabled={!formData.storeAddress.districtCode}
        className="form-select w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring focus:border-blue-300"
      >
        <option value="">-- Chọn Phường/Xã --</option>
        {wards.map(w => (
          <option key={w.code} value={String(w.code)}>
            {w.name_with_type}
          </option>
        ))}
      </select>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-4">
        <Button onClick={prevStep}>Quay lại</Button>
        <Button type="primary" onClick={nextStep}>Tiếp tục</Button>
      </div>
    </div>
  );
};

export default Step3BusinessInfo;
