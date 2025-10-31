// ProductCreationModal.jsx
import React, { useState, useEffect } from "react";
import { Modal, Steps, Spin, Form, Button, message } from "antd";
import Step1ItemDetails from "./Step1ItemDetail";
import Step2AuctionDetails from "./Step2AuctionDetail";
import Step3ImageUploader from "./Step3ImageUploader";
import Step4Complete from "./Step4Complete";
import itemApi from "../../api/itemApi";
import auctionApi from "../../api/auctionApi";
import uploadImageApi from "../../api/uploadImageApi";
import walletApi from "../../api/walletApi";
import evData from "../../assets/datas/evData";

export default function ProductCreationModal({ onSuccess }) {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [newItem, setNewItem] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [createAuction, setCreateAuction] = useState(false);
  const [wallet, setWallet] = useState(null);
  const [form] = Form.useForm();

  const userID = parseInt(localStorage.getItem("userId"));

  const showModal = () => setIsOpenModal(true);
  const nextStep = () => setCurrentStep((prev) => prev + 1);
  const prevStep = () => setCurrentStep((prev) => prev - 1);
  const handleFilesSelected = (files) => setSelectedFiles(files);

  // === Step 1: Create Item ===
  const handleStep1Finish = async (values) => {
    setIsLoading(true);
    try {
      setCreateAuction(values.createAuction || false);

      const basePayload = {
        categoryId: values.categoryId,
        title: values.title,
        description: values.description || "",
        price: values.price,
        quantity: values.quantity || 1,
        status: "pending_pay",
        updatedBy: userID,
      };

      let createdItem;

      if (values.categoryId === 1) {
        // EV payload
        const evPayload = {
          ...basePayload,
          licenseUrl: values.licenseUrl || "",
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
          mileage: values.mileage,
        };
        createdItem = await itemApi.postItemEV(evPayload);
      } else {
        const batteryPayload = {
          ...basePayload,
          brand: values.brand,
          capacity: values.capacity,
          voltage: values.voltage,
          chargeCycles: values.chargeCycle,
        };
        createdItem = await itemApi.postItemBattery(batteryPayload);
      }

      setNewItem(createdItem);
      message.success("Sản phẩm đã được tạo thành công!");

      if (values.createAuction) nextStep(); // show auction step only if selected
      else setCurrentStep(2); // skip auction
    } catch (error) {
      console.error(error);
      message.error("Tạo sản phẩm thất bại!");
    } finally {
      setIsLoading(false);
    }
  };

  // === Step 2: Auction ===
  const handleStep2Finish = async (values) => {
    setIsLoading(true);
    try {
      await auctionApi.postAuction({
        itemId: newItem.itemId,
        startingPrice: values.startingPrice,
        startTime: values.auctionTime[0].toISOString(),
        endTime: values.auctionTime[1].toISOString(),
      });
      message.success("Chi tiết đấu giá đã lưu!");
      setCurrentStep(2);
    } catch (error) {
      console.error(error);
      message.error("Lưu đấu giá thất bại!");
    } finally {
      setIsLoading(false);
    }
  };

  // === Step 3: Image Upload ===
  const handleStep3Upload = async () => {
    if (!selectedFiles.length) return;
    setIsLoading(true);
    try {
      if (!newItem || !newItem.itemId) {
        message.error("Không tìm thấy Item ID!");
        return;
      }

      await uploadImageApi.uploadItemImage(newItem.itemId, selectedFiles);
      message.success("Hình ảnh đã được tải lên!");

      // Fetch wallet immediately for Step 4
      const walletData = await walletApi.getWalletByUser(userID);
      setWallet(walletData);

      nextStep();
    } catch (error) {
      console.error(error);
      message.error("Tải hình thất bại!");
    } finally {
      setIsLoading(false);
    }
  };

  // === Step 4: Deposit Wallet ===
const handleDeposit = async () => {
  if (!wallet || wallet.balance < 100000) return;
  setIsLoading(true);
  try {
    await walletApi.depositWallet({ userId: userID, amount: 100000 });
    message.success("Thanh toán phí ₫100,000 thành công! Sản phẩm đã hoạt động.");

    // Update wallet locally
    setWallet((prev) => ({ ...prev, balance: prev.balance - 100000 }));

    // Prepare full payload without licenseUrl
    const updatePayload = {
      itemId: newItem.itemId,
      itemType: newItem.itemType || "ev", // or "Battery"
      categoryId: newItem.categoryId,
      title: newItem.title || "Chưa đặt tên",
      description: newItem.description || "",
      price: newItem.price || 0,
      quantity: newItem.quantity || 1,
      updatedBy: userID,
      itemDetail: newItem.itemDetail || JSON.stringify({}),
      status: "active",
      images: newItem.images || [],
      sellerName: newItem.sellerName || "",
      moderation: "pending",
      createdAt: newItem.createdAt,
      updatedAt: new Date().toISOString(),
    };

    await itemApi.putItem(newItem.itemId, updatePayload);

    if (onSuccess) onSuccess();
  } catch (error) {
    console.error(error);
    message.error("Thanh toán thất bại!");
  } finally {
    setIsLoading(false);
  }
};


  const steps = [
    { title: "Thông tin sản phẩm" },
    { title: "Đấu giá (tùy chọn)" },
    { title: "Tải hình ảnh" },
    { title: "Hoàn tất" },
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <Step1ItemDetails form={form} onFinish={handleStep1Finish} evData={evData}/>;
      case 1:
        return <Step2AuctionDetails form={form} onFinish={handleStep2Finish} />;
      case 2:
        return <Step3ImageUploader onFilesSelected={handleFilesSelected} />;
      case 3:
        return (
          <Step4Complete
            walletInfo={wallet}
            onDeposit={handleDeposit}
            onReset={() => {
              setCurrentStep(0);
              setNewItem(null);
              setSelectedFiles([]);
              setWallet(null);
              form.resetFields();
            }}
          />
        );
      default:
        return <div>Something went wrong</div>;
    }
  };

  const renderFooter = () => {
    if (currentStep === 3) return null;

    if (currentStep === 2) {
      return (
        <div className="flex justify-between items-center">
          <Button onClick={prevStep}>Quay lại</Button>
          <div className="flex gap-2">
            <Button onClick={nextStep}>Bỏ qua</Button>
            {selectedFiles.length > 0 && (
              <Button type="primary" onClick={handleStep3Upload}>
                Tải lên & Tiếp
              </Button>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="flex justify-between items-center">
        {currentStep > 0 && <Button onClick={prevStep}>Quay lại</Button>}
        <Button type="primary" onClick={() => form.submit()}>
          Tiếp
        </Button>
      </div>
    );
  };

  return (
    <>
      <button
        onClick={showModal}
        className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
      >
        Thêm sản phẩm mới
      </button>
      <Modal
        title="Tạo sản phẩm mới"
        open={isOpenModal}
        onCancel={() => setIsOpenModal(false)}
        width={800}
        footer={renderFooter()}
      >
        <Spin spinning={isLoading}>
          <Steps current={currentStep} items={steps} className="mb-8" />
          <div className="min-h-[300px]">{renderStepContent()}</div>
        </Spin>
      </Modal>
    </>
  );
}
