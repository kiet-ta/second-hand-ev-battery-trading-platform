import React from 'react';

const Step1_UserConfirmation = ({ formData, nextStep }) => (
  <div>
    <h2 className="text-xl font-semibold text-gray-800 mb-2">Bước 1: Xác nhận thông tin cá nhân</h2>
    <p className="text-sm text-gray-600 mb-6">Vui lòng kiểm tra lại thông tin đăng ký của bạn. Các thông tin này không thể thay đổi ở bước này.</p>
    <div className="grid grid-cols-1 gap-4">
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-500">Họ và Tên</label>
        <input type="text" id="fullName" value={formData.fullName} disabled className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 cursor-not-allowed focus:ring-0" />
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-500">Số điện thoại</label>
        <input type="tel" id="phone" value={formData.phone} disabled className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 cursor-not-allowed focus:ring-0" />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-500">Email</label>
        <input type="email" id="email" value={formData.email} disabled className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 cursor-not-allowed focus:ring-0" />
      </div>
    </div>
    <div className="mt-8 text-right">
      <button onClick={nextStep} className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition-colors duration-300">Xác nhận & Tiếp tục</button>
    </div>
  </div>
);

export default Step1_UserConfirmation;
