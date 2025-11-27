import React, { useState } from "react";
import { Form, Input, InputNumber, Radio, Select, Checkbox, Upload, Image, Modal } from "antd";
import { PlusOutlined } from "@ant-design/icons";

const { TextArea } = Input;
const { Option } = Select;

const bodyStyles = [
  "Sedan", "Hatchback", "SUV", "Crossover", "Coupe",
  "Convertible", "Pickup", "Van / Minivan", "Wagon", "Other"
];

const colors = [
  "White", "Black", "Silver", "Gray", "Blue", "Red", "Green", "Yellow",
  "Orange", "Brown", "Beige", "Gold", "Purple", "Other"
];

const batteryBrands = [
  "Panasonic", "Samsung SDI", "LG Chem", "CATL", "BYD", "Tesla",
  "Hitachi", "Toshiba", "A123 Systems", "SK Innovation", "Other"
];

export default function Step1ItemDetails({ form, onFinish, evData }) {
  const categoryId = Form.useWatch("categoryId", form);
  const brand = Form.useWatch("brand", form);
  const model = Form.useWatch("model", form);
  const [fileList, setFileList] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  // EV-specific data
  const evBrands = categoryId === 1 && evData ? Object.keys(evData) : [];
  const evModels = categoryId === 1 && brand ? Object.keys(evData[brand] || {}) : [];
  const evVersions = categoryId === 1 && brand && model ? evData[brand][model] || [] : [];

  // License plate validation
  const validateLicensePlate = (_, value) => {
    if (!value) return Promise.resolve();
    const regex = /^\d{2}[A-Z]{1,2}-\d{3,4}(\.\d{2})?$/;
    return regex.test(value)
      ? Promise.resolve()
      : Promise.reject("Biển số xe không hợp lệ (VD: 30A-123.45)");
  };


  const handleChange = ({ fileList: newFileList }) => {
    setFileList(newFileList.slice(-1)); // only allow 1 file
    const file = newFileList[0]?.originFileObj;
    if (file) {
      form.setFieldsValue({ licenseFile: file });
    }
  }
  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (err) => reject(err);
      });
    }
    setPreviewImage(file.url || file.preview);
    setPreviewVisible(true);
  };
  return (
    <Form
      form={form}
      name="step1"
      onFinish={onFinish}
      layout="vertical"
      scrollToFirstError={{ behavior: "smooth", block: "center" }}
      initialValues={{
        createAuction: false,
        hasAccessories: false,
        isRegistrationValid: false,
      }}
    >
      {/* COMMON FIELDS */}
      <Form.Item
        name="title"
        label="Tiêu đề"
        rules={[{ required: true, message: "Vui lòng nhập tiêu đề sản phẩm" }]}
      >
        <Input placeholder="VD: VinFast VF 8 Eco 2024" />
      </Form.Item>

      <Form.Item
        name="description"
        label="Mô tả"
        rules={[{ required: true, message: "Vui lòng nhập mô tả sản phẩm" }]}
      >
        <TextArea rows={3} placeholder="Nhập mô tả chi tiết về sản phẩm của bạn" />
      </Form.Item>

      <Form.Item
        name="price"
        label="Giá niêm yết (VND)"
        rules={[
          { required: true, message: "Vui lòng nhập giá" },
          { type: "number", min: 1000, message: "Giá phải lớn hơn 1.000 VNĐ" },
        ]}
      >
        <InputNumber
          style={{ width: "100%" }}
          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
          parser={(value) => value.replace(/\D/g, "")}
        />
      </Form.Item>

      <Form.Item
        name="categoryId"
        label="Loại sản phẩm"
        rules={[{ required: true, message: "Vui lòng chọn loại sản phẩm" }]}
      >
        <Radio.Group
          options={[
            { value: 1, label: "Xe điện" },
            { value: 2, label: "Pin" },
          ]}
        />
      </Form.Item>

      {/* EV FIELDS */}
      {categoryId === 1 && (
        <>
          <Form.Item name="brand" label="Hãng xe" rules={[{ required: true }]}>
            <Select
              placeholder="Chọn hãng xe"
              onChange={() => form.setFieldsValue({ model: undefined, version: undefined })}
            >
              {evBrands.map((b) => (
                <Option key={b} value={b}>{b}</Option>
              ))}
            </Select>
          </Form.Item>

          {brand && (
            <Form.Item name="model" label="Mẫu xe" rules={[{ required: true }]}>
              <Select
                placeholder="Chọn mẫu xe"
                onChange={() => form.setFieldsValue({ version: undefined })}
              >
                {evModels.map((m) => (
                  <Option key={m} value={m}>{m}</Option>
                ))}
              </Select>
            </Form.Item>
          )}

          {model && (
            <Form.Item name="version" label="Phiên bản" rules={[{ required: true }]}>
              <Select placeholder="Chọn phiên bản">
                {evVersions.map((v) => (
                  <Option key={v} value={v}>{v}</Option>
                ))}
              </Select>
            </Form.Item>
          )}

          <Form.Item name="year" label="Năm sản xuất" rules={[{ required: true }]}>
            <Select placeholder="Chọn năm">
              {Array.from({ length: new Date(new Date().getTime() + 7 * 60 * 60 * 1000).getFullYear() - 2008 + 1 }, (_, i) => 2008 + i)
                .reverse()
                .map((y) => (
                  <Option key={y} value={y}>{y}</Option>
                ))}
            </Select>
          </Form.Item>

          <Form.Item name="bodyStyle" label="Kiểu dáng" rules={[{ required: true }]}>
            <Select placeholder="Chọn kiểu dáng">
              {bodyStyles.map((style) => (
                <Option key={style} value={style}>{style}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="color" label="Màu sắc" rules={[{ required: true }]}>
            <Select placeholder="Chọn màu">
              {colors.map((c) => (
                <Option key={c} value={c}>{c}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="mileage" label="Số km đã đi" rules={[{ type: "number", min: 0 }]}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="previousOwners" label="Số chủ sở hữu trước đó" rules={[{ type: "number", min: 0 }]}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="licensePlate"
            label="Biển số xe"
            rules={[
              { required: true, message: "Vui lòng nhập biển số xe" },
              { validator: validateLicensePlate },
            ]}
          >
            <Input placeholder="VD: 30A-123.45" />
          </Form.Item>

          <Form.Item
            name="licenseFile"
            label="Ảnh giấy đăng ký xe"
            rules={[{ required: true, message: "Vui lòng tải lên ảnh giấy đăng ký xe" }]}
          >
            <>
              <Upload
                accept="image/*"
                listType="picture-card"
                fileList={fileList}
                onChange={handleChange}
                onPreview={handlePreview}
                beforeUpload={() => false} // prevent auto-upload
              >
                {fileList.length === 0 && (
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                )}
              </Upload>

              <Modal
                visible={previewVisible}
                footer={null}
                onCancel={() => setPreviewVisible(false)}
              >
                <img alt="Preview" style={{ width: "100%" }} src={previewImage} />
              </Modal>
            </>
          </Form.Item>
          <Form.Item name="hasAccessories" valuePropName="checked">
            <Checkbox>Có phụ kiện kèm theo</Checkbox>
          </Form.Item>

          <Form.Item name="isRegistrationValid" valuePropName="checked">
            <Checkbox>Giấy đăng ký còn hiệu lực</Checkbox>
          </Form.Item>
        </>
      )}

      {/* BATTERY FIELDS */}
      {categoryId === 2 && (
        <>
          <Form.Item name="quantity" label="Số lượng" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="brand" label="Thương hiệu pin" rules={[{ required: true }]}>
            <Select placeholder="Chọn thương hiệu pin">
              {batteryBrands.map((b) => (
                <Option key={b} value={b}>{b}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="condition" label="Tình trạng pin" rules={[{ required: true }]}>
            <Select placeholder="Chọn tình trạng của pin">
              <Option value="New">Mới</Option>
              <Option value="Old">Đã sử dụng</Option>
            </Select>
          </Form.Item>


          <Form.Item name="capacity" label="Dung lượng (kWh)">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="voltage" label="Điện áp (V)">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="chargeCycle" label="Số chu kỳ sạc">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
        </>
      )}

      {/* AUCTION OPTION */}
      <Form.Item name="createAuction" valuePropName="checked">
        <Checkbox>Tạo phiên đấu giá cho sản phẩm này?</Checkbox>
      </Form.Item>
    </Form>
  );
}
