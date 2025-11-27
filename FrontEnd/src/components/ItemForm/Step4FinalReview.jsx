import React, { useMemo } from "react";
import { Button, Card, Typography, Descriptions, Alert } from "antd";

export default function Step4FinalReview({
  draftData,
  licenseError,
  onConfirm,
  onBack,
}) {
  const { itemInfo, auctionInfo, images } = draftData || {};

  const isEV = itemInfo?.categoryId === 1;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <Typography.Title level={4}>Kiểm tra lần cuối</Typography.Title>
        <Typography.Paragraph>
          Vui lòng kiểm tra toàn bộ thông tin trước khi hoàn tất tạo sản phẩm.
        </Typography.Paragraph>

        {licenseError && (
          <Alert
            message="Biển số xe đã tồn tại hoặc không hợp lệ. Vui lòng kiểm tra lại."
            type="error"
            showIcon
            className="mb-4"
          />
        )}

        <Descriptions
          bordered
          column={1}
          size="middle"
          labelStyle={{ fontWeight: "600", width: "200px" }}
        >
          <Descriptions.Item label="Tiêu đề">
            {itemInfo?.title}
          </Descriptions.Item>

          <Descriptions.Item label="Giá bán">
            {itemInfo?.price?.toLocaleString()} đ
          </Descriptions.Item>

          <Descriptions.Item label="Mô tả">
            {itemInfo?.description || "Không có"}
          </Descriptions.Item>

          <Descriptions.Item label="Danh mục">
            {isEV ? "Xe điện" : "Pin"}
          </Descriptions.Item>

          {/* EV DETAILS */}
          {isEV && (
            <>
              <Descriptions.Item label="Hãng">{itemInfo?.brand}</Descriptions.Item>
              <Descriptions.Item label="Model">{itemInfo?.model}</Descriptions.Item>
              <Descriptions.Item label="Phiên bản">{itemInfo?.version}</Descriptions.Item>
              <Descriptions.Item label="Năm">{itemInfo?.year}</Descriptions.Item>
              <Descriptions.Item label="Màu sắc">{itemInfo?.color}</Descriptions.Item>
              <Descriptions.Item label="Kiểu dáng">{itemInfo?.bodyStyle}</Descriptions.Item>
              <Descriptions.Item label="Biển số xe">{itemInfo?.licensePlate}</Descriptions.Item>
              <Descriptions.Item label="Có phụ kiện?">
                {itemInfo?.hasAccessories ? "Có" : "Không"}
              </Descriptions.Item>
              <Descriptions.Item label="Số chủ cũ">{itemInfo?.previousOwners}</Descriptions.Item>
              <Descriptions.Item label="Số km đã đi">
                {itemInfo?.mileage?.toLocaleString()} km
              </Descriptions.Item>
            </>
          )}

          {/* BATTERY DETAILS */}
          {!isEV && (
            <>
              <Descriptions.Item label="Hãng">{itemInfo?.brand}</Descriptions.Item>
              <Descriptions.Item label="Tình trạng">{itemInfo?.condition}</Descriptions.Item>
              <Descriptions.Item label="Dung lượng">{itemInfo?.capacity} Ah</Descriptions.Item>
              <Descriptions.Item label="Điện áp">{itemInfo?.voltage} V</Descriptions.Item>
              <Descriptions.Item label="Số lần sạc">
                {itemInfo?.chargeCycle}
              </Descriptions.Item>
            </>
          )}

          {/* Auction Info */}
          {itemInfo?.createAuction && auctionInfo && (
            <>
              <Descriptions.Item label="Giá khởi điểm">
                {auctionInfo.startingPrice?.toLocaleString()} đ
              </Descriptions.Item>
              <Descriptions.Item label="Bước giá">
                {auctionInfo.stepPrice?.toLocaleString()} đ
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian">
                {auctionInfo.auctionTime?.[0]?.toLocaleString()} →{" "}
                {auctionInfo.auctionTime?.[1]?.toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Cho phép mua ngay">
                {auctionInfo?.isBuyNow ? "Có" : "Không"}
              </Descriptions.Item>
            </>
          )}

          {/* Images */}
          <Descriptions.Item label="Hình ảnh">
            <div className="flex gap-3 flex-wrap">
              {images?.map((f, idx) => (
                <img
                  key={idx}
                  src={typeof f === "string" ? f : URL.createObjectURL(f)}
                  alt="preview"
                  className="w-24 h-24 object-cover rounded border"
                />
              ))}
            </div>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <div className="flex justify-between">
        <Button onClick={onBack}>Quay lại chỉnh sửa</Button>
        <Button type="primary" onClick={onConfirm}>
          Xác nhận & Tạo sản phẩm
        </Button>
      </div>
    </div>
  );
}
