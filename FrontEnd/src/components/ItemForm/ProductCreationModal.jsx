import React, { useState, useCallback, useMemo } from "react";
import { Modal, Steps, Spin, Form, Button } from "antd";
import Step1ItemDetails from "./Step1ItemDetail";
import Step2AuctionDetails from "./Step2AuctionDetail";
import Step3ImageUploader from "./Step3ImageUploader";
import Step4FinalReview from "./Step4FinalReview";
import itemApi from "../../api/itemApi";
import auctionApi from "../../api/auctionApi";
import uploadImageApi from "../../api/uploadImageApi";
import evData from "../../assets/datas/evData";
import { uploadToCloudinary } from "../../utils/uploadToCloudinary";

export default function ProductCreationModal({ onSuccess }) {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [draftData, setDraftData] = useState({
    itemInfo: null,
    auctionInfo: null,
    images: [],
  });
  const [licenseError, setLicenseError] = useState(false);
  const [form] = Form.useForm();

  const userID = useMemo(() => parseInt(localStorage.getItem("userId")), []);

  const nextStep = useCallback(() => setCurrentStep((s) => s + 1), []);
  const prevStep = useCallback(() => setCurrentStep((s) => s - 1), []);

  const resetState = useCallback(() => {
    setCurrentStep(0);
    setDraftData({ itemInfo: null, auctionInfo: null, images: [] });
    setLicenseError(false);
    form.resetFields();
  }, [form]);

  // -------- STEP 1 --------
  const handleStep1Finish = useCallback(
    (values) => {
      setDraftData((prev) => ({ ...prev, itemInfo: values }));
      if (values.createAuction) nextStep();
      else setCurrentStep(2);
    },
    [nextStep]
  );

  // -------- STEP 2 --------
  const handleStep2Finish = useCallback((values) => {
    setDraftData((prev) => ({ ...prev, auctionInfo: values }));
    setCurrentStep(2);
  }, []);

  // -------- STEP 3 --------
  const handleFilesSelected = useCallback((files) => {
    setDraftData((prev) => ({ ...prev, images: files }));
  }, []);

  const handleBackFromStep3 = useCallback(() => {
    if (!draftData.itemInfo?.createAuction) setCurrentStep(0);
    else setCurrentStep(1);
  }, [draftData]);

  // -------- FINAL SUBMIT --------
  const handleConfirmSubmit = useCallback(async () => {
    const { itemInfo, auctionInfo, images } = draftData;
    if (!itemInfo) return;

    setIsLoading(true);
    setLicenseError(false);

    try {
      const statusState = itemInfo.createAuction ? "Auction_Active" : "Active";

      const basePayload = {
        title: itemInfo.title,
        description: itemInfo.description || "",
        price: itemInfo.price,
        quantity: itemInfo.quantity || 1,
        status: statusState,
        moderation: "Pending",
        updatedBy: userID,
      };

      let created;

      // EV CATEGORY
      if (itemInfo.categoryId === 1) {
        const licenseUrl = await uploadToCloudinary(itemInfo.licenseFile);

        created = await itemApi.postItemEV({
          ...basePayload,
          categoryId: 1,
          licenseUrl,
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
      }

      // BATTERY CATEGORY
      else {
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

      // CREATE AUCTION
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

      // UPLOAD IMAGES
      if (images?.length > 0) {
        await uploadImageApi.uploadItemImage(created.itemId, images);
      }

      if (onSuccess) onSuccess();
      setIsOpenModal(false);
      resetState();
    } catch (err) {
      const msg = err?.response?.data?.message || "";

      if (msg.includes("Duplicate license plate")) {
        setLicenseError(true);
        setCurrentStep(0); // send user back to step 1
      }
    } finally {
      setIsLoading(false);
    }
  }, [draftData, userID, onSuccess, resetState]);

  // -------- UI CONTENT RENDER --------
  const renderStepContent = useCallback(() => {
    switch (currentStep) {
      case 0:
        return (
          <Step1ItemDetails
            form={form}
            evData={evData}
            onFinish={handleStep1Finish}
            showLicenseError={licenseError}
          />
        );

      case 1:
        return (
          <Step2AuctionDetails
            form={form}
            initialValues={draftData.auctionInfo}
            onFinish={handleStep2Finish}
            buyNowPrice={draftData.itemInfo?.price}
          />
        );

      case 2:
        return (
          <Step3ImageUploader
            onFilesSelected={handleFilesSelected}
            initialFiles={draftData.images}
          />
        );

      case 3:
        return (
          <Step4FinalReview
            draftData={draftData}
            licenseError={licenseError}
            onConfirm={handleConfirmSubmit}
            onBack={() => setCurrentStep(2)}
          />
        );

      default:
        return null;
    }
  }, [
    currentStep,
    form,
    draftData,
    licenseError,
    handleStep1Finish,
    handleStep2Finish,
    handleFilesSelected,
    handleConfirmSubmit,
  ]);

  // -------- FOOTER --------
  const renderFooter = useCallback(() => {
    if (currentStep === 3) return null;

    if (currentStep === 2) {
      return (
        <div className="flex justify-between items-center">
          <Button onClick={handleBackFromStep3}>Quay lại</Button>
          <Button type="primary" onClick={() => setCurrentStep(3)}>
            Xem lại
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
  }, [currentStep, form, prevStep, handleBackFromStep3]);

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
        destroyOnClose
      >
        <Spin spinning={isLoading}>
          <Steps current={currentStep} className="mb-8" items={[
            { title: "Thông tin sản phẩm" },
            { title: "Đấu giá (tùy chọn)" },
            { title: "Tải hình ảnh" },
            { title: "Xem lại" }
          ]} />

          <div className="min-h-[300px]">{renderStepContent()}</div>
        </Spin>
      </Modal>
    </>
  );
}
