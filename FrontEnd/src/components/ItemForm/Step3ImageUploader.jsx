// Step3ImageUploader.jsx (optimized, no popups)
import React, { useState, useCallback, useMemo } from "react";
import { Upload } from "antd";
import { UploadCloud } from "lucide-react";

export default function Step3ImageUploader({ onFilesSelected }) {
  const [fileList, setFileList] = useState([]);
  const MAX_FILES = 8;
  const VALID_TYPES = useMemo(() => ["image/jpeg", "image/png", "image/webp"], []);

  // ✅ Validation without popup — returns error messages as string
  const validateFile = useCallback(
    (file) => {
      if (!VALID_TYPES.includes(file.type)) {
        return "Chỉ được chọn file JPG, PNG hoặc WEBP!";
      }
      if (fileList.length >= MAX_FILES) {
        return `Chỉ được tải tối đa ${MAX_FILES} hình ảnh!`;
      }
      return null;
    },
    [fileList, VALID_TYPES]
  );

  const beforeUpload = useCallback(
    (file) => {
      const error = validateFile(file);
      if (error) {
        console.warn(error);
        return Upload.LIST_IGNORE; // silently reject invalid
      }

      const updated = [...fileList, file];
      setFileList(updated);
      onFilesSelected(updated.map((f) => f.originFileObj || f));
      return false; // prevent auto upload
    },
    [fileList, validateFile, onFilesSelected]
  );

  const handleRemove = useCallback(
    (file) => {
      const updated = fileList.filter((item) => item.uid !== file.uid);
      setFileList(updated);
      onFilesSelected(updated.map((f) => f.originFileObj || f));
    },
    [fileList, onFilesSelected]
  );

  return (
    <div className="text-center">
      <h3 className="text-lg font-semibold mb-2">Tải hình sản phẩm</h3>
      <p className="text-sm text-gray-500 mb-4">
        Chọn tất cả hình ảnh cho sản phẩm. Hình sẽ được tải lên ở bước tiếp theo.
      </p>

      <Upload
        listType="picture-card"
        fileList={fileList}
        beforeUpload={beforeUpload}
        onRemove={handleRemove}
        multiple
        accept=".png,.jpg,.jpeg,.webp"
        showUploadList={{ showPreviewIcon: false }}
      >
        {fileList.length >= MAX_FILES ? null : (
          <div className="flex flex-col items-center">
            <UploadCloud />
            <div className="mt-2 text-gray-600 text-sm">Chọn hình</div>
          </div>
        )}
      </Upload>

      {fileList.length >= MAX_FILES && (
        <p className="mt-2 text-sm text-red-500">
          Đã đạt giới hạn {MAX_FILES} hình ảnh.
        </p>
      )}
    </div>
  );
}
