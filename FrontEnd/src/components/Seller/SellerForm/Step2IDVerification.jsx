import React, { useState } from "react";
import { Button, Upload, Modal } from "antd";
import {
  UploadOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";

const Step2KYCVerification = ({ formData, setFormData, nextStep, prevStep }) => {
  const [preview, setPreview] = useState({ visible: false, src: "", title: "" });

  const [frontFileList, setFrontFileList] = useState([]);
  const [backFileList, setBackFileList] = useState([]);
  const [selfieFileList, setSelfieFileList] = useState([]);

  const [errors, setErrors] = useState({ front: "", back: "", selfie: "" });

  const handleFileChange = (setter, key) => ({ fileList }) => {
    setter(fileList);

    if (fileList.length > 0) {
      const file = fileList[0].originFileObj;
      setFormData((prev) => ({ ...prev, [key]: file }));
      setErrors((e) => ({ ...e, [key]: "" }));
    } else {
      setFormData((prev) => ({ ...prev, [key]: null }));
    }
  };

  const handleNext = () => {
    const missingFront = !formData.idCardFrontFile;
    const missingBack = !formData.idCardBackFile;
    const missingSelfie = !formData.selfieFile;

    if (missingFront || missingBack || missingSelfie) {
      setErrors({
        front: missingFront ? "Vui lòng tải lên ảnh mặt trước." : "",
        back: missingBack ? "Vui lòng tải lên ảnh mặt sau." : "",
        selfie: missingSelfie ? "Vui lòng tải ảnh selfie cầm giấy tờ." : "",
      });
      return;
    }

    nextStep();
  };

  const openPreview = (file, title) => {
    const origin = file?.originFileObj;
    if (!origin) return;
    setPreview({
      visible: true,
      src: URL.createObjectURL(origin),
      title,
    });
  };

  const closePreview = () => setPreview({ visible: false, src: "", title: "" });

  const uploadButton = (label) => <Button icon={<UploadOutlined />}>{label}</Button>;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">
        Xác minh danh tính
      </h2>
      <p className="text-gray-600">
        Vui lòng tải lên ảnh CMND/CCCD (mặt trước, mặt sau) và ảnh selfie cầm giấy tờ.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Front */}
        <div className="flex flex-col items-center">
          <p className="font-medium mb-2">CMND/CCCD Mặt Trước</p>
          <Upload
            listType="picture-card"
            beforeUpload={() => false}
            fileList={frontFileList}
            onChange={handleFileChange(setFrontFileList, "idCardFrontFile")}
            onPreview={(file) => openPreview(file, "Mặt trước")}
            maxCount={1}
            accept="image/*"
          >
            {frontFileList.length === 0 && uploadButton("Tải lên")}
          </Upload>
          {errors.front && <div className="text-xs text-red-500">{errors.front}</div>}
        </div>

        {/* Back */}
        <div className="flex flex-col items-center">
          <p className="font-medium mb-2">CMND/CCCD Mặt Sau</p>
          <Upload
            listType="picture-card"
            beforeUpload={() => false}
            fileList={backFileList}
            onChange={handleFileChange(setBackFileList, "idCardBackFile")}
            onPreview={(file) => openPreview(file, "Mặt sau")}
            maxCount={1}
            accept="image/*"
          >
            {backFileList.length === 0 && uploadButton("Tải lên")}
          </Upload>
          {errors.back && <div className="text-xs text-red-500">{errors.back}</div>}
        </div>

        {/* Selfie */}
        <div className="flex flex-col items-center">
          <p className="font-medium mb-2">Ảnh Selfie</p>
          <Upload
            listType="picture-card"
            beforeUpload={() => false}
            fileList={selfieFileList}
            onChange={handleFileChange(setSelfieFileList, "selfieFile")}
            onPreview={(file) => openPreview(file, "Ảnh Selfie")}
            maxCount={1}
            accept="image/*"
          >
            {selfieFileList.length === 0 && uploadButton("Tải lên")}
          </Upload>
          {errors.selfie && <div className="text-xs text-red-500">{errors.selfie}</div>}
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <Button icon={<ArrowLeftOutlined />} onClick={prevStep}>
          Quay lại
        </Button>

        <Button type="primary" icon={<ArrowRightOutlined />} onClick={handleNext}>
          Tiếp tục
        </Button>
      </div>

      <Modal open={preview.visible} footer={null} onCancel={closePreview} centered title={preview.title}>
        <img src={preview.src} alt={preview.title} className="w-full h-auto rounded-lg" />
      </Modal>
    </div>
  );
};

export default Step2KYCVerification;
