import React, { useState, useEffect } from 'react';
import { PlusCircle, UploadCloud } from "lucide-react";
import {
    Table, Tag, Image,
    Checkbox, Form, Input, InputNumber, Modal, Radio, Select, Steps, message, DatePicker, Upload, Result, Spin
} from 'antd';
import evData from '../assets/datas/evData';
import itemApi from '../api/itemApi';
import auctionApi from '../api/auctionApi';

// --- Helper Constants ---
const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const userID = localStorage.getItem("userId");

const bodyStyles = ["Sedan", "Hatchback", "SUV", "Crossover", "Coupe", "Convertible", "Pickup", "Van / Minivan", "Wagon", "Other"];
const colors = ["White", "Black", "Silver", "Gray", "Blue", "Red", "Green", "Yellow", "Orange", "Brown", "Beige", "Gold", "Purple", "Other"];
const batteryBrands = ["Panasonic", "Samsung SDI", "LG Chem", "CATL", "BYD", "Tesla", "Hitachi", "Toshiba", "A123 Systems", "SK Innovation", "Other"];

// --- Main Page Component ---
export default function MyProductsPage() {
    const [myItems, setMyItems] = useState([]);
    const [isListLoading, setIsListLoading] = useState(true);

    const fetchMyItems = async () => {
        setIsListLoading(true);
        try {
            const items = await itemApi.getItemsBySeller(userID);
            setMyItems(items || []);
        } catch (error) {
            console.error("Failed to fetch my items:", error);
            message.error("Could not load your products.");
        } finally {
            setIsListLoading(false);
        }
    };

    useEffect(() => {
        fetchMyItems();
    }, []);

    const columns = [
        {
            title: 'Image',
            dataIndex: 'imageUrl',
            key: 'imageUrl',
            render: (imageUrl, record) => (
                <Image
                    width={80}
                    height={80}
                    style={{ objectFit: 'cover' }}
                    src={imageUrl || "https://placehold.co/400x400/e2e8f0/e2e8f0?text=."}
                    alt={record.title}
                    preview={!!imageUrl}
                />
            ),
        },
        {
            title: 'Product Title',
            dataIndex: 'title',
            key: 'title',
            render: (text, record) => (
                <div>
                    <a className="font-semibold text-blue-600 hover:underline">{text}</a>
                    <p className="text-xs text-gray-500">{record.itemType === 'ev' ? 'Electric Vehicle' : 'Battery'}</p>
                </div>
            )
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            render: (price) => `${price.toLocaleString('vi-VN')} VND`,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let color = 'geekblue';
                if (status === 'active') color = 'green';
                if (status === 'inactive' || status === 'sold') color = 'volcano';
                return (
                    <Tag color={color} key={status}>
                        {status.toUpperCase()}
                    </Tag>
                );
            },
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <a onClick={() => message.info(`Editing item: ${record.title}`)}>Edit</a>
            ),
        },
    ];

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">My Products</h1>
                    <ProductCreationModal onSuccess={fetchMyItems} />
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <Table
                        columns={columns}
                        dataSource={myItems}
                        loading={isListLoading}
                        rowKey="itemId"
                        pagination={{ pageSize: 10 }}
                    />
                </div>
            </div>
        </div>
    );
}

