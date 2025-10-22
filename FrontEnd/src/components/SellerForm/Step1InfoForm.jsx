import React, { useEffect, useState } from "react";
import { Input, Button, Switch, message } from "antd";
import userApi from "../../api/userApi"; // adjust your import

const Step1InfoForm = ({ nextStep, prevStep }) => {
  const [user, setUser] = useState(null); // full user object from API
  const [formData, setFormData] = useState({ fullName: "", email: "", phone: "" });
  const [editMode, setEditMode] = useState(false);
  const userID = localStorage.getItem("userId"); // get userID from local storage

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
        });
      } catch (error) {
        console.error("Error fetching user:", error);
        message.error("Không thể tải thông tin người dùng.");
      }
    };
    fetchUser();
  }, [userID]);

  // Handle saving updated info
  const handleSave = async () => {
    if (!editMode) {
      nextStep(); // if not editing, just continue
      return;
    }

    try {
      const updatedUser = {
        ...user,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
      };
      await userApi.putUser(updatedUser);
      message.success("Cập nhật thông tin thành công!");
      setUser(updatedUser);
      setEditMode(false);
      nextStep();
    } catch (error) {
      console.error("Update failed:", error);
      message.error("Cập nhật thông tin thất bại.");
    }
  };

  if (!user) return <p>Đang tải thông tin...</p>;

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow-md max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Thông tin cá nhân</h2>

      <div className="flex items-center justify-between">
        <span>Có muốn thay đổi thông tin?</span>
        <Switch checked={editMode} onChange={setEditMode} />
      </div>
      <div className="gap-4 flex flex-col">
      <Input
        placeholder="Họ và tên"
        value={formData.fullName}
        disabled={!editMode}
        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
        size="large"
      />

      <Input
        placeholder="Email"
        value={formData.email}
        disabled={!editMode}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        size="large"
      />

      <Input
        placeholder="Số điện thoại"
        value={formData.phone}
        disabled={!editMode}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        size="large"
      />

        
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
