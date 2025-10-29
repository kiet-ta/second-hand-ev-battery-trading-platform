import React, { useState } from "react"; 
import { Button } from "antd";
import ImageUploadField from "./ImageUploadField";

const Step2IDVerification = ({ formData, setFormData, nextStep, prevStep }) => {
  const [errors, setErrors] = useState({});
  const requiredFields = {
    idCardFrontUrl: "Ảnh CMND/CCCD mặt trước",
    idCardBackUrl: "Ảnh CMND/CCCD mặt sau",
    selfieUrl: "Ảnh selfie với CMND/CCCD",
  };

  const handleNextStep = () => {
    let newErrors = {};
    let isValid = true;
    for (const key in requiredFields) {
      if (!formData[key]) {
        newErrors[key] = `Vui lòng tải lên ${requiredFields[key]}.`;
        isValid = false;
      }
    }
    setErrors(newErrors);
    if (isValid) {
      nextStep();
    }
  };

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow-md max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Xác minh danh tính</h2>

      <ImageUploadField
        label="Ảnh CMND/CCCD mặt trước"
        imageUrl={formData.idCardFrontUrl}
        onUpload={(url) => {
          setErrors({ ...errors, idCardFrontUrl: undefined });
          setFormData({ ...formData, idCardFrontUrl: url });
        }}
        error={errors.idCardFrontUrl} 
      />

      <ImageUploadField
        label="Ảnh CMND/CCCD mặt sau"
        imageUrl={formData.idCardBackUrl}
        onUpload={(url) => {
          setErrors({ ...errors, idCardBackUrl: undefined });
          setFormData({ ...formData, idCardBackUrl: url });
        }}
        error={errors.idCardBackUrl}
      />

      <ImageUploadField
        label="Ảnh selfie với CMND/CCCD"
        imageUrl={formData.selfieUrl}
        onUpload={(url) => {
          setErrors({ ...errors, selfieUrl: undefined });
          setFormData({ ...formData, selfieUrl: url });
        }}
        error={errors.selfieUrl}
      />

      <div className="flex justify-between mt-6">
        <Button onClick={prevStep}>Quay lại</Button>
        <Button type="primary" onClick={handleNextStep}>
          Tiếp tục
        </Button>
      </div>
    </div>
  );
};

export default Step2IDVerification;