import React from 'react';
// 1. Import useNavigate to handle page navigation
import { useNavigate } from 'react-router-dom';
import FrogRegistration from '../assets/images/registration.png';

function SellerOnBoard() {
  // 2. Initialize the navigate function
  const navigate = useNavigate();

  // 3. Create a handler function to navigate to the seller form
  const handleRegistrationClick = () => {
    navigate('/seller-form');
  };

  return (
    <div className="h-full bg-242424 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full mx-auto bg-white rounded-2xl shadow-xl overflow-hidden md:flex">
        
        {/* Left Section: Image */}
        <div className="md:w-1/2">
          <img 
            src={FrogRegistration} 
            alt="Seller Registration" 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right Section: Content */}
        <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            Chào mừng đến với Cóc Mua Xe
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Vui lòng cung cấp thông tin để thành lập tài khoản người bán của bạn.
          </p>
          
          <div className="mt-8">
            {/* 4. Use a <button> and attach the onClick handler */}
            <button
              onClick={handleRegistrationClick}
              className="w-full py-3 px-6 bg-maincolor text-white font-bold rounded-lg shadow-md 
                         hover:bg-maincolor-darker focus:outline-none focus:ring-2 
                         focus:ring-offset-2 focus:ring-maincolor-darker 
                         transition-all duration-300 ease-in-out transform hover:-translate-y-1"
            >
              Bắt đầu Đăng ký
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default SellerOnBoard;