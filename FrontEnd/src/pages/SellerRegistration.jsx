import React, { useState, useEffect, useCallback } from "react";
import { Spin } from "antd";
import { useNavigate } from "react-router-dom";
import { uploadToCloudinary } from "../utils/uploadToCloudinary";
import kycApi from "../api/kycApi";
import userApi from "../api/userApi";
import SellerIndicator from "../components/Seller/SellerForm/SellerIndicator";
import Step0AccountType from "../components/Seller/SellerForm/Step0AccountType";
import Step1PersonalInfo from "../components/Seller/SellerForm/Step1InfoForm";
import Step2KYCVerification from "../components/Seller/SellerForm/Step2IDVerification";
import Step3StoreInfo from "../components/Seller/SellerForm/Step3BusinessInfo";
import Step4Confirm from "../components/Seller/SellerForm/Step4Confirmation";
import useKycRedirect from '../hooks/useKycRedirect';
export default function SellerRegistrationForm() {
  useKycRedirect()
  const navigate = useNavigate();
  const [userId] = useState(localStorage.getItem("userId"));

  const [formData, setFormData] = useState({
    accountType: "",
    fullName: "",
    email: "",
    phone: "",
    bio: "",
    idCardFrontUrl: "",
    idCardBackUrl: "",
    selfieUrl: "",
    storeLogoUrl: "",
    storeAddress: {
      recipientName: "",
      phone: "",
      street: "",
      ward: "",
      district: "",
      province: "",
      provinceCode: "",
      districtCode: "",
      wardCode: "",
    },
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [visitedMaxStep, setVisitedMaxStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [uploadLoading, setUploadLoading] = useState({});

  useEffect(() => {
    let mounted = true;
    const fetchUser = async () => {
      try {
        if (!userId) return;
        const user = await userApi.getUserByID(userId);
        if (!mounted) return;
        setFormData((prev) => ({
          ...prev,
          fullName: user.fullName || prev.fullName,
          email: user.email || prev.email,
          phone: user.phone || prev.phone,
          bio: user.bio || prev.bio,
          user, // store full user for reference
        }));
      } catch (_) { }
    };
    fetchUser();
    return () => (mounted = false);
  }, [userId]);

  const totalSteps = formData.accountType === "store" ? 5 : 4;

  const nextStep = useCallback(() => {
    setCurrentStep((s) => {
      const next = Math.min(s + 1, totalSteps - 1);
      setVisitedMaxStep((m) => Math.max(m, next));
      return next;
    });
  }, [totalSteps]);

  const prevStep = useCallback(() => setCurrentStep((s) => Math.max(0, s - 1)), []);

  const goToStep = (n) => {
    if (n <= visitedMaxStep) setCurrentStep(n);
  };

  const updateFormData = useCallback((partial) => {
    setFormData((prev) => ({ ...prev, ...partial }));
  }, []);

  const updateStoreAddress = useCallback((partial) => {
    setFormData((prev) => ({
      ...prev,
      storeAddress: { ...prev.storeAddress, ...partial },
    }));
  }, []);

  const handleImageFile = async (file, field, isStoreLogo = false) => {
    if (!file) return;
    setUploadLoading((l) => ({ ...l, [field]: true }));
    try {
      const url = await uploadToCloudinary(file);
      if (isStoreLogo) updateFormData({ storeLogoUrl: url });
      else updateFormData({ [field]: url });
    } catch (_) {
    } finally {
      setUploadLoading((l) => ({ ...l, [field]: false }));
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload =
        formData.accountType === "store"
          ? {
            idCardUrl: `${formData.idCardFrontUrl},${formData.idCardBackUrl}`,
            selfieUrl: formData.selfieUrl,
            storeName: formData.storeAddress.recipientName,
            storePhone: formData.storeAddress.phone,
            storeLogoUrl: formData.storeLogoUrl,
          }
          : {
            idCardUrl: `${formData.idCardFrontUrl},${formData.idCardBackUrl}`,
            selfieUrl: formData.selfieUrl,
          };

      const user = await userApi.getUserByID(userId);

      const updatedUser =
        formData.accountType === "store"
          ? {
            ...user,
            bio: formData.bio,
            kycStatus: "Pending",
            isStore: true,
            updatedAt: new Date().toISOString(),
          }
          : {
            ...user,
            bio: formData.bio,
            kycStatus: "Pending",
            isStore: false,
            updatedAt: new Date().toISOString(),
          };

      await kycApi.postKYC(userId, payload);
      await userApi.putUser(userId, updatedUser);

      navigate("/pending-review");
    } catch (_) {
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow my-8">
      <SellerIndicator
        currentStep={currentStep}
        totalSteps={totalSteps}
        onStepClick={goToStep}
      />

      <div className="mt-6">
        {currentStep === 0 && (
          <Step0AccountType
            formData={formData}
            setFormData={setFormData}
            nextStep={nextStep}
          />
        )}

        {currentStep === 1 && (
          <Step1PersonalInfo
            formData={formData}
            setFormData={setFormData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        )}

        {currentStep === 2 && (
          <Step2KYCVerification
            formData={formData}
            setFormData={setFormData}
            handleImageFile={handleImageFile}
            uploadLoading={uploadLoading}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        )}

        {currentStep === 3 && formData.accountType === "store" && (
          <Step3StoreInfo
            formData={formData}
            setFormData={setFormData}
            updateStoreAddress={updateStoreAddress}
            nextStep={nextStep}
            prevStep={prevStep}
            handleImageFile={handleImageFile}
            uploadLoading={uploadLoading}
          />
        )}

        {((currentStep === 3 && formData.accountType !== "store") ||
          currentStep === 4) && (
            <Step4Confirm
              formData={formData}
              prevStep={prevStep}
              handleSubmit={handleSubmit}
              submitting={submitting}
            />
          )}
      </div>
    </div>
  );
}
