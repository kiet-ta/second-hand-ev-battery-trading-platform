import React, { useState } from "react";
import kycApi from "../api/kycApi";

import StepIndicator from "../components/Seller/SellerForm/SellerIndicator";
import Step0_AccountType from "../components/Seller/SellerForm/Step0AccountType";
import Step1_PersonalInfo from "../components/Seller/SellerForm/Step1InfoForm";
import Step2_KYC from "../components/Seller/SellerForm/Step2IDVerification";
import Step3_StoreInfo from "../components/Seller/SellerForm/Step3BusinessInfo";
import Step4_Confirmation from "../components/Seller/SellerForm/Step4Confirmation";
import userApi from "../api/userApi";
import { useNavigate } from "react-router-dom";
import useKycRedirect from "../hooks/useKycRedirect";

const SellerRegistrationForm = () => {
  useKycRedirect();
  const navigate = useNavigate

  const [userId] = useState(localStorage.getItem("userId"));
  const [currentStep, setCurrentStep] = useState(1);
  const [kycPayload, setKycPayload] = useState(null);
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
    if (formData.accountType === "store") {
      const payload = {
        idCardUrl: `${formData.idCardFrontUrl},${formData.idCardBackUrl}`,
        selfieUrl: formData.selfieUrl,
        storeName: formData.storeAddress.recipientName,
        storePhone: formData.storeAddress.phone,
        storeLogoUrl: formData.storeAddress.logoUrl
      };
      setKycPayload(payload);
    }
    else {
      const payload = {
      idCardUrl: `${formData.idCardFrontUrl},${formData.idCardBackUrl}`,
      selfieUrl: formData.selfieUrl,
      };
      setKycPayload(payload);
    }
    try {
      const user = await userApi.getUserByID(userId);
      const updatedUser = {
      ...user,
      bio: formData.bio,
      updatedAt: new Date().toISOString(),
    };      
      await kycApi.postKYC(userId, kycPayload);
      await userApi.putUser(userId, updatedUser);
      navigate("/pending-review");

    } catch (error) {
      console.error("Error submitting form:", error);
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
