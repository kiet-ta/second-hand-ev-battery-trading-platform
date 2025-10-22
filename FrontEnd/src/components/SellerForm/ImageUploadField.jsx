import React, { useState } from 'react';
import { UploadOutlined, DeleteOutlined, LoadingOutlined } from '@ant-design/icons';
import { message, Spin } from 'antd';

const ImageUploadField = ({ label, imageUrl, onUpload }) => {
  const [previewUrl, setPreviewUrl] = useState(imageUrl || null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      message.error("Vui lòng chọn tệp hình ảnh hợp lệ!");
      return;
    }

    setUploading(true);

    try {
      // Giả lập upload delay (thay bằng API thật nếu có)
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // Tạo URL preview từ local file (để hiển thị ngay)
      const fakeUrl = URL.createObjectURL(file);
      setPreviewUrl(fakeUrl);
      onUpload(fakeUrl);

      message.success("Tải ảnh thành công!");
    } catch (err) {
      message.error("Tải ảnh thất bại, vui lòng thử lại.");
    } finally {
      setUploading(false);
      e.target.value = null; // reset file input
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onUpload(null);
    message.info("Đã xóa ảnh.");
  };

  return (
    <div className="flex flex-col bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>

      <div className="relative w-full h-44 border border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50 hover:bg-gray-100 transition">
        {uploading ? (
          <Spin
            indicator={<LoadingOutlined style={{ fontSize: 24, color: "#16a34a" }} spin />}
          />
        ) : previewUrl ? (
          <>
            <img
              src={previewUrl}
              alt={label}
              className="absolute inset-0 w-full h-full object-cover rounded-lg transition-transform duration-200 hover:scale-105"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 bg-white/90 hover:bg-red-500 hover:text-white p-2 rounded-full shadow transition-all duration-200"
              title="Xóa ảnh"
            >
              <DeleteOutlined />
            </button>
          </>
        ) : (
          <label className="flex flex-col items-center justify-center cursor-pointer">
            <UploadOutlined className="text-gray-500 text-xl mb-1" />
            <span className="text-gray-600 text-sm font-medium">Chọn ảnh</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
              className="hidden"
            />
          </label>
        )}
      </div>
    </div>
  );
};

export default ImageUploadField;
