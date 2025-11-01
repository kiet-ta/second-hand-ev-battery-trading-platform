import React from "react";
import { Result, Button } from "antd";

export default function Step4Complete({ walletInfo, onDeposit, onReset }) {
  if (!walletInfo) {
    return (
      <Result
        status="error"
        title="Không thể lấy thông tin ví"
        subTitle="Vui lòng thử lại sau."
        extra={
          <Button type="primary" onClick={onReset}>
            Quay lại
          </Button>
        }
      />
    );
  }

  const canPayFee = walletInfo.balance >= 100000;

  return (
    <Result
      status={canPayFee ? "success" : "warning"}
      title={canPayFee ? "✅ Sản phẩm đã tạo thành công!" : "⚠️ Số dư không đủ"}
      subTitle={
        canPayFee
          ? "Bạn có thể thanh toán phí ₫100,000 để sản phẩm được đăng."
          : "Số dư ví hiện tại không đủ để thanh toán phí ₫100,000."
      }
      extra={[
        <div key="wallet-box" className="text-left border rounded-md p-4 mb-3">
          <h4 className="font-semibold mb-2">Thông tin ví</h4>
          <p>
            <strong>Số dư hiện tại:</strong>{" "}
            {walletInfo.balance.toLocaleString("vi-VN", {
              style: "currency",
              currency: "VND",
              minimumFractionDigits: 0,
            })}
          </p>
          {canPayFee && (
            <p className="text-green-600 mt-1">
              Bạn có đủ số dư để thanh toán phí. Nhấn "Thanh toán & Hoàn tất" để kích hoạt sản phẩm.
            </p>
          )}
          {!canPayFee && (
            <p className="text-red-600 mt-1">
              Số dư không đủ. Vui lòng nạp thêm tiền để đăng sản phẩm.
            </p>
          )}
        </div>,
        <Button
          type="primary"
          key="deposit"
          disabled={!canPayFee}
          onClick={onDeposit}
        >
          Thanh toán & Hoàn tất
        </Button>,
        <Button key="create" onClick={onReset}>
          Tạo sản phẩm khác
        </Button>,
      ]}
    />
  );
}
