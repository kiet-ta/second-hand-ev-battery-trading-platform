import React, { useEffect, useState } from "react";
import { Input, Button, Switch, message } from "antd";
import userApi from "../../../api/userApi"; // adjust your import

const { TextArea } = Input;

const FormField = ({ label, children, error, required = false }) => (
  <div className="space-y-1">
    <label className="block text-sm font-semibold text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && (
      <p className="text-xs text-red-500 font-medium mt-1">{error}</p>
    )}
  </div>
);

const Step1InfoForm = ({ setFormData: setGlobalFormData, nextStep, prevStep }) => {
  const [user, setUser] = useState(null); 
  const [formData, setFormData] = useState({ fullName: "", email: "", phone: "", bio: "" });
  const [editMode, setEditMode] = useState(false);
  const [errors, setErrors] = useState({}); // New state for validation errors
  const userID = localStorage.getItem("userId"); 

  // Fetch user data on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await userApi.getUserByID(userID);
        setUser(res);
        setFormData({
          fullName: res.fullName || "",
          email: res.email || "",
          phone: res.phone || "",
          bio: res.bio || "", // Initialize bio from API
        });
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
  }, [userID]);

  // Handler for all local form data changes
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error on change
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Handle saving updated info and validation
  const handleSave = async () => {
    let currentErrors = {};

    // 1. Bio Validation (Always Required)
    if (!formData.bio || formData.bio.trim() === "") {
      currentErrors.bio = "Vui lòng nhập mô tả/tiểu sử của bạn.";
    }

    setErrors(currentErrors);

    // If there are validation errors, stop here
    if (Object.keys(currentErrors).length > 0) {
      return;
    }

    // 2. Data Update Logic
    if (editMode) {
      try {
        const updatedUser = {
          ...user, // Maintain existing user fields
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          bio: formData.bio, // Include bio in the update payload
        };
        // Assuming userApi.putUser expects the full user object or the necessary updates
        // If it only accepts partial updates, adjust here. Assuming it takes the full object for safety:
        await userApi.putUser(userID, updatedUser); 
        setUser(updatedUser);
        setEditMode(false);
        message.success("Cập nhật thông tin thành công!");
      } catch (error) {
        console.error("Update failed:", error);
        message.error("Cập nhật thất bại. Vui lòng thử lại.");
        return; // Stop if saving failed
      }
    }
    
    // 3. Update global form data and proceed
    setGlobalFormData(prev => ({
        ...prev,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        bio: formData.bio,
    }));
    nextStep();
  };

  if (!user) return <p>Đang tải thông tin...</p>;

  // Helper function to get input class based on error status
  const getInputClass = (field) => 
    `w-full ${errors[field] ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-300'} focus:ring focus:border-blue-300`;


  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow-md max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Thông tin cá nhân</h2>

      <div className="flex items-center justify-between p-2 border rounded-lg bg-gray-50">
        <span className="text-sm font-medium text-gray-700">Có muốn thay đổi thông tin đã lưu?</span>
        <Switch checked={editMode} onChange={setEditMode} />
      </div>
      
      <div className="gap-4 flex flex-col">
        {/* Full Name */}
        <FormField label="Họ và tên">
          <Input
            placeholder="Họ và tên"
            value={formData.fullName}
            disabled={!editMode}
            onChange={(e) => handleChange("fullName", e.target.value)}
            size="large"
            className={getInputClass('fullName')}
          />
        </FormField>

        {/* Email */}
        <FormField label="Email">
          <Input
            placeholder="Email"
            value={formData.email}
            disabled={!editMode}
            onChange={(e) => handleChange("email", e.target.value)}
            size="large"
            className={getInputClass('email')}
          />
        </FormField>

        {/* Phone */}
        <FormField label="Số điện thoại">
          <Input
            placeholder="Số điện thoại"
            value={formData.phone}
            disabled={!editMode}
            onChange={(e) => handleChange("phone", e.target.value)}
            size="large"
            className={getInputClass('phone')}
          />
        </FormField>

        {/* BIO (New Required Field) */}
        <FormField label="Mô tả/Tiểu sử" required error={errors.bio}>
          <TextArea
            placeholder="Viết một đoạn mô tả ngắn về bản thân hoặc lĩnh vực bạn muốn kinh doanh (Ví dụ: Chuyên cung cấp các sản phẩm thủ công mỹ nghệ tinh xảo...)"
            value={formData.bio}
            onChange={(e) => handleChange("bio", e.target.value)}
            rows={4}
            size="large"
            className={getInputClass('bio')}
          />
        </FormField>
      </div>
      
      <div className="flex justify-between mt-6">
        <Button onClick={prevStep}>Quay lại</Button>
        <Button type="primary" onClick={handleSave}>
          {editMode ? "Lưu & Tiếp tục" : "Tiếp tục"}
        </Button>
      </div>
    </div>
  );
};

export default Step1InfoForm;
