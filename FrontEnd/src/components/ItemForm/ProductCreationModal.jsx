import React, { useState, useCallback, useMemo } from "react";
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
import { uploadToCloudinary } from "../../utils/uploadToCloudinary"

export default function ProductCreationModal({ onSuccess }) {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [draftData, setDraftData] = useState({ itemInfo: null, auctionInfo: null, images: [] });
  const [wallet, setWallet] = useState(null);
  const [createdItem, setCreatedItem] = useState(null);
  const [form] = Form.useForm();
  const userID = useMemo(() => parseInt(localStorage.getItem("userId")), []);

  const nextStep = useCallback(() => setCurrentStep((s) => s + 1), []);
  const prevStep = useCallback(() => setCurrentStep((s) => s - 1), []);
  const handleFilesSelected = useCallback(
    (files) => setDraftData((prev) => ({ ...prev, images: files })),
    []
  );

  const resetState = useCallback(() => {
    setCurrentStep(0);
    setDraftData({ itemInfo: null, auctionInfo: null, images: [] });
    setWallet(null);
    setCreatedItem(null);
    form.resetFields();
  }, [form]);

  const handleStep1Finish = useCallback(
    (values) => {
      setDraftData((prev) => ({ ...prev, itemInfo: values }));
      if (values.createAuction) nextStep();
      else setCurrentStep(2);
    },
    [nextStep]
  );

  const handleStep2Finish = useCallback((values) => {
    setDraftData((prev) => ({ ...prev, auctionInfo: values }));
    setCurrentStep(2);
  }, []);

  const handleSubmitAll = useCallback(async () => {
    const { itemInfo, auctionInfo, images } = draftData;
    if (!itemInfo) return;
    console.log(itemInfo, auctionInfo)
    setIsLoading(true);
    const moderationState = itemInfo.createAuction === true ? "Pending" : "Not_Submitted";
    const statusState = itemInfo.createAuction ? "Auction_Pending_Pay" : "Pending_Pay"
    try {
      const basePayload = {
        title: itemInfo.title,
        description: itemInfo.description || "",
        price: itemInfo.price,
        quantity: itemInfo.quantity || 1,
        status: statusState,
        moderation: moderationState,
        updatedBy: userID,
      };
      let created;
      if (itemInfo.categoryId === 1) {
        const licenseUrl = await uploadToCloudinary(itemInfo.licenseFile)
        created = await itemApi.postItemEV({
          ...basePayload,
          categoryId: 1,
          licenseUrl: licenseUrl || "",
          brand: itemInfo.brand,
          model: itemInfo.model,
          version: itemInfo.version,
          year: itemInfo.year,
          bodyStyle: itemInfo.bodyStyle,
          color: itemInfo.color,
          licensePlate: itemInfo.licensePlate,
          hasAccessories: itemInfo.hasAccessories,
          previousOwners: itemInfo.previousOwners,
          isRegistrationValid: itemInfo.isRegistrationValid,
          mileage: itemInfo.mileage,
        });
      } else {
        created = await itemApi.postItemBattery({
          ...basePayload,
          categoryId: 2,
          brand: itemInfo.brand,
          condition: itemInfo.condition,
          capacity: itemInfo.capacity,
          voltage: itemInfo.voltage,
          chargeCycles: itemInfo.chargeCycle,
        });
      }

      setCreatedItem(created);

      if (itemInfo.createAuction && auctionInfo) {
        await auctionApi.postAuction({
          itemId: created.itemId,
          startingPrice: auctionInfo.startingPrice,
          startTime: auctionInfo.auctionTime[0],
          endTime: auctionInfo.auctionTime[1],
          stepPrice: auctionInfo.stepPrice,
          isBuyNow: auctionInfo.isBuyNow || false,
        });
      }

      if (images?.length > 0) {
        await uploadImageApi.uploadItemImage(created.itemId, images);
      }

      const walletData = await walletApi.getWalletByUser(userID);
      setWallet(walletData);
      if (onSuccess) onSuccess();
      nextStep();
    } catch (err) {
      console.error("Lỗi khi gửi dữ liệu:", err);
      const message = err?.response?.data?.message;
      const status = err?.response?.status;
      if (status === 400 && message === "Duplicate license plate or DB constraint violation.") {
        setCurrentStep(0);
        return;
      }
      } finally {
        setIsLoading(false);
      }
    }, [draftData, userID, nextStep]);

  const handleDeposit = useCallback(async () => {
    if (!wallet || wallet.balance < 100000 || !createdItem) return;
    setIsLoading(true);
    try {
      await walletApi.withdrawWallet({
        userId: userID,
        amount: 100000,
        type: "Withdraw",
        ref: userID,
        description: `Phí đăng sản phẩm ${createdItem.itemId}`,
      });
      const paymentState = createdItem.status === `Pending` ? "Active" : "Auction_Active"
      await itemApi.putItem(createdItem.itemId, {
        ...createdItem,
        updatedBy: userID,
        status: paymentState,
        moderation: "Pending",
        updatedAt: new Date(new Date().getTime() + 7 * 60 * 60 * 1000).toISOString(),
      });

      setWallet((prev) => ({ ...prev, balance: prev.balance - 100000 }));
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Thanh toán thất bại:", err);
    } finally {
      setIsLoading(false);
    }
  }, [wallet, userID, createdItem, onSuccess]);

  const handleBackFromStep3 = useCallback(() => {
    if (!draftData.itemInfo?.createAuction) setCurrentStep(0);
    else setCurrentStep(1);
  }, [draftData]);

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
  }, [
    currentStep,
    form,
    wallet,
    handleStep1Finish,
    handleStep2Finish,
    handleFilesSelected,
    handleDeposit,
    resetState,
  ]);

  const renderFooter = useCallback(() => {
    if (currentStep === 3) return null;

    if (currentStep === 2) {
      return (
        <div className="flex justify-between items-center">
          <Button onClick={handleBackFromStep3}>Quay lại</Button>
          <Button type="primary" onClick={handleSubmitAll}>
            Gửi & Tiếp
          </Button>
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
  }, [currentStep, prevStep, form, handleSubmitAll, handleBackFromStep3]);

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
