import React, { useState, useEffect } from "react";
import axios from "axios";
import { UploadOutlined, DeleteOutlined, LoadingOutlined } from "@ant-design/icons";
import { message, Spin } from "antd";

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const ImageUploadField = ({ label, imageUrl, onUpload, error }) => {
  const [previewUrl, setPreviewUrl] = useState(imageUrl || null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setPreviewUrl(imageUrl);
  }, [imageUrl]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      message.error("Vui lòng chọn tệp hình ảnh hợp lệ!");
      return;
    }

    if (
      !CLOUDINARY_CLOUD_NAME ||
      !CLOUDINARY_UPLOAD_PRESET ||
      CLOUDINARY_CLOUD_NAME.includes("your_cloud_name_here")
    ) {
      message.error("Cloudinary chưa được cấu hình đúng. Vui lòng kiểm tra .env file!");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      // ✅ Upload to Cloudinary
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        formData
      );

      const imageUrl = res.data.secure_url;
      setPreviewUrl(imageUrl);
      onUpload(imageUrl);
      message.success("Tải ảnh lên thành công!");
    } catch (err) {
      console.error("Error uploading image:", err);
      message.error("Tải ảnh lên thất bại. Vui lòng thử lại!");
    } finally {
      setUploading(false);
      e.target.value = null; // reset input
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onUpload(null);
    message.info("Đã xóa ảnh.");
  };

  const borderColor = error ? "border-red-500" : "border-gray-300";

  return (
    <div className="flex flex-col bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label} <span className="text-red-500">*</span>
      </label>

      <div
        className={`relative w-full h-44 border border-dashed ${borderColor} rounded-lg flex items-center justify-center overflow-hidden bg-gray-50 hover:bg-gray-100 transition`}
      >
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

      {error && (
        <p className="mt-2 text-sm text-red-500 font-medium">{error}</p>
      )}
    </div>
  );
};

export default ImageUploadField;
