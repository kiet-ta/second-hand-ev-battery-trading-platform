import React from "react";
import { Button } from "antd";
import ImageUploadField from "./ImageUploadField"; // import the new component

const Step2IDVerification = ({ formData, setFormData, nextStep, prevStep }) => {
  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow-md max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Xác minh danh tính</h2>

      <ImageUploadField
        label="Ảnh CMND/CCCD mặt trước"
        imageUrl={formData.idCardFrontUrl}
        onUpload={(url) => setFormData({ ...formData, idCardFrontUrl: url })}
      />

      <ImageUploadField
        label="Ảnh CMND/CCCD mặt sau"
        imageUrl={formData.idCardBackUrl}
        onUpload={(url) => setFormData({ ...formData, idCardBackUrl: url })}
      />

      <ImageUploadField
        label="Ảnh selfie với CMND/CCCD"
        imageUrl={formData.selfieUrl}
        onUpload={(url) => setFormData({ ...formData, selfieUrl: url })}
      />

      <div className="flex justify-between mt-6">
        <Button onClick={prevStep}>Quay lại</Button>
        <Button type="primary" onClick={nextStep}>
          Tiếp tục
        </Button>
      </div>
    </div>
  );
};

export default Step2IDVerification;
