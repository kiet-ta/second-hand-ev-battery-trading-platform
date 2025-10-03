import React, {useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { PlusCircle } from "lucide-react";
import {
  Button,
  Cascader,
  Checkbox,
  ColorPicker,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Radio,
  Rate,
  Select,
  Slider,
  Switch,
  TreeSelect,
  Upload,
} from 'antd';
import AddressDropDown from './AddressDropDown';
import evData from '../assets/datas/evData';
const { RangePicker } = DatePicker;
const { TextArea } = Input;
const bodyStyles = [
  "Sedan",
  "Hatchback",
  "SUV",
  "Crossover",
  "Coupe",
  "Convertible",
  "Pickup",
  "Van / Minivan",
  "Wagon",
  "Other",
];
const colors = [
  "White",
  "Black",
  "Silver",
  "Gray",
  "Blue",
  "Red",
  "Green",
  "Yellow",
  "Orange",
  "Brown",
  "Beige",
  "Gold",
  "Purple",
  "Other",
];
const batteryBrands = [
  "Panasonic",
  "Samsung SDI",
  "LG Chem",
  "CATL",
  "BYD",
  "Tesla",
  "Hitachi",
  "Toshiba",
  "A123 Systems",
  "SK Innovation",
  "Other"
];
export default function FormComponent() {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [itemType, setItemType] = useState();
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [version, setVersion] = useState("");

  const brands = Object.keys(evData);
  const models = brand ? Object.keys(evData[brand]) : [];
  const versions = brand && model ? evData[brand][model] : [];

  const showModal = () => {
    setIsOpenModal(true)
  }
  const handleAddCancel = () => {
    setIsOpenModal(false);
  };
  const handleAddOk = () => {
    console.log("ok");
  }
  return (
    <div>
      <button className="flex items-center bg-maincolor text-white px-4 py-2 rounded shadow" onClick={showModal}>
        <PlusCircle className="w-5 h-5 mr-2" />
        Add New Product
      </button>
      <Modal
        open={isOpenModal}
        onOk={handleAddOk}
        onCancel={handleAddCancel}
      >
        <Form
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          layout="horizontal"
          style={{ maxWidth: 600 }}
        >
          <Form.Item name="Title" label="Title" rules={[{ required: true }]}>
            <Input rules={[{ required: true }]} />
          </Form.Item>
          <Form.Item label="Description" >
            <TextArea placeholder='' />
          </Form.Item>
          <Form.Item name="Price" label="Price" rules={[{ required: true, message: "Please enter a price" }]} >
            <InputNumber
              style={{ width: "100%" }}
              min={0}
              formatter={(value) =>
                `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
            />          </Form.Item>

          <Form.Item name="Item type" label="Item type" rules={[{ required: true }]}>
            <Radio.Group value={itemType} onChange={(e) => setItemType(e.target.value)} options={[
              { value: 1, label: 'Electric Vehicle' },
              { value: 2, label: 'Battery' }
            ]} />
          </Form.Item>
          {itemType && itemType == 1 ? (
            <>
              <Form.Item name="brand" label="Brand" rules={[{ required: true }]}>
                <Select
                  placeholder="Select Brand"
                  value={brand || undefined}
                  onChange={(value) => {
                    setBrand(value);
                    setModel("");
                    setVersion("");
                  }}
                >
                  {brands.map((b) => (
                    <Option key={b} value={b}>
                      {b}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              {brand && (
                <Form.Item name="model" label="Model" rules={[{ required: true }]}>
                  <Select
                    placeholder="Select Model"
                    value={model || undefined}
                    onChange={(value) => {
                      setModel(value);
                      setVersion("");
                    }}
                  >
                    {models.map((m) => (
                      <Option key={m} value={m}>
                        {m}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              )}
              {model && (
                <Form.Item name="version" label="Version" rules={[{ required: true }]}>
                  <Select
                    placeholder="Select Version"
                    value={version || undefined}
                    onChange={(value) => setVersion(value)}
                  >
                    {versions.map((v) => (
                      <Option key={v} value={v}>
                        {v}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              )}
              <Form.Item
                name="year"
                label="Year"
                rules={[
                  { required: true, message: "Please enter the year" },
                  {
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();
                      const year = Number(value);
                      const currentYear = new Date().getFullYear();
                      if (isNaN(year) || year < 2008 || year > currentYear) {
                        return Promise.reject(
                          new Error(`Year must be between 2008 and ${currentYear}`)
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}

              >
                <Select placeholder="Select Year">
                  {Array.from(
                    { length: new Date().getFullYear() - 2008 + 1 },
                    (_, i) => 2008 + i
                  )
                    .reverse()
                    .map((y) => (
                      <Select.Option key={y} value={y}>
                        {y}
                      </Select.Option>
                    ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="body_style"
                label="Body Style"
                rules={[{ required: true, message: "Please select a body style" }]}
              >
                <Select placeholder="Select Body Style">
                  {bodyStyles.map((style) => (
                    <Option key={style} value={style}>
                      {style}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              {/* Color */}
              <Form.Item
                name="color"
                label="Color"
                rules={[{ required: true, message: "Please select a color" }]}
              >
                <Select placeholder="Select Color">
                  {colors.map((c) => (
                    <Option key={c} value={c}>
                      {c}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item label="License Plate">
                <Input className="p-10"></Input>
              </Form.Item>
              <Form.Item label="Previous Owner">
                <Input />
              </Form.Item>
              <Form.Item label="Mileage">
                <InputNumber />
              </Form.Item>
              <Checkbox>Has Accesorry</Checkbox>
              <Checkbox>Is Registration</Checkbox>

            </>
          ) : itemType == 2 ?(
            <>
              <Form.Item
                name="battery_brand"
                label="Battery Brand"
                rules={[{ required: true, message: "Please select a battery brand" }]}
              >
                <Select placeholder="Select a battery brand">
                  {batteryBrands.map((brand) => (
                    <Option key={brand} value={brand}>
                      {brand}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item label="Capacity">
                <InputNumber />
              </Form.Item>
              <Form.Item label="Voltage">
                <InputNumber />
              </Form.Item>
              <Form.Item label="Charge Cycle">
                <InputNumber />
              </Form.Item>
            </>
          ) : (
            <div></div>
          )}
        </Form>

      </Modal>
    </div>


  )
}
