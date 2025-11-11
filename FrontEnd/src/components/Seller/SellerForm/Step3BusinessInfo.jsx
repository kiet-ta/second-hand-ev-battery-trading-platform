import React, { useState } from "react";
import { Input, Button, Upload, Modal } from "antd";
import {
  UploadOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";

const Step3StoreInfo = ({
  formData,
  setFormData,
  updateStoreAddress,
  nextStep,
  prevStep,
}) => {
  const [logoFileList, setLogoFileList] = useState([]);
  const [preview, setPreview] = useState({ visible: false, src: "", title: "" });

  const handleFileChange = ({ fileList }) => {
    setLogoFileList(fileList);
    if (fileList.length > 0) {
      const file = fileList[0].originFileObj;
      setFormData((prev) => ({ ...prev, storeLogoFile: file }));
    } else {
      setFormData((prev) => ({ ...prev, storeLogoFile: null }));
    }
  };

  const handleNext = () => {
    const { recipientName, phone, street, ward, district, province } =
      formData.storeAddress;
    if (
      !recipientName ||
      !phone ||
      !street ||
      !ward ||
      !district ||
      !province ||
      !formData.storeLogoFile
    )
      return;

    nextStep();
  };

  const openPreview = (file, title) => {
    if (!file?.originFileObj) return;
    setPreview({
      visible: true,
      src: URL.createObjectURL(file.originFileObj),
      title,
    });
  };

  const closePreview = () => setPreview({ visible: false, src: "", title: "" });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">
        Thông tin cửa hàng
      </h2>
      <p className="text-gray-600">
        Vui lòng nhập đầy đủ thông tin cửa hàng để hoàn tất đăng ký.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Tên cửa hàng</label>
          <Input
            placeholder="VD: Cửa hàng EV Thanh Tâm"
            value={formData.storeAddress.recipientName}
            onChange={(e) =>
              updateStoreAddress({ recipientName: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Số điện thoại</label>
          <Input
            placeholder="VD: 090xxxxxxx"
            value={formData.storeAddress.phone}
            onChange={(e) => updateStoreAddress({ phone: e.target.value })}
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Địa chỉ cửa hàng</label>
          <Input
            placeholder="Số nhà, tên đường"
            value={formData.storeAddress.street}
            onChange={(e) => updateStoreAddress({ street: e.target.value })}
            className="mb-2"
          />
          <Input
            placeholder="Phường/Xã"
            value={formData.storeAddress.ward}
            onChange={(e) => updateStoreAddress({ ward: e.target.value })}
            className="mb-2"
          />
          <Input
            placeholder="Quận/Huyện"
            value={formData.storeAddress.district}
            onChange={(e) => updateStoreAddress({ district: e.target.value })}
            className="mb-2"
          />
          <Input
            placeholder="Tỉnh/Thành phố"
            value={formData.storeAddress.province}
            onChange={(e) => updateStoreAddress({ province: e.target.value })}
          />
        </div>

        <div>
          <label className="block font-medium mb-2">Logo cửa hàng</label>
          <Upload
            listType="picture-card"
            beforeUpload={() => false}
            fileList={logoFileList}
            onChange={handleFileChange}
            onPreview={(file) => openPreview(file, "Logo cửa hàng")}
            maxCount={1}
            accept="image/*"
          >
            {logoFileList.length === 0 && (
              <Button icon={<UploadOutlined />}>Tải lên</Button>
            )}
          </Upload>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <Button icon={<ArrowLeftOutlined />} onClick={prevStep}>
          Quay lại
        </Button>

        <Button
          type="primary"
          icon={<ArrowRightOutlined />}
          onClick={handleNext}
          disabled={
            !formData.storeAddress.recipientName ||
            !formData.storeAddress.phone ||
            !formData.storeAddress.street ||
            !formData.storeAddress.ward ||
            !formData.storeAddress.district ||
            !formData.storeAddress.province ||
            !formData.storeLogoFile
          }
        >
          Tiếp tục
        </Button>
      </div>

      <Modal
        open={preview.visible}
        footer={null}
        onCancel={closePreview}
        centered
        title={preview.title}
      >
        <img
          alt={preview.title}
          src={preview.src}
          className="w-full h-auto rounded-lg"
        />
      </Modal>
    </div>
  );
};

export default Step3StoreInfo;
