import React, { useEffect, useState, useCallback } from "react";
import { Button, Spin } from "antd";
import addressApi from "../../../hooks/services/addressApi";
// Import ImageUploadField
import ImageUploadField from "./ImageUploadField"; // Make sure this path is correct

// Helper component structure for label, input, and error display
const FormField = ({ label, children, error }) => (
  <div className="space-y-1">
    <label className="block text-sm font-semibold text-gray-700">
      {label} <span className="text-red-500">*</span>
    </label>
    {children}
    {error && (
      <p className="text-xs text-red-500 font-medium mt-1">{error}</p>
    )}
  </div>
);

const Step3BusinessInfo = ({ formData, setFormData, nextStep, prevStep }) => {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  const [errors, setErrors] = useState({});

  const requiredFields = {
    recipientName: "Tên cửa hàng",
    phone: "SĐT cửa hàng",
    street: "Địa chỉ (số nhà, tên đường)",
    provinceCode: "Tỉnh/Thành",
    districtCode: "Quận/Huyện",
    wardCode: "Phường/Xã",
    logoUrl: "Logo Cửa hàng", 
  };

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
  // Helper: update storeAddress fields and clear error if valid
  // --------------------------
  const handleChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      storeAddress: {
        ...prev.storeAddress,
        [field]: value,
      },
    }));

    // Clear the error for the field being changed
    setErrors(prev => ({ ...prev, [field]: undefined }));
  }, [setFormData]);

  const handleTopLevelChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    setErrors(prev => ({ ...prev, [field]: undefined }));
  }, [setFormData]);

  useEffect(() => {
    const resetFields = () => {
      handleChange("districtCode", "");
      handleChange("district", "");
      handleChange("wardCode", "");
      handleChange("ward", "");
    };

    if (!formData.storeAddress.provinceCode) {
      setDistricts([]);
      setWards([]);
      resetFields();
      return;
    }
    
    setLoadingDistricts(true);
    addressApi.getDistricts(formData.storeAddress.provinceCode)
      .then(setDistricts)
      .catch(() => setDistricts([]))
      .finally(() => setLoadingDistricts(false));
      
    setWards([]);
    resetFields();
  }, [formData.storeAddress.provinceCode, handleChange]);

  useEffect(() => {
    // ... (Ward loading logic, using handleChange) ...
    if (!formData.storeAddress.districtCode) {
      setWards([]);
      handleChange("wardCode", "");
      handleChange("ward", "");
      return;
    }
    setLoadingWards(true);
    addressApi.getWards(formData.storeAddress.districtCode)
      .then(setWards)
      .catch(() => setWards([]))
      .finally(() => setLoadingWards(false));
      
    handleChange("wardCode", "");
    handleChange("ward", "");
  }, [formData.storeAddress.districtCode, handleChange]);

  // --------------------------
  // Validation Logic
  // --------------------------
  const handleNextStep = () => {
    let newErrors = {};
    let isValid = true;

    // Check all required fields
    Object.keys(requiredFields).forEach(key => {
      let value;
      // Handle nested fields (storeAddress)
      if (key in formData.storeAddress) {
        value = formData.storeAddress[key];
      } 
      // Handle top-level fields (logoUrl)
      else if (key in formData) {
        value = formData[key];
      }

      if (!value) {
        newErrors[key] = `Vui lòng nhập ${requiredFields[key]}.`;
        isValid = false;
      }
    });

    setErrors(newErrors);

    if (isValid) {
      nextStep();
    }
  };

  // --------------------------
  // Loading overlay
  // --------------------------
  const loading = loadingProvinces || loadingDistricts || loadingWards;
  
  // Helper to apply error class to input/select
  const getInputClass = (field) => 
    `w-full px-3 py-2 rounded border ${errors[field] ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-blue-300 focus:ring-blue-200'} focus:outline-none focus:ring transition-colors`;

  return (
    <div className="space-y-6 p-4 bg-white rounded-lg shadow-md max-w-lg mx-auto relative">
      <h2 className="text-xl font-semibold text-gray-800">Thông tin cửa hàng</h2>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10 rounded-lg">
          <Spin tip="Đang tải thông tin..." size="large" />
        </div>
      )}
      
      {/* 🌟 LOGO INPUT FIELD 🌟 */}
      <div className="border border-gray-200 rounded-lg p-3">
        <ImageUploadField
          label="Logo Cửa hàng"
          imageUrl={formData.logoUrl}
          onUpload={(url) => handleTopLevelChange("logoUrl", url)}
          error={errors.logoUrl}
        />
      </div>

      {/* Store Name */}
      <FormField label={requiredFields.recipientName} error={errors.recipientName}>
        <input
          type="text"
          placeholder="Ví dụ: Cửa hàng ABC"
          value={formData.storeAddress.recipientName}
          onChange={e => handleChange("recipientName", e.target.value)}
          className={getInputClass('recipientName')}
          disabled={loading}
        />
      </FormField>

      {/* Phone */}
      <FormField label={requiredFields.phone} error={errors.phone}>
        <input
          type="text"
          placeholder="Ví dụ: 0901234567"
          value={formData.storeAddress.phone}
          onChange={e => handleChange("phone", e.target.value)}
          className={getInputClass('phone')}
          disabled={loading}
        />
      </FormField>

      {/* Street */}
      <FormField label={requiredFields.street} error={errors.street}>
        <input
          type="text"
          placeholder="Ví dụ: 123 Đường Nguyễn Huệ"
          value={formData.storeAddress.street}
          onChange={e => handleChange("street", e.target.value)}
          className={getInputClass('street')}
          disabled={loading}
        />
      </FormField>

      {/* Province */}
      <FormField label={requiredFields.provinceCode} error={errors.provinceCode}>
        <select
          value={formData.storeAddress.provinceCode || ""}
          onChange={(e) => {
            const selected = provinces.find(p => String(p.code) === e.target.value);
            handleChange("provinceCode", e.target.value);
            handleChange("province", selected?.name_with_type || "");
          }}
          className={getInputClass('provinceCode')}
          disabled={loading}
        >
          <option value="">-- Chọn Tỉnh/Thành --</option>
          {provinces.map(p => (
            <option key={p.code} value={String(p.code)}>
              {p.name_with_type}
            </option>
          ))}
        </select>
      </FormField>

      {/* District */}
      <FormField label={requiredFields.districtCode} error={errors.districtCode}>
        <select
          value={formData.storeAddress.districtCode || ""}
          onChange={(e) => {
            const selected = districts.find(d => String(d.code) === e.target.value);
            handleChange("districtCode", e.target.value);
            handleChange("district", selected?.name_with_type || "");
          }}
          disabled={!formData.storeAddress.provinceCode || loading}
          className={getInputClass('districtCode')}
        >
          <option value="">-- Chọn Quận/Huyện --</option>
          {districts.map(d => (
            <option key={d.code} value={String(d.code)}>
              {d.name_with_type}
            </option>
          ))}
        </select>
      </FormField>

      {/* Ward */}
      <FormField label={requiredFields.wardCode} error={errors.wardCode}>
        <select
          value={formData.storeAddress.wardCode || ""}
          onChange={(e) => {
            const selected = wards.find(w => String(w.code) === e.target.value);
            handleChange("wardCode", e.target.value);
            handleChange("ward", selected?.name_with_type || "");
          }}
          disabled={!formData.storeAddress.districtCode || loading}
          className={getInputClass('wardCode')}
        >
          <option value="">-- Chọn Phường/Xã --</option>
          {wards.map(w => (
            <option key={w.code} value={String(w.code)}>
              {w.name_with_type}
            </option>
          ))}
        </select>
      </FormField>

      <div className="flex justify-between mt-8 pt-4 border-t border-gray-100">
        <Button onClick={prevStep}>Quay lại</Button>
        <Button type="primary" onClick={handleNextStep}>
          Tiếp tục
        </Button>
      </div>
    </div>
  );
};

export default Step3BusinessInfo;