import React, { useState } from "react";

export default function ChangePassword() {
    const [formData, setFormData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { oldPassword, newPassword, confirmPassword } = formData;
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("token");

        if (!oldPassword || !newPassword || !confirmPassword) {
            alert("⚠️ Vui lòng điền đầy đủ thông tin.");
            return;
        }

        if (newPassword !== confirmPassword) {
            alert("❌ Mật khẩu xác nhận không khớp!");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`https://localhost:7272/api/User/change-password/${userId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    oldPassword,
                    newPassword,
                }),
            });

            if (!res.ok) {
                const errText = await res.text();
                throw new Error(errText || "Đổi mật khẩu thất bại");
            }

            alert("✅ Mật khẩu đã được thay đổi thành công!");
            setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" });
        } catch (error) {
            console.error("Error changing password:", error);
            alert("❌ Có lỗi xảy ra, vui lòng thử lại!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="security-section">
            <h2>🔒 Password & Security</h2>
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

                <button type="submit" className="btn-save-password" disabled={loading}>
                    {loading ? "Updating..." : "Update Password"}
                </button>
            </form>
        </div>
    );
}
