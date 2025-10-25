import { useState, useEffect } from "react";

export default function SettingsSection() {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const baseURL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        document.body.classList.toggle("dark-mode", isDarkMode);
    }, [isDarkMode]);

    const handleDeleteAccount = async () => {
        const userId = localStorage.getItem("userId");
        if (!userId) return alert("User not found.");

        if (!window.confirm("⚠️ Bạn có chắc muốn xóa tài khoản này? Hành động này không thể hoàn tác!")) return;

        try {
            const res = await fetch(`${baseURL}User/${userId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            });

            if (!res.ok) throw new Error("Không thể xóa tài khoản");

            alert("✅ Tài khoản của bạn đã được xóa!");
            localStorage.clear();
            window.location.href = "/register";
        } catch (error) {
            console.error("Lỗi khi xóa tài khoản:", error);
            alert("❌ Đã xảy ra lỗi, vui lòng thử lại.");
        }
    };

    return (
        <div className="settings-page">
            <h2>⚙️ Settings</h2>

            <div className="setting-item">
                <span>🌙 Dark Mode</span>
                <label className="switch">
                    <input
                        type="checkbox"
                        checked={isDarkMode}
                        onChange={() => setIsDarkMode(!isDarkMode)}
                    />
                    <span className="slider round"></span>
                </label>
            </div>

            <hr style={{ margin: "20px 0", opacity: 0.3 }} />

            <div className="setting-item">
                <span>❌ Delete Account</span>
                <button className="delete-account-btn" onClick={handleDeleteAccount}>
                    Delete
                </button>
            </div>
        </div>
    );
}
