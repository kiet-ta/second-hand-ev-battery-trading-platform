import { useState, useEffect } from "react";
import "../../assets/styles/ProfileForm.css";
import { FaCamera } from "react-icons/fa";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { message } from "antd";

const ProfileForm = () => {
    const [formData, setFormData] = useState(null);
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    const [showPhone, setShowPhone] = useState(false);
    const baseURL = import.meta.env.VITE_API_BASE_URL;

    const maskPhone = (phone) => {
        if (!phone) return "";
        const len = phone.length;
        if (len <= 4) return phone;
        return phone.slice(0, 3) + "*".repeat(len - 6) + phone.slice(-3);
    };

    //Lấy thông tin người dùng khi load component
    useEffect(() => {
        if (!userId) return;

        fetch(`${baseURL}User/${userId}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        })
            .then((res) => {
                if (!res.ok) throw new Error("Không thể tải thông tin người dùng");
                return res.json();
            })
            .then((data) => {
                if (data.yearOfBirth) {
                    data.yearOfBirth = data.yearOfBirth.split("T")[0]; // chỉ lấy yyyy-MM-dd
                }
                setFormData(data);
            })
            .catch((err) => console.error("Lỗi:", err));
    }, [userId, token]);

    if (!formData) return <p>Đang tải thông tin...</p>;

    //Upload ảnh đại diện lên Cloudinary
    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Hiển thị preview tạm thời
        const previewUrl = URL.createObjectURL(file);
        setFormData((prev) => ({
            ...prev,
            avatarProfile: previewUrl,
        }));

        try {
            const formDataUpload = new FormData();
            formDataUpload.append("file", file);
            formDataUpload.append("upload_preset", "EV.Battery.Trading"); // preset Cloudinary
            formDataUpload.append("folder", "EV_BATTERY_TRADING/Electric_Verhicle");

            const response = await fetch("https://api.cloudinary.com/v1_1/dmokmlroc/image/upload", {
                method: "POST",
                body: formDataUpload,
            });

            const data = await response.json();
            if (data.secure_url) {
                setFormData((prev) => ({
                    ...prev,
                    avatarProfile: data.secure_url,
                }));
                console.log("✅ Upload thành công:", data.secure_url);
            } else {
                console.error("❌ Upload thất bại:", data);
            }
        } catch (error) {
            console.error("Lỗi khi tải ảnh lên Cloudinary:", error);
        }
    };

    //Khi người dùng thay đổi nội dung form
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    //API để cập nhật thông tin người dùng


    const handleSubmit = (e) => {
        e.preventDefault();

        const updatedUser = {
            ...formData,
            yearOfBirth: formData.yearOfBirth
                ? new Date(formData.yearOfBirth).toISOString().split("T")[0]
                : null,
            updatedAt: new Date().toISOString(),
        };

        fetch(`${baseURL}User/${userId}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedUser),
        })
            .then(async (res) => {
                if (!res.ok) throw new Error("Cập nhật thông tin thất bại");
                const text = await res.text();
                return text ? JSON.parse(text) : null;
            })
            .then((data) => {
                message.success("Cập nhật thông tin thành công!");
                console.log("Người dùng đã được cập nhật:", data);

                localStorage.setItem("userAvatar", updatedUser.avatarProfile);
                localStorage.setItem("userName", updatedUser.fullName);
            })
            .catch((err) => {
                console.error("Lỗi khi cập nhật người dùng:", err);
                message.error("Cập nhật thất bại. Vui lòng thử lại.");
            });
    };


    return (
        <div className="profile-form-container">
            {/* Ảnh đại diện */}
            <div className="profile-photo-section">
                <div className="photo-upload">
                    <div className="avatar-wrapper">
                        <img
                            src={formData.avatarProfile}
                            alt="Ảnh đại diện"
                            className="profile-photo"
                        />

                        {/* Overlay icon */}
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

            {/* Biểu mẫu chỉnh sửa */}
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
                                onChange={handleInputChange}
                                required
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
                                value={formData.accountStatus || ""}
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
