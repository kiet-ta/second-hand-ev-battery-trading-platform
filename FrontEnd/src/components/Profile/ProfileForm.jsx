import { useState, useEffect } from "react";
import "../../assets/styles/ProfileForm.css";
import { FaCamera } from "react-icons/fa";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import placeholder from "../../assets/images/placeholder.png"
const ProfileForm = () => {
  const [formData, setFormData] = useState(null);
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const [showPhone, setShowPhone] = useState(false);
  const baseURL = import.meta.env.VITE_API_BASE_URL;
  const [uploading, setUploading] = useState(false);


  const maskPhone = (phone) => {
    if (!phone) return "";
    const len = phone.length;
    if (len <= 4) return phone;
    return phone.slice(0, 3) + "*".repeat(len - 6) + phone.slice(-3);
  };

  const translateStatus = (status) => {
    switch (status) {
      case "Warning1":
        return "Cảnh cáo 1";
      case "Warning2":
        return "Cảnh cáo 2";
      case "Ban":
        return "Cấm tài khoản";
      case "Active":
        return "Hoạt động";
      default:
        return "Không xác định";
    }
  };

  useEffect(() => {
    if (!userId) return;

    fetch(`${baseURL}users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Không thể tải thông tin người dùng");
        return res.json();
      })
      .then((data) => {
        if (data.yearOfBirth) {
          data.yearOfBirth = data.yearOfBirth.split("T")[0];
        }
        setFormData(data);
      })
      .catch((err) => console.error("Lỗi:", err));
  }, [userId, token]);

  if (!formData) return <p>Đang tải thông tin...</p>;

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setFormData((prev) => ({
      ...prev,
      avatarProfile: previewUrl,
    }));

    const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    try {
      setUploading(true);

      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      formDataUpload.append("upload_preset", UPLOAD_PRESET);
      formDataUpload.append("folder", "EV_BATTERY_TRADING/User_Avatars");

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formDataUpload,
        }
      );

      const data = await res.json();

      if (data.secure_url) {
        setFormData((prev) => ({
          ...prev,
          avatarProfile: data.secure_url,
        }));

        localStorage.setItem("userAvatar", data.secure_url);
      }
    } catch (err) {
      console.error("Lỗi khi tải ảnh lên Cloudinary:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation: no future date
    const today = new Date().toISOString().split("T")[0];
    if (formData.yearOfBirth && formData.yearOfBirth > today) {
      console.warn("Ngày sinh không được vượt quá ngày hiện tại");
      return;
    }

    const updatedUser = {
      ...formData,
      yearOfBirth: formData.yearOfBirth
        ? new Date(formData.yearOfBirth).toISOString().split("T")[0]
        : null,
      updatedAt: new Date().toISOString(),
    };

    fetch(`${baseURL}users/${userId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedUser),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Cập nhật thông tin thất bại");
        const text = await res.text();
        return text ? JSON.parse(text) : null;
      })
      .then(() => {
        localStorage.setItem("userAvatar", updatedUser.avatarProfile);
        localStorage.setItem("userName", updatedUser.fullName);
      })
      .catch((err) => console.error("Lỗi khi cập nhật người dùng:", err));
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="profile-form-container">
      <div className="profile-photo-section">
        <div className="photo-upload">
          <div className="avatar-wrapper">
            <img
              src={formData.avatarProfile || placeholder}
              alt="Ảnh đại diện"
              className="profile-photo"
            />
            <label htmlFor="avatarUpload" className="upload-overlay">
              <FaCamera />
            </label>
            <input
              id="avatarUpload"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              style={{ display: "none" }}
            />
          </div>

          <div className="upload-info">
            <h3>{formData.fullName}</h3>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h2 className="form-title">Thay đổi thông tin người dùng</h2>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fullName">Họ và tên *</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Địa chỉ Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                disabled
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="gender">Giới tính *</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender || ""}
                onChange={handleInputChange}
                required
              >
                <option value="Male">Nam</option>
                <option value="Female">Nữ</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="yearOfBirth">Năm sinh *</label>
              <input
                type="date"
                id="yearOfBirth"
                name="yearOfBirth"
                value={formData.yearOfBirth || ""}
                onChange={handleInputChange}
                required
                max={today} // <-- prevent choosing future dates
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phone">Số điện thoại *</label>
              <div className="phone-wrapper">
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={showPhone ? formData.phone : maskPhone(formData.phone)}
                  onChange={handleInputChange}
                  required
                  readOnly={!showPhone}
                />
                <button
                  type="button"
                  className="toggle-phone-btn"
                  onClick={() => setShowPhone((prev) => !prev)}
                >
                  {showPhone ? <FaRegEyeSlash /> : <FaRegEye />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="status">Trạng thái tài khoản</label>
              <input
                type="text"
                id="status"
                name="status"
                value={translateStatus(formData.accountStatus)}
                readOnly
                className="readonly-input"
              />
            </div>
          </div>

          <button type="submit" className="submit-btn">
            Cập nhật thông tin
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileForm;
