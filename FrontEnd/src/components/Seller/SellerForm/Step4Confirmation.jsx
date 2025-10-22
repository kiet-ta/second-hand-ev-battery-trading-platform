import React from "react";
import { Button, Divider } from "antd";

const Step4Confirmation = ({ formData, prevStep, handleSubmit }) => {
  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow-md max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Xác nhận thông tin</h2>

      <div className="space-y-4">
        <div>
          <span className="font-semibold">Họ và tên: </span>
          <span>{formData.fullName || "-"}</span>
        </div>

        <div>
          <span className="font-semibold">Email: </span>
          <span>{formData.email || "-"}</span>
        </div>

        <div>
          <span className="font-semibold">Số điện thoại: </span>
          <span>{formData.phone || "-"}</span>
        </div>

        <Divider />

        <div>
          <span className="font-semibold">Ảnh CMND/CCCD mặt trước:</span>
          {formData.idCardFrontUrl ? (
            <img
              src={formData.idCardFrontUrl}
              alt="Mặt trước CMND"
              className="mt-2 w-full rounded border"
            />
          ) : (
            <span className="ml-2">Chưa tải lên</span>
          )}
        </div>

        <div>
          <span className="font-semibold">Ảnh CMND/CCCD mặt sau:</span>
          {formData.idCardBackUrl ? (
            <img
              src={formData.idCardBackUrl}
              alt="Mặt sau CMND"
              className="mt-2 w-full rounded border"
            />
          ) : (
            <span className="ml-2">Chưa tải lên</span>
          )}
        </div>

        <div>
          <span className="font-semibold">Ảnh selfie với CMND/CCCD:</span>
          {formData.selfieUrl ? (
            <img
              src={formData.selfieUrl}
              alt="Selfie với CMND"
              className="mt-2 w-full rounded border"
            />
          ) : (
            <span className="ml-2">Chưa tải lên</span>
          )}
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <Button onClick={prevStep}>Quay lại</Button>
        <Button type="primary" onClick={handleSubmit}>
          Xác nhận & Gửi
        </Button>
      </div>
    </div>
  );
};

export default Step4Confirmation;
