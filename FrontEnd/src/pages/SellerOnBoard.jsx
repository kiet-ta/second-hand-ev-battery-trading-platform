import React, { memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import FrogRegistration from '../assets/images/registration.png';
import useKycRedirect from '../hooks/useKycRedirect';

function SellerOnBoard() {
    useKycRedirect();
  
  const navigate = useNavigate();

  const handleRegistrationClick = useCallback(() => {
    navigate('/seller-form');
  }, [navigate]);

  return (
    <div className=" flex items-center justify-center bg-[#FAF8F3] p-6">
      <motion.div
        className="max-w-5xl w-full bg-white rounded-3xl shadow-lg overflow-hidden flex flex-col md:flex-row border border-[#E8E4DC]"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* Left Section: Image */}
        <div className="md:w-1/3 bg-[#FFFDF9] flex items-center justify-center">
          <img
            src={FrogRegistration}
            alt="Seller Registration"
            loading="lazy"
            className="w-full h-full object-cover md:rounded-l-3xl aspect-[4/3]"
          />
        </div>

        {/* Right Section: Content */}
        <div className="md:w-1/2 p-8 lg:p-12 flex flex-col justify-center bg-white">
          <h1 className="text-3xl md:text-4xl font-bold text-[#2C2C2C] font-roboto">
            Chào mừng đến với <span className="text-[#D4AF37]">Cóc Mua Xe</span>
          </h1>

          <p className="mt-4 text-lg text-gray-600 leading-relaxed">
            Vui lòng cung cấp thông tin cần thiết để thiết lập tài khoản người bán của bạn và bắt đầu hành trình kinh doanh ngay hôm nay.
          </p>

          <motion.button
            onClick={handleRegistrationClick}
            whileTap={{ scale: 0.97 }}
            className="mt-8 py-3 px-6 bg-[#D4AF37] text-white font-semibold rounded-xl shadow-md 
                       hover:bg-[#B8860B] focus:outline-none focus:ring-4 focus:ring-[#F1C232] 
                       transition-all duration-300 transform hover:-translate-y-1"
          >
            Bắt đầu Đăng ký
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

export default memo(SellerOnBoard);
