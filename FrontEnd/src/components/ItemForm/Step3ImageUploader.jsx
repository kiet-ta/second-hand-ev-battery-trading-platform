// Step3ImageUploader.jsx
import React, { useState } from "react";
import { Upload, message } from "antd";
import { UploadCloud } from "lucide-react";

export default function Step3ImageUploader({ onFilesSelected }) {
  const [fileList, setFileList] = useState([]);

  const handleRemove = (file) => {
    const updatedList = fileList.filter((item) => item.uid !== file.uid);
    setFileList(updatedList);
    onFilesSelected(updatedList.map(f => f.originFileObj || f));
  };

  const beforeUpload = (file) => {
    const isValid =
      file.type === "image/jpeg" ||
      file.type === "image/png" ||
      file.type === "image/webp";

    if (!isValid) {
      message.error("Chỉ được tải lên file JPG, PNG hoặc WEBP!");
      return Upload.LIST_IGNORE;
    }

    if (fileList.length >= 8) {
      message.warning("Chỉ được tải tối đa 8 hình ảnh!");
      return Upload.LIST_IGNORE;
    }

    const updatedList = [...fileList, file];
    setFileList(updatedList);
    onFilesSelected(updatedList.map(f => f.originFileObj || f));

    return false; // prevent automatic upload
  };

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
      >
        {fileList.length >= 8 ? null : (
          <div className="flex flex-col items-center">
            <UploadCloud />
            <div style={{ marginTop: 8 }}>Chọn hình</div>
          </div>
        )}
      </Upload>
    </div>
  );
}
