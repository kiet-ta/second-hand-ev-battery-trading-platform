import React, { useState } from "react";
import { Toaster, toast } from "react-hot-toast"; // 👈 import đầy đủ
import "../assets/styles/ChangePassword.css"; // CSS form đẹp
import { CiLock } from "react-icons/ci";
import { LuSave } from "react-icons/lu";
import { AiOutlineLoading3Quarters } from "react-icons/ai"; // icon loading xoay


export default function ChangePassword() {
    const [formData, setFormData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [loading, setLoading] = useState(false);
    const [strength, setStrength] = useState({ label: "", color: "" });

    // 🔍 Kiểm tra độ mạnh mật khẩu
    const checkPasswordStrength = (password) => {
        let score = 0;
        if (!password) return { label: "", color: "" };

        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        if (score <= 1) return { label: "Yếu", color: "#ef4444" };
        if (score === 2) return { label: "Trung bình", color: "#f59e0b" };
        return { label: "Mạnh", color: "#10b981" };
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (name === "newPassword") {
            setStrength(checkPasswordStrength(value));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { oldPassword, newPassword, confirmPassword } = formData;
        const token = localStorage.getItem("token");

        if (!oldPassword || !newPassword || !confirmPassword) {
            toast.error("⚠️ Vui lòng điền đầy đủ thông tin.");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("❌ Mật khẩu xác nhận không khớp!");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("https://localhost:7272/api/Auth/change-password", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    currentPassword: oldPassword,
                    newPassword,
                    confirmPassword,
                }),
            });

            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg || "Đổi mật khẩu thất bại!");
            }

            toast.success("✅ Mật khẩu đã được thay đổi thành công!");
            const rememberEmail = localStorage.getItem("rememberEmail");
            if (rememberEmail) {
                // ⚠️ Cập nhật lại mật khẩu mới cho rememberPassword
                localStorage.setItem("rememberPassword", formData.newPassword);
            }
            setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" });
            setStrength({ label: "", color: "" });
        } catch (error) {
            console.error("Error changing password:", error);
            toast.error("❌ Có lỗi xảy ra, vui lòng thử lại!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="security-section">
            {/* 💡 Toaster riêng của component */}
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        borderRadius: "10px",
                        background: "#fff",
                        color: "#333",
                        fontSize: "15px",
                    },
                    success: {
                        iconTheme: {
                            primary: "#4F39F6",
                            secondary: "#fff",
                        },
                    },
                }}
            />

            <h2 className="section-title">
                <CiLock className="lock-icon" />
                Password & Security
            </h2>
            <p>Change your password below.</p>

            <form className="change-password-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Current Password</label>
                    <input
                        type="password"
                        name="oldPassword"
                        value={formData.oldPassword}
                        onChange={handleChange}
                        placeholder="Enter current password"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>New Password</label>
                    <input
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        placeholder="Enter new password"
                        required
                    />

                    {formData.newPassword && (
                        <div className="password-strength">
                            <div
                                className="strength-bar"
                                style={{
                                    backgroundColor: strength.color,
                                    width:
                                        strength.label === "Yếu"
                                            ? "33%"
                                            : strength.label === "Trung bình"
                                                ? "66%"
                                                : "100%",
                                }}
                            />
                            <span
                                className="strength-label"
                                style={{ color: strength.color }}
                            >
                                {strength.label}
                            </span>
                        </div>
                    )}
                </div>

                <div className="form-group">
                    <label>Confirm New Password</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm new password"
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="btn-save-password"
                    disabled={loading}
                >
                    {loading ? (
                        <AiOutlineLoading3Quarters className="spin-icon" />
                    ) : (
                        <>
                            <LuSave className="save-icon" />
                            <span>Update Password</span>
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
