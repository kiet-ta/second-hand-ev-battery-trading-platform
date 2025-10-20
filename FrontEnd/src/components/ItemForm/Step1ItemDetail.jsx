import React from 'react';
import { Form, Input, InputNumber, Radio, Select, Checkbox } from 'antd';

const { TextArea } = Input;
const { Option } = Select;

// Constants for dropdowns
const bodyStyles = ["Sedan", "Hatchback", "SUV", "Crossover", "Coupe", "Convertible", "Pickup", "Van / Minivan", "Wagon", "Other"];
const colors = ["White", "Black", "Silver", "Gray", "Blue", "Red", "Green", "Yellow", "Orange", "Brown", "Beige", "Gold", "Purple", "Other"];
const batteryBrands = ["Panasonic", "Samsung SDI", "LG Chem", "CATL", "BYD", "Tesla", "Hitachi", "Toshiba", "A123 Systems", "SK Innovation", "Other"];


export default function Step1ItemDetails({ form, onFinish, evData }) {
    const categoryId = Form.useWatch('categoryId', form);
    const brand = Form.useWatch('brand', form);
    const model = Form.useWatch('model', form);

    const brands = Object.keys(evData || {});
    const models = brand ? Object.keys(evData[brand] || {}) : [];
    const versions = brand && model ? evData[brand][model] || [] : [];

    return (
        <Form form={form} name="step1" onFinish={onFinish} layout="vertical" initialValues={{ createAuction: false, hasAccessories: false, isRegistrationValid: false }}>
            <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Please enter a title for your product.' }]}>
                <Input placeholder="e.g., VinFast VF 8 Eco 2024" />
            </Form.Item>

            <Form.Item name="description" label="Description">
                <TextArea rows={3} placeholder="Provide a detailed description of your item." />
            </Form.Item>

            <Form.Item name="price" label="Listing Price (VND)" rules={[{ required: true, message: 'Please enter a price.' }]}>
                <InputNumber style={{ width: "100%" }} min={0} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={value => value.replace(/\D/g, '')} />
            </Form.Item>

            <Form.Item name="categoryId" label="Item type" rules={[{ required: true, message: 'Please select an item type.' }]}>
                <Radio.Group options={[{ value: 1, label: 'Electric Vehicle' }, { value: 2, label: 'Battery' }]} />
            </Form.Item>

            {/* Conditional Fields for Electric Vehicle */}
            {categoryId === 1 && (
                <>
                    <Form.Item name="brand" label="Brand" rules={[{ required: true }]}>
                        <Select placeholder="Select Brand" onChange={() => form.setFieldsValue({ model: undefined, version: undefined })}>
                            {brands.map((b) => (<Option key={b} value={b}>{b}</Option>))}
                        </Select>
                    </Form.Item>
                    {brand && (
                        <Form.Item name="model" label="Model" rules={[{ required: true }]}>
                            <Select placeholder="Select Model" onChange={() => form.setFieldsValue({ version: undefined })}>
                                {models.map((m) => (<Option key={m} value={m}>{m}</Option>))}
                            </Select>
                        </Form.Item>
                    )}
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
                    <Form.Item name="mileage" label="Mileage (km)">
                        <InputNumber min={0} style={{ width: "100%" }} />
                    </Form.Item>
                    <Form.Item name="previousOwners" label="Previous Owners">
                        <InputNumber min={0} style={{ width: "100%" }} />
                    </Form.Item>
                    <Form.Item name="licensePlate" label="License Plate">
                        <Input />
                    </Form.Item>
                    <Form.Item name="hasAccessories" valuePropName="checked">
                        <Checkbox>Has Accessories</Checkbox>
                    </Form.Item>
                    <Form.Item name="isRegistrationValid" valuePropName="checked">
                        <Checkbox>Is Registration Valid</Checkbox>
                    </Form.Item>
                </>
            )}

            {/* Conditional Fields for Battery */}
            {categoryId === 2 && (
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
            )}
            
            <Form.Item name="createAuction" valuePropName="checked">
                <Checkbox>Create an auction for this item?</Checkbox>
            </Form.Item>
        </Form>
    );
}

