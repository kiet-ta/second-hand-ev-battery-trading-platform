import React from 'react';
import ImageUploadField from './ImageUploadField';

const Step3_StoreInfo = ({ formData, setFormData, prevStep, handleSubmit }) => {
  
  // A helper function to handle changes in the nested storeAddress object
  const handleAddressChange = (e) => {
    setFormData({
      ...formData,
      storeAddress: {
        ...formData.storeAddress,
        [e.target.name]: e.target.value
      }
    });
  };
  console.log(formData)
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Bước 3: Thông tin Cửa hàng và Giới thiệu</h2>
      
      <div className="mb-6">
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Giới thiệu bản thân / Cửa hàng (Bio)</label>
        <textarea 
          id="bio" 
          rows="3"
          value={formData.bio} 
          onChange={e => setFormData({...formData, bio: e.target.value})} 
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500" 
          placeholder="Mô tả ngắn về bạn hoặc cửa hàng của bạn..." 
        />
      </div>

      <h3 className="text-lg font-medium text-gray-800 mb-4 border-t pt-6">Địa chỉ cửa hàng</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <div>
          <label htmlFor="recipientName" className="block text-sm font-medium text-gray-700">Tên cửa hàng</label>
          <input type="text" name="recipientName" id="recipientName" value={formData.storeAddress.recipientName} onChange={handleAddressChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500" placeholder="Shop XYZ" />
        </div>
        <div>
          <label htmlFor="storePhone" className="block text-sm font-medium text-gray-700">SĐT Cửa hàng</label>
          <input type="tel" name="phone" id="storePhone" value={formData.storeAddress.phone} onChange={handleAddressChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500" placeholder="09xxxxxxxx" />
        </div>
        <div className="md:col-span-2">
            <ImageUploadField
                label="Logo Cửa hàng"
                imageUrl={formData.storeLogoUrl}
                onUpload={(url) => setFormData({ ...formData, storeLogoUrl: url })}
            />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="street" className="block text-sm font-medium text-gray-700">Số nhà, Tên đường</label>
          <input type="text" name="street" id="street" value={formData.storeAddress.street} onChange={handleAddressChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500" placeholder="123 Đường ABC" />
        </div>
        <div>
          <label htmlFor="ward" className="block text-sm font-medium text-gray-700">Phường / Xã</label>
          <input type="text" name="ward" id="ward" value={formData.storeAddress.ward} onChange={handleAddressChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500" placeholder="Phường 1" />
        </div>
        <div>
          <label htmlFor="district" className="block text-sm font-medium text-gray-700">Quận / Huyện</label>
          <input type="text" name="district" id="district" value={formData.storeAddress.district} onChange={handleAddressChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500" placeholder="Quận 1" />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="province" className="block text-sm font-medium text-gray-700">Tỉnh / Thành phố</label>
          <input type="text" name="province" id="province" value={formData.storeAddress.province} onChange={handleAddressChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500" placeholder="TP. Hồ Chí Minh" />
        </div>
      </div>
      <div className="mt-8 flex justify-between">
        <button onClick={prevStep} className="bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg hover:bg-gray-400 transition-colors">Quay lại</button>
        <button onClick={handleSubmit} className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors">Hoàn tất & Gửi</button>
      </div>
    </div>
  );
}

export default Step3_StoreInfo;