// --- Modal and Form Logic Component ---
function ProductCreationModal({ onSuccess }) {
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [newItem, setNewItem] = useState(null);
    const [form] = Form.useForm();

    const categoryId = Form.useWatch('categoryId', form);
    const brand = Form.useWatch('brand', form);
    const model = Form.useWatch('model', form);
    const createAuction = Form.useWatch('createAuction', form);

    const brands = Object.keys(evData);
    const models = brand ? Object.keys(evData[brand]) : [];
    const versions = brand && model ? evData[brand][model] : [];

    const showModal = () => setIsOpenModal(true);

    const handleReset = () => {
        form.resetFields();
        setNewItem(null);
        setCurrentStep(0);
    };

    const handleCancel = () => {
        handleReset();
        setIsOpenModal(false);
        if (onSuccess) {
            onSuccess();
        }
    };

    const nextStep = () => setCurrentStep(prev => prev + 1);
    const prevStep = () => setCurrentStep(prev => prev - 1);

    const handleStep1Finish = async (values) => {
        setIsLoading(true);
        const apiPayload = {
            categoryId: values.categoryId,
            title: values.title,
            description: values.description || "",
            price: values.price,
            quantity: values.quantity || 1,
            status: "active",
            updatedBy: userID,
        };

        if (values.categoryId === 1) {
            Object.assign(apiPayload, {
                brand: values.brand, model: values.model, version: values.version, year: values.year, bodyStyle: values.bodyStyle, color: values.color, licensePlate: values.licensePlate, hasAccessories: values.hasAccessories, previousOwners: values.previousOwners, isRegistrationValid: values.isRegistrationValid, mileage: values.mileage,
            });
        } else {
            Object.assign(apiPayload, {
                brand: values.battery_brand, capacity: values.capacity, voltage: values.voltage, chargeCycles: values.chargeCycle,
            });
        }

        try {
            const createdItem = values.categoryId === 1
                ? await itemApi.postItemEV(apiPayload)
                : await itemApi.postItemBattery(apiPayload);
            
            message.success("Item created successfully!");
            setNewItem(createdItem);
            
            values.createAuction ? nextStep() : setCurrentStep(2);
        } catch (error) {
            console.error("Error creating item", error);
            message.error("Failed to create item. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleStep2Finish = async (values) => {
        setIsLoading(true);
        const auctionPayload = {
            itemId: newItem.itemId,
            startingPrice: values.startingPrice,
            startTime: values.auctionTime[0].toISOString(),
            endTime: values.auctionTime[1].toISOString(),
        };

        try {
            await auctionApi.postAuction(auctionPayload);
            message.success("Auction details saved!");
            nextStep();
        } catch (error) {
            console.error("Error creating auction", error);
            message.error("Failed to save auction details.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleImageUpload = async (imageUrls) => {
        if (!imageUrls || imageUrls.length === 0) {
            message.info("No images uploaded. Skipping.");
            nextStep();
            return;
        }

        setIsLoading(true);
        try {
            await itemApi.updateItemImage(newItem.itemId, { imageUrl: imageUrls[0] });
            message.success("Image linked successfully!");
            nextStep();
        } catch (error) {
            console.error("Error linking image", error);
            message.error("Failed to link image to the item.");
        } finally {
            setIsLoading(false);
        }
    };

    const steps = [
        { title: 'Item Details' },
        { title: 'Auction (Optional)' },
        { title: 'Images' },
        { title: 'Complete' },
    ];

    const renderStepContent = (step) => {
        switch (step) {
            case 0: return <Step1ItemDetails form={form} onFinish={handleStep1Finish} categoryId={categoryId} brand={brand} model={model} brands={brands} models={models} versions={versions} />;
            case 1: return <Step2AuctionDetails form={form} onFinish={handleStep2Finish} />;
            case 2: return <Step3ImageUpload onSubmit={handleImageUpload} />;
            case 3: return <Step4Complete onReset={handleReset} onDone={handleCancel} />;
            default: return <div>Something went wrong</div>;
        }
    };

    const renderFooter = () => (
        <div className="flex justify-between">
            <div>
                {currentStep > 0 && currentStep < 3 && (
                    <button className="px-4 py-2 rounded border" onClick={prevStep}>Back</button>
                )}
            </div>
            <div>
                {currentStep < 2 && (
                    <button className="px-4 py-2 rounded bg-blue-500 text-white" onClick={() => form.submit()}>
                        {currentStep === 0 && createAuction === false ? 'Next to Images' : 'Next'}
                    </button>
                )}
                 {currentStep === 3 && (
                    <button className="px-4 py-2 rounded bg-blue-500 text-white" onClick={handleCancel}>Done</button>
                )}
            </div>
        </div>
    );

    return (
        <div>
            <button className="flex items-center bg-blue-500 text-white px-4 py-2 rounded shadow" onClick={showModal}>
                <PlusCircle className="w-5 h-5 mr-2" />
                Add New Product
            </button>
            <Modal
                title="Create New Product Listing"
                open={isOpenModal}
                onCancel={handleCancel}
                width={800}
                footer={renderFooter()}
                destroyOnClose
            >
                <Spin spinning={isLoading}>
                    <Steps current={currentStep} items={steps} className="mb-8" />
                    <div className="steps-content">
                        {renderStepContent(currentStep)}
                    </div>
                </Spin>
            </Modal>
        </div>
    );
}

// --- Individual Step Components ---
const Step1ItemDetails = ({ form, onFinish, categoryId, brand, model, brands, models, versions }) => (
    <Form form={form} name="step1" onFinish={onFinish} layout="vertical" initialValues={{ hasAccessories: false, isRegistrationValid: false, createAuction: false }}>
        <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input />
        </Form.Item>
        <Form.Item name="description" label="Description">
            <TextArea rows={2} />
        </Form.Item>
        <Form.Item name="price" label="Listing Price (VND)" rules={[{ required: true }]}>
            <InputNumber style={{ width: "100%" }} min={0} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={value => value.replace(/\D/g, '')} />
        </Form.Item>
        <Form.Item name="categoryId" label="Item type" rules={[{ required: true }]}>
            <Radio.Group options={[{ value: 1, label: 'Electric Vehicle' }, { value: 2, label: 'Battery' }]} />
        </Form.Item>
        {categoryId === 1 ? (
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
        <Form.Item name="createAuction" valuePropName="checked">
            <Checkbox>Create an auction for this item?</Checkbox>
        </Form.Item>
    </Form>
);

const Step2AuctionDetails = ({ form, onFinish }) => (
    <Form form={form} name="step2" onFinish={onFinish} layout="vertical">
        <Form.Item name="startingPrice" label="Starting Price (VND)" rules={[{ required: true }]}>
            <InputNumber style={{ width: "100%" }} min={0} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={value => value.replace(/\D/g, '')} />
        </Form.Item>
        <Form.Item name="auctionTime" label="Auction Start & End Time" rules={[{ required: true }]}>
            <RangePicker showTime={{ format: 'HH:mm' }} format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} />
        </Form.Item>
    </Form>
);

const Step3ImageUpload = ({ onSubmit }) => {
    const [fileList, setFileList] = useState([]);
    
    const handleChange = ({ fileList: newFileList }) => {
        setFileList(newFileList);
    };

    const handleUploadAndSubmit = () => {
        // This is a simulation. In a real app, you would have an upload function
        // that returns the URL from your service (like Cloudinary).
        const uploadedUrls = fileList.map(file => `https://res.cloudinary.com/demo/image/upload/v1620000000/${file.uid}.jpg`);
        onSubmit(uploadedUrls);
    };

    return (
        <div>
            <Upload.Dragger 
                name="file"
                multiple
                listType="picture"
                fileList={fileList}
                onChange={handleChange}
                beforeUpload={() => false}
            >
                <p className="ant-upload-drag-icon"><UploadCloud size={48} className="mx-auto text-gray-400" /></p>
                <p className="ant-upload-text">Click or drag files to this area to upload</p>
                <p className="ant-upload-hint">Support for a single or bulk upload.</p>
            </Upload.Dragger>
            <div className="text-right mt-4">
                <button onClick={handleUploadAndSubmit} className="px-4 py-2 rounded bg-blue-500 text-white">
                    Confirm and Finish
                </button>
            </div>
        </div>
    );
};

const Step4Complete = ({ onReset, onDone }) => (
    <Result
        status="success"
        title="Successfully Created Product Listing!"
        subTitle="Your new product is now live. You can view it in your dashboard or create another one."
        extra={[
            <button key="create" className="px-4 py-2 rounded bg-blue-500 text-white" onClick={onReset}>
                Create Another Product
            </button>,
            <button key="done" className="px-4 py-2 rounded border" onClick={onDone}>
                Done
            </button>,
        ]}
    />
);