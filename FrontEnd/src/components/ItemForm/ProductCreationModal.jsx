// ProductCreationModal.jsx (optimized & popup-free)
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Modal, Steps, Spin, Form, Button } from "antd";
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
  const userID = useMemo(() => parseInt(localStorage.getItem("userId")), []);

  // === Step navigation ===
  const nextStep = useCallback(() => setCurrentStep((s) => s + 1), []);
  const prevStep = useCallback(() => setCurrentStep((s) => s - 1), []);
  const handleFilesSelected = useCallback((files) => setSelectedFiles(files), []);

  const resetState = useCallback(() => {
    setCurrentStep(0);
    setNewItem(null);
    setSelectedFiles([]);
    setWallet(null);
    form.resetFields();
  }, [form]);

  // === Step 1: Create Item ===
  const handleStep1Finish = useCallback(async (values) => {
    setIsLoading(true);
    try {
      if (!values.title || !values.price || !values.categoryId) {
        console.warn("Thiếu thông tin sản phẩm bắt buộc.");
        return;
      }

      setCreateAuction(!!values.createAuction);

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

      if (!createdItem) {
        console.error("Không thể tạo sản phẩm — phản hồi trống.");
        return;
      }

      setNewItem(createdItem);
      if (values.createAuction) nextStep();
      else setCurrentStep(2);
    } catch (err) {
      console.error("❌ Lỗi khi tạo sản phẩm:", err);
    } finally {
      setIsLoading(false);
    }
  }, [userID, nextStep]);

  // === Step 2: Auction ===
  const handleStep2Finish = useCallback(async (values) => {
    setIsLoading(true);
    try {
      if (!newItem?.itemId) return console.error("Không tìm thấy Item ID.");
      if (!values.auctionTime?.length) return console.warn("Chưa chọn thời gian đấu giá.");

      await auctionApi.postAuction({
        itemId: newItem.itemId,
        startingPrice: values.startingPrice,
        startTime: values.auctionTime[0].toISOString(),
        endTime: values.auctionTime[1].toISOString(),
      });
      setCurrentStep(2);
    } catch (err) {
      console.error("❌ Lỗi khi lưu đấu giá:", err);
    } finally {
      setIsLoading(false);
    }
  }, [newItem]);

  // === Step 3: Upload Images ===
  const handleStep3Upload = useCallback(async () => {
    if (!selectedFiles.length) {
      console.warn("⚠️ Chưa chọn hình ảnh nào.");
      return;
    }

    if (!newItem?.itemId) {
      console.error("Không tìm thấy Item ID để tải hình.");
      return;
    }

    setIsLoading(true);
    try {
      await uploadImageApi.uploadItemImage(newItem.itemId, selectedFiles);
      const walletData = await walletApi.getWalletByUser(userID);
      setWallet(walletData);
      nextStep();
    } catch (err) {
      console.error("❌ Lỗi khi tải hình:", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedFiles, newItem, nextStep, userID]);

  // === Step 4: Deposit ===
  const handleDeposit = useCallback(async () => {
    if (!wallet || wallet.balance < 100000) {
      console.warn("⚠️ Số dư ví không đủ hoặc ví chưa sẵn sàng.");
      return;
    }

    setIsLoading(true);
    try {
      await walletApi.depositWallet({ userId: userID, amount: 100000 });

      setWallet((prev) => ({ ...prev, balance: prev.balance - 100000 }));

      const updatePayload = {
        ...newItem,
        updatedBy: userID,
        status: "active",
        moderation: "pending",
        updatedAt: new Date().toISOString(),
      };

      await itemApi.putItem(newItem.itemId, updatePayload);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("❌ Thanh toán thất bại:", err);
    } finally {
      setIsLoading(false);
    }
  }, [wallet, userID, newItem, onSuccess]);

  // === UI ===
  const steps = useMemo(
    () => [
      { title: "Thông tin sản phẩm" },
      { title: "Đấu giá (tùy chọn)" },
      { title: "Tải hình ảnh" },
      { title: "Hoàn tất" },
    ],
    []
  );

  const renderStepContent = useCallback(() => {
    switch (currentStep) {
      case 0:
        return <Step1ItemDetails form={form} onFinish={handleStep1Finish} evData={evData} />;
      case 1:
        return <Step2AuctionDetails form={form} onFinish={handleStep2Finish} />;
      case 2:
        return <Step3ImageUploader onFilesSelected={handleFilesSelected} />;
      case 3:
        return <Step4Complete walletInfo={wallet} onDeposit={handleDeposit} onReset={resetState} />;
      default:
        return <div>Không xác định được bước hiện tại.</div>;
    }
  }, [currentStep, form, wallet, handleStep1Finish, handleStep2Finish, handleStep3Upload, handleDeposit]);

  const renderFooter = useCallback(() => {
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
  }, [currentStep, prevStep, nextStep, selectedFiles, handleStep3Upload, form]);

  return (
    <>
      <button
        onClick={() => setIsOpenModal(true)}
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
