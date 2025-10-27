import React, { useState } from 'react';
import { Modal, Steps, Spin, Form, message, Button } from 'antd';
import { PlusCircle } from 'lucide-react';
import itemApi from '../../api/itemApi';
import auctionApi from '../../api/auctionApi';
import uploadImageApi from '../../api/uploadImageApi';
import evData from '../../assets/datas/evData';

// Import step components
import Step1ItemDetails from './Step1ItemDetail';
import Step2AuctionDetails from './Step2AuctionDetail';
import Step3ImageUploader from './Step3ImageUploader';
import Step4Complete from './Step4Complete';

const userID = localStorage.getItem("userId");

export default function ProductCreationModal({ onSuccess }) {
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [newItem, setNewItem] = useState(null);
    const [form] = Form.useForm();

    const createAuction = Form.useWatch('createAuction', form);

    const showModal = () => setIsOpenModal(true);

    const handleReset = () => {
        form.resetFields();
        setNewItem(null);
        setCurrentStep(0);
    };

    const handleCancel = () => {
        setIsOpenModal(false);
        handleReset();
    };

    const handleDone = () => {
        setIsOpenModal(false);
        handleReset();
        if (onSuccess) onSuccess(); // only after completion
    };

    const nextStep = () => {
        if (currentStep === 0 && !createAuction) setCurrentStep(2); // skip auction
        else setCurrentStep(prev => prev + 1);
    };

    const prevStep = () => {
        if (currentStep === 2 && !createAuction) setCurrentStep(0);
        else setCurrentStep(prev => prev - 1);
    };

    const handleStep1Finish = async (values) => {
        setIsLoading(true);
        const apiPayload = {
            categoryId: values.categoryId,
            title: values.title,
            description: values.description || "",
            price: values.price,
            quantity: 1,
            status: "active",
            updatedBy: userID,
        };

        if (values.categoryId === 1) {
            Object.assign(apiPayload, {
                brand: values.brand,
                model: values.model,
                version: values.version,
                year: values.year,
                bodyStyle: values.bodyStyle,
                color: values.color,
                licensePlate: values.licensePlate,
                hasAccessories: values.hasAccessories,
                previousOwners: values.previousOwners,
                isRegistrationValid: values.isRegistrationValid,
                mileage: values.miledeage,
            });
        } else {
            Object.assign(apiPayload, {
                quantity: values.quantity || 1,
                brand: values.battery_brand,
                capacity: values.capacity,
                voltage: values.voltage,
                chargeCycles: values.chargeCycle,
            });
        }

        try {
            const createdItem = values.categoryId === 1
                ? await itemApi.postItemEV(apiPayload)
                : await itemApi.postItemBattery(apiPayload);

            message.success("Item details saved successfully!");
            setNewItem(createdItem);
            nextStep();
        } catch (error) {
            console.error("Error creating item:", error);
            message.error("Failed to save item details.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleStep2Finish = async (values) => {
        setIsLoading(true);
        try {
            await auctionApi.postAuction({
                itemId: newItem.itemId,
                startingPrice: values.startingPrice,
                startTime: values.auctionTime[0].toISOString(),
                endTime: values.auctionTime[1].toISOString(),
            });
            message.success("Auction details saved!");
            nextStep();
        } catch (error) {
            console.error("Error creating auction:", error);
            message.error("Failed to save auction details.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageUpload = async (files) => {
        if (!files || files.length === 0) {
            message.info("No images selected. Skipping upload.");
            nextStep();
            return;
        }
        setIsLoading(true);
        try {
            await uploadImageApi.uploadItemImage(newItem.itemId, files);
            message.success("Images uploaded successfully!");
            nextStep();
        } catch (error) {
            console.error("Error uploading images:", error);
            message.error("Failed to upload images.");
        } finally {
            setIsLoading(false);
        }
    };

    const steps = [
        { title: 'Item Details' },
        { title: 'Auction (Optional)' },
        { title: 'Upload Images' },
        { title: 'Complete' },
    ];

    const renderStepContent = (step) => {
        switch (step) {
            case 0:
                return <Step1ItemDetails form={form} onFinish={handleStep1Finish} evData={evData} />;
            case 1:
                return <Step2AuctionDetails form={form} onFinish={handleStep2Finish} />;
            case 2:
                return <Step3ImageUploader onSubmit={handleImageUpload} />;
            case 3:
                return <Step4Complete onReset={handleReset} onDone={handleDone} />;
            default:
                return <div>Something went wrong.</div>;
        }
    };

    const renderFooter = () => (
        <div className="flex justify-between items-center">
            <div>
                {currentStep > 0 && currentStep < 3 && (
                    <Button onClick={prevStep}>Back</Button>
                )}
            </div>
            <div>
                {currentStep < 2 && (
                    <Button type="primary" onClick={() => form.submit()}>Next</Button>
                )}
                {currentStep === 2 && (
                    <Button type="primary" onClick={() => handleImageUpload([])}>Skip & Finish</Button>
                )}
                {currentStep === 3 && (
                    <Button type="primary" onClick={handleDone}>Done</Button>
                )}
            </div>
        </div>
    );

    return (
        <>
            <button
                onClick={showModal}
                disabled={isOpenModal}
                className={`flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition-colors ${isOpenModal ? "opacity-50 cursor-not-allowed" : ""}`}
            >
                <PlusCircle className="w-5 h-5 mr-2" />
                Add New Product
            </button>
            <Modal
                title="Create New Product Listing"
                open={isOpenModal}
                onCancel={handleCancel}
                width={800}
                footer={renderFooter()}
            >
                <Spin spinning={isLoading}>
                    <Steps current={currentStep} items={steps} className="mb-8" />
                    <div className="steps-content-container min-h-[300px]">
                        {renderStepContent(currentStep)}
                    </div>
                </Spin>
            </Modal>
        </>
    );
}
