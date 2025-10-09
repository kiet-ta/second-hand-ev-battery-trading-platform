import React, { useState } from 'react';
import { PlusCircle } from "lucide-react";
import {
  Checkbox,
  Form,
  Input,
  InputNumber,
  Modal,
  Radio,
  Select,
} from 'antd';
import evData from '../assets/datas/evData'; // Assuming path is correct
import itemApi from '../api/itemApi';

// ✨ 1. No need for separate import of useForm/Option when getting from Form/Select
const { TextArea } = Input;
const { Option } = Select;
const userID = localStorage.getItem("userId")
const bodyStyles = ["Sedan", "Hatchback", "SUV", "Crossover", "Coupe", "Convertible", "Pickup", "Van / Minivan", "Wagon", "Other"];
const colors = ["White", "Black", "Silver", "Gray", "Blue", "Red", "Green", "Yellow", "Orange", "Brown", "Beige", "Gold", "Purple", "Other"];
const batteryBrands = ["Panasonic", "Samsung SDI", "LG Chem", "CATL", "BYD", "Tesla", "Hitachi", "Toshiba", "A123 Systems", "SK Innovation", "Other"];

export default function FormComponent({onSuccess}) {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [form] = Form.useForm();

  // ✨ 2. Use Form.useWatch to safely read form values for conditional rendering
  // This replaces the useState for itemType, brand, and model.
  const categoryId = Form.useWatch('categoryId', form);
  const brand = Form.useWatch('brand', form);
  const model = Form.useWatch('model', form);

  const brands = Object.keys(evData);
  const models = brand ? Object.keys(evData[brand]) : [];
  const versions = brand && model ? evData[brand][model] : [];

  const showModal = () => {
    setIsOpenModal(true);
  };

  const handleAddCancel = () => {
    setIsOpenModal(false);
    form.resetFields();
  };

  const onFinish = (values) => {
    console.log("Form values received: ", values);

    // Base payload with common fields
    let apiPayload = {
      categoryId: values.categoryId,
      title: values.title,
      description: values.description || "",
      price: values.price,
      quantity: values.quantity || 1, // Default value
      status: "active", // Default value
      updatedBy: userID, // Should come from user session
    };

    if (values.categoryId === 1) { // Electric Vehicle
      // EV logic remains the same
      Object.assign(apiPayload, {
        brand: values.brand,
        model: values.model,
        version: values.version,
        year: values.year,
        bodyStyle: values.bodyStyle,
        color: values.color,
        licensePlate: values.licensePlate || "",
        hasAccessories: values.hasAccessories || false,
        previousOwners: values.previousOwners || 0,
        isRegistrationValid: values.isRegistrationValid || false,
        mileage: values.mileage || 0,
      });

    } else if (values.categoryId === 2) { // Battery 🔋
      // ✨ NEW: Direct mapping for the battery payload
      Object.assign(apiPayload, {
        brand: values.battery_brand,
        capacity: values.capacity || 0,
        voltage: values.voltage || 0,
        chargeCycles: values.chargeCycle || 0, // Note: form name is singular, API is plural
      });
    }
    postItem(apiPayload)
    handleAddCancel(); // Close and reset form after submission
  };
  const handleAddOk = () => {
    form.submit();
  };

  const postItem = async (payload) => {
    try {
      payload.categoryId === 1
        ? await itemApi.postItemEV(payload) // Assuming you have a separate function for EV
        : await itemApi.postItemBattery(payload);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error fetching items", error);
    }
  }
  return (
    <div>
      <button className="flex items-center bg-blue-500 text-white px-4 py-2 rounded shadow" onClick={showModal}>
        <PlusCircle className="w-5 h-5 mr-2" />
        Add New Product
      </button>
      <Modal
        title="Add New Product"
        open={isOpenModal}
        onOk={handleAddOk}
        onCancel={handleAddCancel}
        width={800}
      >
        <Form
          form={form}
          onFinish={onFinish}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          layout="horizontal"
          style={{ maxWidth: 600, margin: '0 auto' }}
          initialValues={{ hasAccessories: false, isRegistrationValid: false }}
        >
          {/* ✨ 3. Corrected all `name` props to be lowercase and match the payload */}
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <TextArea rows={2} />
          </Form.Item>
          <Form.Item name="price" label="Price" rules={[{ required: true }]}>
            <InputNumber style={{ width: "100%" }} min={0} formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} parser={(value) => value.replace(/\$\s?|(,*)/g, "")} />
          </Form.Item>
          <Form.Item name="categoryId" label="Item type" rules={[{ required: true }]}>
            <Radio.Group options={[{ value: 1, label: 'Electric Vehicle' }, { value: 2, label: 'Battery' }]} />
          </Form.Item>

          {/* Conditional Rendering based on the FORM's value */}
          {categoryId === 1 ? (
            <>
              <Form.Item name="brand" label="Brand" rules={[{ required: true }]}>
                {/* ✨ 4. Removed `value` prop. Let Form.Item control it. */}
                <Select
                  placeholder="Select Brand"
                  onChange={() => {
                    // Reset dependent fields when brand changes
                    form.setFieldsValue({ model: undefined, version: undefined });
                  }}
                >
                  {brands.map((b) => (<Option key={b} value={b}>{b}</Option>))}
                </Select>
              </Form.Item>

              {/* Show Model dropdown only when a brand is selected */}
              {brand && (
                <Form.Item name="model" label="Model" rules={[{ required: true }]}>
                  <Select
                    placeholder="Select Model"
                    onChange={() => {
                      form.setFieldsValue({ version: undefined });
                    }}
                  >
                    {models.map((m) => (<Option key={m} value={m}>{m}</Option>))}
                  </Select>
                </Form.Item>
              )}

              {/* Show Version dropdown only when a model is selected */}
              {model && (
                <Form.Item name="version" label="Version" rules={[{ required: true }]}>
                  <Select placeholder="Select Version">
                    {versions.map((v) => (<Option key={v} value={v}>{v}</Option>))}
                  </Select>
                </Form.Item>
              )}

              <Form.Item name="year" label="Year" rules={[{ required: true }]}>
                <Select placeholder="Select Year">
                  {Array.from({ length: new Date().getFullYear() - 2008 + 1 }, (_, i) => 2008 + i).reverse().map((y) => (<Option key={y} value={y}>{y}</Option>))}
                </Select>
              </Form.Item>

              <Form.Item name="bodyStyle" label="Body Style" rules={[{ required: true }]}>
                <Select placeholder="Select Body Style">
                  {bodyStyles.map((style) => (<Option key={style} value={style}>{style}</Option>))}
                </Select>
              </Form.Item>

              <Form.Item name="color" label="Color" rules={[{ required: true }]}>
                <Select placeholder="Select Color">
                  {colors.map((c) => (<Option key={c} value={c}>{c}</Option>))}
                </Select>
              </Form.Item>

              {/* ✨ 5. Added all missing `name` props */}
              <Form.Item name="licensePlate" label="License Plate">
                <Input />
              </Form.Item>
              <Form.Item name="previousOwners" label="Previous Owners">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item name="mileage" label="Mileage (km)">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>

              {/* ✨ 6. Wrapped Checkboxes correctly in Form.Item with valuePropName */}
              <Form.Item name="hasAccessories" valuePropName="checked" wrapperCol={{ offset: 6 }}>
                <Checkbox>Has Accessories</Checkbox>
              </Form.Item>
              <Form.Item name="isRegistrationValid" valuePropName="checked" wrapperCol={{ offset: 6 }}>
                <Checkbox>Is Registration Valid</Checkbox>
              </Form.Item>
            </>
          ) : categoryId === 2 ? (
            <>
              <Form.Item name="quantity" label="Quantity">
                <InputNumber min={1} style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item name="battery_brand" label="Battery Brand" rules={[{ required: true }]}>
                <Select placeholder="Select a battery brand">
                  {batteryBrands.map((b) => (<Option key={b} value={b}>{b}</Option>))}
                </Select>
              </Form.Item>
              <Form.Item name="capacity" label="Capacity (kWh)">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item name="voltage" label="Voltage (V)">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item name="chargeCycle" label="Charge Cycles">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </>
          ) : null}
        </Form>
      </Modal>
    </div>
  );
}