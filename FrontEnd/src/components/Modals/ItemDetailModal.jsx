import React, { useEffect, useState } from "react";
import { Modal, Descriptions, Image, Spin, message, Tag } from "antd";
import itemApi from "../../api/itemApi";

export default function ItemDetailModal({ itemId, open, onClose }) {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItemDetail = async () => {
      if (!itemId) return;
      try {
        setLoading(true);
        const res = await itemApi.getItemDetailByID(itemId);
        setItem(res);
      } catch (error) {
        console.error("Failed to fetch item detail:", error);
      } finally {
        setLoading(false);
      }
    };
    if (open) fetchItemDetail();
  }, [itemId, open]);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
      centered
      title={<span className="font-semibold text-lg">Chi tiết sản phẩm</span>}
    >
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <Spin size="large" />
        </div>
      ) : item ? (
        <div className="space-y-5">
          {/* Images */}
          {item.itemImage?.length > 0 && (
            <div className="flex gap-3 flex-wrap justify-center">
              {item.itemImage.map((img) => (
                <Image
                  key={img.imageId}
                  src={img.imageUrl}
                  alt="item"
                  width={160}
                  height={120}
                  className="rounded-md object-cover"
                />
              ))}
            </div>
          )}

          {/* General info */}
          <Descriptions
            bordered
            column={2}
            size="small"
            labelStyle={{ fontWeight: 600 }}
          >
            <Descriptions.Item label="Tên sản phẩm" span={2}>
              {item.title}
            </Descriptions.Item>
            <Descriptions.Item label="Loại">
              {item.itemType === "ev" ? (
                <Tag color="blue">Xe điện</Tag>
              ) : (
                <Tag color="green">Pin</Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Giá">
              <span className="font-semibold text-blue-600">
                {item.price?.toLocaleString("vi-VN")} ₫
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Số lượng">{item.quantity}</Descriptions.Item>
            <Descriptions.Item label="Trạng thái kiểm duyệt">
              {item.moderation === "approved_tag" ? (
                <Tag color="green">Đã duyệt</Tag>
              ) : (
                <Tag color="red">Bị từ chối</Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {new Date(item.createdAt).toLocaleDateString()}
            </Descriptions.Item>
            <Descriptions.Item label="Mô tả" span={2}>
              {item.description || "Không có mô tả."}
            </Descriptions.Item>
          </Descriptions>

          {/* EV detail */}
          {item.evDetail && (
            <>
              <h3 className="font-semibold text-base mt-6">Thông tin xe điện</h3>
              <Descriptions bordered column={2} size="small">
                <Descriptions.Item label="Hãng">
                  {item.evDetail.brand}
                </Descriptions.Item>
                <Descriptions.Item label="Mẫu xe">
                  {item.evDetail.model}
                </Descriptions.Item>
                <Descriptions.Item label="Phiên bản">
                  {item.evDetail.version}
                </Descriptions.Item>
                <Descriptions.Item label="Năm sản xuất">
                  {item.evDetail.year}
                </Descriptions.Item>
                <Descriptions.Item label="Màu sắc">
                  {item.evDetail.color}
                </Descriptions.Item>
                <Descriptions.Item label="Biển số">
                  {item.evDetail.licensePlate}
                </Descriptions.Item>
                <Descriptions.Item label="Số km đã đi">
                  {item.evDetail.mileage?.toLocaleString()} km
                </Descriptions.Item>
                <Descriptions.Item label="Số chủ sở hữu trước">
                  {item.evDetail.previousOwners}
                </Descriptions.Item>
                <Descriptions.Item label="Phụ kiện kèm theo">
                  {item.evDetail.hasAccessories ? "Có" : "Không"}
                </Descriptions.Item>
                <Descriptions.Item label="Đăng ký hợp lệ">
                  {item.evDetail.isRegistrationValid ? "Hợp lệ" : "Không hợp lệ"}
                </Descriptions.Item>
              </Descriptions>
            </>
          )}

          {/* Battery detail */}
          {item.batteryDetail && (
            <>
              <h3 className="font-semibold text-base mt-6">Thông tin pin</h3>
              <Descriptions bordered column={2} size="small">
                <Descriptions.Item label="Thương hiệu">
                  {item.batteryDetail.brand}
                </Descriptions.Item>
                <Descriptions.Item label="Dung lượng">
                  {item.batteryDetail.capacity} kWh
                </Descriptions.Item>
                <Descriptions.Item label="Điện áp">
                  {item.batteryDetail.voltage} V
                </Descriptions.Item>
                <Descriptions.Item label="Chu kỳ sạc">
                  {item.batteryDetail.chargeCycles}
                </Descriptions.Item>
              </Descriptions>
            </>
          )}
        </div>
      ) : (
        <p className="text-center text-gray-500 py-6">
          Không tìm thấy dữ liệu sản phẩm.
        </p>
      )}
    </Modal>
  );
}
