import React, { useState } from "react";
import { Button, Spin, Divider, message } from "antd";
import { ArrowLeftOutlined, CheckOutlined } from "@ant-design/icons";

const Step4Confirm = ({ formData, prevStep, handleSubmit, submitting }) => {
  const [confirming, setConfirming] = useState(false);

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      await handleSubmit();
    } catch (err) {
      message.error("Không thể gửi thông tin, vui lòng thử lại.");
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">
        Xác nhận thông tin đăng ký
      </h2>
      <p className="text-gray-600">
        Vui lòng kiểm tra lại toàn bộ thông tin trước khi gửi xác minh.
      </p>

      <Divider />

      <div className="space-y-4">
        <section>
          <h3 className="font-semibold text-gray-700 mb-2">Thông tin cá nhân</h3>
          <p><strong>Họ tên:</strong> {formData.fullName || "—"}</p>
          <p><strong>Email:</strong> {formData.email || "—"}</p>
          <p><strong>Số điện thoại:</strong> {formData.phone || "—"}</p>
          <p><strong>Giới thiệu:</strong> {formData.bio || "—"}</p>
        </section>

        <Divider />

        <section>
          <h3 className="font-semibold text-gray-700 mb-2">Ảnh xác minh</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {formData.idCardFrontFile && (
              <img
                src={URL.createObjectURL(formData.idCardFrontFile)}
                alt="CMND/CCCD Mặt trước"
                className="rounded-lg border object-cover w-full h-40"
              />
            )}
            {formData.idCardBackFile && (
              <img
                src={URL.createObjectURL(formData.idCardBackFile)}
                alt="CMND/CCCD Mặt sau"
                className="rounded-lg border object-cover w-full h-40"
              />
            )}
            {formData.selfieFile && (
              <img
                src={URL.createObjectURL(formData.selfieFile)}
                alt="Ảnh selfie"
                className="rounded-lg border object-cover w-full h-40"
              />
            )}
          </div>
        </section>

        {formData.accountType === "store" && (
          <>
            <Divider />
            <section>
              <h3 className="font-semibold text-gray-700 mb-2">Thông tin cửa hàng</h3>
              <p><strong>Tên cửa hàng:</strong> {formData.storeAddress.recipientName || "—"}</p>
              <p><strong>Số điện thoại cửa hàng:</strong> {formData.storeAddress.phone || "—"}</p>
              <p><strong>Địa chỉ:</strong> {[
                formData.storeAddress.street,
                formData.storeAddress.ward,
                formData.storeAddress.district,
                formData.storeAddress.province,
              ].filter(Boolean).join(", ") || "—"}</p>
              {formData.storeLogoUrl && (
                <div className="mt-3">
                  <img
                    src={formData.storeLogoUrl}
                    alt="Logo cửa hàng"
                    className="rounded-lg border object-cover w-32 h-32"
                  />
                </div>
              )}
            </section>
          </>
        )}
      </div>

      <Divider />

      <div className="flex justify-between mt-8">
        <Button icon={<ArrowLeftOutlined />} onClick={prevStep}>
          Quay lại
        </Button>

        <Button
          type="primary"
          icon={<CheckOutlined />}
          onClick={handleConfirm}
          loading={submitting || confirming}
        >
          Xác nhận & Gửi
        </Button>
      </div>
    </div>
  );
};

export default Step4Confirm;
