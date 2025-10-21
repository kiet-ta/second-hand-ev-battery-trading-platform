// SellerRegistrationForm.js
import React, { useState } from 'react';
import kycApi from '../api/kycApi'; // Import API của bạn

// Import các component con
import StepIndicator from '../components/SellerForm/SellerIndicator';
import Step1_PersonalInfo from '../components/SellerForm/Step1InfoForm';
import Step2_KYC from '../components/SellerForm/Step2IDVerfication';
import Step3_StoreInfo from '../components/SellerForm/Step3BussinessInfo';

const SellerRegistrationForm = () => {
  // Giả sử userId được lấy từ context/state của ứng dụng
  // Ở đây tôi dùng tạm một giá trị
  const [userId, setUserId] = useState(localStorage.getItem("userId")); 

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Bước 1
    fullName: '',
    email: '',
    phone: '',
    // Bước 2
    idCardFrontUrl: '',
    idCardBackUrl: '',
    selfieUrl: '',
    // Bước 3
    bio: '',
    storeLogoUrl: '',
    storeAddress: {
      recipientName: '', // Tên cửa hàng
      phone: '',         // SĐT cửa hàng
      street: '',
      ward: '',
      district: '',
      province: ''
    }
  });

  // Hàm điều hướng
  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => prev - 1);

  // Hàm xử lý gửi toàn bộ biểu mẫu
  const handleSubmit = async () => {
    console.log("Đang gửi biểu mẫu:", formData);

    // 1. Tách dữ liệu KYC (Từ Bước 2)
    const kycPayload = {
      idCardUrl: `${formData.idCardFrontUrl},${formData.idCardBackUrl}`, // Ảnh mặt trước
      selfieUrl: formData.selfieUrl,
    };

    // 2. Tách dữ liệu Cửa hàng (Từ Bước 1 & 3)
    const storePayload = {
      // Thông tin cá nhân
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      // Thông tin cửa hàng
      bio: formData.bio,
      storeLogoUrl: formData.storeLogoUrl,
      storeAddress: formData.storeAddress,
    };

    try {
      // **Sử dụng kycApi đã import**
      console.log("Đang gọi kycApi.postKYC với userId:", userId);
      const kycResponse = await kycApi.postKYC(userId, kycPayload);
      console.log("KYC response:", kycResponse);

      // (Tùy chọn) Gửi thông tin cửa hàng đến một API khác
      // console.log("Đang gửi thông tin cửa hàng:", storePayload);
      // const storeResponse = await storeApi.createStore(userId, storePayload);
      // console.log("Store response:", storeResponse);

      alert("Đăng ký thành công!");
      // Chuyển hướng người dùng sau khi thành công
      // (ví dụ: window.location.href = '/dashboard/pending-approval';)

    } catch (error) {
      console.error("Lỗi khi gửi biểu mẫu:", error);
      alert("Đã xảy ra lỗi. Vui lòng thử lại.");
    }
  };

  // Hiển thị component bước hiện tại
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1_PersonalInfo 
                  formData={formData} 
                  setFormData={setFormData} 
                  nextStep={nextStep} 
                />;
      case 2:
        return <Step2_KYC 
                  formData={formData} 
                  setFormData={setFormData} 
                  nextStep={nextStep} 
                  prevStep={prevStep} 
                />;
      case 3:
        return <Step3_StoreInfo 
                  formData={formData} 
                  setFormData={setFormData} 
                  prevStep={prevStep} 
                  handleSubmit={handleSubmit} 
                />;
      default:
        return <Step1_PersonalInfo 
                  formData={formData} 
                  setFormData={setFormData} 
                  nextStep={nextStep} 
                />;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-xl my-10">
      <StepIndicator currentStep={currentStep} />
      <div className="mt-8">
        {renderStep()}
      </div>
    </div>
  );
};

export default SellerRegistrationForm;