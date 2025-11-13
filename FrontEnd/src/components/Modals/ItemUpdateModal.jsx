import React, { useEffect } from "react";
import { Modal, Form, Input, InputNumber, Select, Checkbox, Button } from "antd";

const { Option } = Select;

const bodyStyles = ["Sedan", "Hatchback", "SUV", "Crossover", "Coupe", "Convertible", "Pickup", "Van / Minivan", "Wagon", "Other"];
const colors = ["White", "Black", "Silver", "Gray", "Blue", "Red", "Green", "Yellow", "Orange", "Brown", "Beige", "Gold", "Purple", "Other"];
const batteryBrands = ["Panasonic", "Samsung SDI", "LG Chem", "CATL", "BYD", "Tesla", "Hitachi", "Toshiba", "A123 Systems", "SK Innovation", "Other"];

const UpdateItemModal = ({ visible, onCancel, onSubmit, type, data }) => {
  const [form] = Form.useForm();

  // Pre-fill existing values
  useEffect(() => {
    if (data) form.setFieldsValue(data);
  }, [data]);

  const handleFinish = (values) => {
    onSubmit(values);
  };

  // Fields sellers cannot update
  const disabledFields = ["brand", "model", "version", "categoryId", "licenseUrl"];

  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      footer={null}
      centered
      width={480}
      className="blur-bg-modal"
      maskStyle={{
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        backdropFilter: "blur(6px)",
      }}
      style={{ borderRadius: "16px" }}
    >
      <h2 className="text-lg font-semibold mb-3 text-center">
        {type === "Ev" ? "Cập nhật xe điện" : "Cập nhật pin"}
      </h2>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        className="space-y-2"
      >
        {type === "Ev" ? (
          <>
            <Form.Item label="Title" name="title">
              <Input placeholder="Tên xe..." />
            </Form.Item>

            <Form.Item label="Price (₫)" name="price">
              <InputNumber
                style={{ width: "100%" }}
                min={0}
                formatter={(v) =>
                  `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(v) => v.replace(/\D/g, "")}
              />
            </Form.Item>

            <Form.Item label="Year" name="year">
              <Select placeholder="Chọn năm">
                {Array.from(
                  { length: new Date().getFullYear() - 2008 + 1 },
                  (_, i) => 2008 + i
                )
                  .reverse()
                  .map((y) => (
                    <Option key={y} value={y}>
                      {y}
                    </Option>
                  ))}
              </Select>
            </Form.Item>

            <Form.Item label="Body Style" name="bodyStyle">
              <Select placeholder="Chọn kiểu dáng">
                {bodyStyles.map((style) => (
                  <Option key={style} value={style}>
                    {style}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Color" name="color">
              <Select placeholder="Chọn màu sắc">
                {colors.map((c) => (
                  <Option key={c} value={c}>
                    {c}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Mileage (km)" name="mileage">
              <InputNumber style={{ width: "100%" }} min={0} />
            </Form.Item>

            <Form.Item label="Previous Owners" name="previousOwners">
              <InputNumber style={{ width: "100%" }} min={0} />
            </Form.Item>

            <Form.Item label="License Plate" name="licensePlate">
              <Input placeholder="VD: 30H-123.45" />
            </Form.Item>

            <Form.Item name="hasAccessories" valuePropName="checked">
              <Checkbox>Có phụ kiện đi kèm</Checkbox>
            </Form.Item>

            <Form.Item name="isRegistrationValid" valuePropName="checked">
              <Checkbox>Đăng ký hợp lệ</Checkbox>
            </Form.Item>
          </>
        ) : (
          <>
            <Form.Item label="Quantity" name="quantity">
              <InputNumber style={{ width: "100%" }} min={1} />
            </Form.Item>

            <Form.Item label="Capacity (kWh)" name="capacity">
              <InputNumber style={{ width: "100%" }} min={0} />
            </Form.Item>

            <Form.Item label="Voltage (V)" name="voltage">
              <InputNumber style={{ width: "100%" }} min={0} />
            </Form.Item>

            <Form.Item label="Charge Cycles" name="chargeCycles">
              <InputNumber style={{ width: "100%" }} min={0} />
            </Form.Item>
          </>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={onCancel}>Huỷ</Button>
          <Button type="primary" htmlType="submit">
            Lưu thay đổi
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default UpdateItemModal;
