import React from 'react';
import ImageUploadField from './ImageUploadField'

const Step2_KYC = ({ formData, setFormData, nextStep, prevStep }) => (
  <div>
    <h2 className="text-xl font-semibold text-gray-800 mb-2">Bước 2: Xác minh KYC</h2>
    <p className="text-sm text-gray-600 mb-4">Vui lòng tải lên hình ảnh rõ nét của giấy tờ và ảnh chân dung của bạn.</p>
    <div className="space-y-4">
      <ImageUploadField
        label="Ảnh mặt trước CMND/CCCD"
        imageUrl={formData.idCardFrontUrl}
        onUpload={(url) => setFormData({ ...formData, idCardFrontUrl: url })}
      />
      <ImageUploadField
        label="Ảnh mặt sau CMND/CCCD"
        imageUrl={formData.idCardBackUrl}
        onUpload={(url) => setFormData({ ...formData, idCardBackUrl: url })}
      />
      <ImageUploadField
        label="Ảnh chân dung (Selfie)"
        imageUrl={formData.selfieUrl}
        onUpload={(url) => setFormData({ ...formData, selfieUrl: url })}
      />
    </div>
    <div className="mt-8 flex justify-between">
      <button onClick={prevStep} className="bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg hover:bg-gray-400 transition-colors">Quay lại</button>
      <button onClick={nextStep} className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition-colors">Tiếp theo</button>
    </div>
  </div>
);

export default Step2_KYC;
