// Step1_PersonalInfo.js
import React from 'react';

const Step1_PersonalInfo = ({ formData, setFormData, nextStep }) => (
  <div>
    <h2 className="text-xl font-semibold text-gray-800 mb-4">Bước 1: Thông tin cá nhân</h2>
    <div className="space-y-4">
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Họ và Tên</label>
        <input 
          type="text" 
          id="fullName" 
          value={formData.fullName} 
          onChange={e => setFormData({...formData, fullName: e.target.value})} 
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500" 
          placeholder="Nguyễn Văn A" 
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
        <input 
          type="email" 
          id="email" 
          value={formData.email} 
          onChange={e => setFormData({...formData, email: e.target.value})} 
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500" 
          placeholder="email@example.com" 
        />
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Số điện thoại</label>
        <input 
          type="tel" 
          id="phone" 
          value={formData.phone} 
          onChange={e => setFormData({...formData, phone: e.target.value})} 
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500" 
          placeholder="09xxxxxxxx" 
        />
      </div>
    </div>
    <div className="mt-8 flex justify-end">
      <button onClick={nextStep} className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition-colors">Tiếp theo</button>
    </div>
  </div>
);

export default Step1_PersonalInfo;