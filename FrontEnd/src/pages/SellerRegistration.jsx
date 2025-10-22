import React, { useState } from "react";
import kycApi from "../api/kycApi";

import StepIndicator from "../components/Seller/SellerForm/SellerIndicator";
import Step0_AccountType from "../components/Seller/SellerForm/Step0AccountType";
import Step1_PersonalInfo from "../components/Seller/SellerForm/Step1InfoForm";
import Step2_KYC from "../components/Seller/SellerForm/Step2IDVerification";
import Step3_StoreInfo from "../components/Seller/SellerForm/Step3BusinessInfo";
import Step4_Confirmation from "../components/Seller/SellerForm/Step4Confirmation";

const SellerRegistrationForm = () => {
  const [userId] = useState(localStorage.getItem("userId"));
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    accountType: "",
    fullName: "",
    email: "",
    phone: "",
    idCardFrontUrl: "",
    idCardBackUrl: "",
    selfieUrl: "",
    bio: "",
    storeLogoUrl: "",
    storeAddress: {
      recipientName: "",
      phone: "",
      street: "",
      ward: "",
      district: "",
      province: "",
    },
  });

  const nextStep = () => setCurrentStep((prev) => prev + 1);
  const prevStep = () => setCurrentStep((prev) => prev - 1);

  const handleSubmit = async () => {
    const kycPayload = {
      idCardUrl: `${formData.idCardFrontUrl},${formData.idCardBackUrl}`,
      selfieUrl: formData.selfieUrl,
    };

    const storePayload = {
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      bio: formData.bio,
      storeLogoUrl: formData.storeLogoUrl,
      storeAddress: formData.storeAddress,
    };

    try {
      await kycApi.postKYC(userId, kycPayload);
      alert("Đăng ký thành công!");
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Đã xảy ra lỗi. Vui lòng thử lại.");
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step0_AccountType
            formData={formData}
            setFormData={setFormData}
            nextStep={nextStep}
          />
        );
      case 2:
        return (
          <Step1_PersonalInfo
            formData={formData}
            setFormData={setFormData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 3:
        return (
          <Step2_KYC
            formData={formData}
            setFormData={setFormData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 4:
        if (formData.accountType === "personal") {
          setCurrentStep(5);
          return null;
        }
        return (
          <Step3_StoreInfo
            formData={formData}
            setFormData={setFormData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 5:
        return (
          <Step4_Confirmation
            formData={formData}
            prevStep={prevStep}
            handleSubmit={handleSubmit}
          />
        );
      default:
        return null;
    }
  };

  const totalSteps = formData.accountType === "store" ? 5 : 4;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg my-10">
      <StepIndicator
        currentStep={currentStep}
        totalSteps={totalSteps}
        accountType={formData.accountType}
      />
      <div className="mt-8">{renderStep()}</div>
    </div>
  );
};

export default SellerRegistrationForm;
