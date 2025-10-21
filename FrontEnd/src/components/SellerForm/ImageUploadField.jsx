// ImageUploadField.js
import React, { useState } from 'react';

const ImageUploadField = ({ label, imageUrl, onUpload }) => {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    // --- MÔ PHỎNG TẢI LÊN ---
    // Trong ứng dụng thực tế, bạn sẽ tải file lên cloud (S3, Firebase Storage, Cloudinary)
    // và nhận lại một URL.
    setTimeout(() => {
      // Tạo một URL giả lập từ placeholder.com
      const fakeUrl = `https://via.placeholder.com/400x300.png?text=${encodeURIComponent(file.name)}`;
      
      onUpload(fakeUrl); // Gọi callback với URL đã tải lên
      setUploading(false);
    }, 1000); // Giả lập độ trễ mạng 1 giây
    // --- KẾT THÚC MÔ PHỎNG ---
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="mt-1 flex items-center space-x-4">
        <div className="flex-shrink-0 w-32 h-24 rounded-md border border-gray-300 flex items-center justify-center bg-gray-50">
          {imageUrl ? (
            <img src={imageUrl} alt={label} className="w-full h-full object-cover rounded-md" />
          ) : (
            <span className="text-xs text-gray-500">Chưa có ảnh</span>
          )}
        </div>
        <label className="relative cursor-pointer bg-white rounded-md border border-gray-300 py-2 px-3 shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
          <span>{uploading ? 'Đang tải lên...' : 'Chọn ảnh'}</span>
          <input 
            type="file" 
            className="sr-only" 
            accept="image/*"
            onChange={handleFileChange} 
            disabled={uploading}
          />
        </label>
      </div>
    </div>
  );
};

export default ImageUploadField;