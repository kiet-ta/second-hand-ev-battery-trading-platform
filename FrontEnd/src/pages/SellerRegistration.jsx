import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Correctly import the new step components without file extensions
import StepIndicator from '../components/SellerForm/SellerIndicator';
import Step1_UserConfirmation from '../components/SellerForm/Step1InfoForm';
import Step2_KYC from '../components/SellerForm/Step2IDVerfication';
import Step3_StoreInfo from '../components/SellerForm/Step3BussinessInfo';

// --- Mock User Data Fetch ---
// In a real app, you would fetch this from your authentication context or an API
const getMockUser = () => ({
  userId: 1,
  fullName: "Nguyen Van A",
  email: "nguyen.a@gmail.com",
  phone: "0901234567",
  bio: "Mua xe thường xuyên",
});


function SellerForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // User info pre-filled from mock data
    userId: null,
    fullName: '',
    email: '',
    phone: '',
    bio: '',

    // KYC data
    kyc: {
      idCardFrontUrl: '',
      idCardBackUrl: '',
      selfieUrl: '',
    },
    
    // Store Address data
    storeAddress: {
      recipientName: '',
      phone: '',
      street: '',
      ward: '',
      district: '',
      province: '',
    },
    storeLogoUrl: '',
  });
  
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const navigate = useNavigate();

  // Effect to load initial user data
  useEffect(() => {
    const userData = getMockUser();
    setFormData(prev => ({
      ...prev,
      userId: userData.userId,
      fullName: userData.fullName,
      email: userData.email,
      phone: userData.phone,
      bio: userData.bio,
    }));
    setIsDataLoaded(true);
  }, []);


  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => prev - 1);

  const handleSubmit = () => {
    console.log("Final Form Data:", formData);

    // 1. Construct the KYC API Payload
    const kycPayload = {
      userId: formData.userId,
      idCardUrl: `${formData.idCardFrontUrl}, ${formData.idCardBackUrl}`, // Combine front and back URLs
      vehicleRegistrationUrl: "string", // Placeholder as it's not in the form
      selfieUrl: formData.selfieUrl,
      docUrl: "string", // Placeholder
      submittedAt: new Date().toISOString(),
      status: "pending" // Initial status
    };

    // 2. Construct the Store Address API Payload
    const storeAddressPayload = {
      userId: formData.userId,
      ...formData.storeAddress,
      isDefault: true // Set as default address
    };

    // 3. (Optional) Construct a payload to update user's bio
    const userUpdatePayload = {
        userId: formData.userId,
        bio: formData.bio,
        // Potentially avatarProfile: formData.storeLogoUrl if they serve the same purpose
    };
    
    console.log("--- Simulating API Calls ---");
    console.log("KYC Payload to be sent:", kycPayload);
    console.log("Store Address Payload to be sent:", storeAddressPayload);
    console.log("User Update Payload to be sent:", userUpdatePayload);
    console.log("----------------------------");

    alert('Đăng ký thành công! Vui lòng chờ xét duyệt.');
    navigate('/success'); 
  };
  
  const renderStep = () => {
    if (!isDataLoaded) {
        return <div className="text-center">Đang tải dữ liệu người dùng...</div>;
    }

    switch(currentStep) {
      case 1:
        return <Step1_UserConfirmation formData={formData} nextStep={nextStep} />;
      case 2:
        return <Step2_KYC formData={formData} setFormData={setFormData} nextStep={nextStep} prevStep={prevStep} />;
      case 3:
        return <Step3_StoreInfo formData={formData} setFormData={setFormData} prevStep={prevStep} handleSubmit={handleSubmit} />;
      default:
        return <Step1_UserConfirmation formData={formData} nextStep={nextStep} />;
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Đăng ký tài khoản Người bán</h1>
            <p className="text-gray-600">Chỉ vài bước để bắt đầu bán hàng</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <StepIndicator currentStep={currentStep} steps={["Xác nhận TT", "Xác minh KYC", "Thông tin CH"]} />
          {renderStep()}
        </div>
      </div>
    </div>
  );
}

export default SellerForm;

