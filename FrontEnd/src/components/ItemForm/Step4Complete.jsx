import React, { useMemo } from "react";
import { Button, Card, Typography, Alert } from "antd";
import commissionApi from "../../api/commissionApi";

export default function Step4Complete({ walletInfo, onDeposit, onReset }) {
  const balance = useMemo(() => walletInfo?.balance || 0, [walletInfo]);
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <Typography.Title level={4}>Hoàn tất tạo sản phẩm</Typography.Title>
        <Typography.Paragraph>
          Đây là bước cuối cùng. Vui lòng kiểm tra thông tin sản phẩm và số dư ví của bạn trước khi hoàn tất.
        </Typography.Paragraph>

        {balance >= 100000 ? (
          <Alert
            message={`Bạn có đủ tiền trong ví (${balance.toLocaleString()} đ). Nhấn "Thanh toán" để hoàn tất.`}
            type="success"
            showIcon
            className="mb-4"
          />
        ) : (
          <Alert
            message={`Số dư ví hiện tại của bạn là ${balance.toLocaleString()} đ. Không đủ 100.000 đ.`}
            type="warning"
            showIcon
            className="mb-4"
          />
        )}
      </Card>

      <div className="flex justify-between">
        <Button onClick={onReset} danger>
          Hủy & Quay lại trang chính
        </Button>

        {balance >= 100000 ? (
          <Button type="primary" onClick={onDeposit}>
            Thanh toán 100.000 đ
          </Button>
        ) : (
          <Button type="primary" disabled>
            Không thể thanh toán
          </Button>
        )}
      </div>
    </div>
  );
}
