import React from "react";
import { Input, Button } from "antd";

const Step3BusinessInfo = ({ formData, setFormData, nextStep, prevStep }) => {
  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      storeAddress: { ...formData.storeAddress, [field]: value },
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Thông tin cửa hàng</h2>
      <Input
        placeholder="Tên cửa hàng"
        value={formData.storeAddress.recipientName}
        onChange={(e) => handleChange("recipientName", e.target.value)}
      />
      <Input
        placeholder="SĐT cửa hàng"
        value={formData.storeAddress.phone}
        onChange={(e) => handleChange("phone", e.target.value)}
      />
      <Input
        placeholder="Địa chỉ (số nhà, đường)"
        value={formData.storeAddress.street}
        onChange={(e) => handleChange("street", e.target.value)}
      />
      <Input
        placeholder="Phường/Xã"
        value={formData.storeAddress.ward}
        onChange={(e) => handleChange("ward", e.target.value)}
      />
      <Input
        placeholder="Quận/Huyện"
        value={formData.storeAddress.district}
        onChange={(e) => handleChange("district", e.target.value)}
      />
      <Input
        placeholder="Tỉnh/Thành phố"
        value={formData.storeAddress.province}
        onChange={(e) => handleChange("province", e.target.value)}
      />

      <div className="flex justify-between">
        <Button onClick={prevStep}>Quay lại</Button>
        <Button type="primary" onClick={nextStep}>
          Tiếp tục
        </Button>
      </div>
    </div>
  );
};

export default Step3BusinessInfo;
