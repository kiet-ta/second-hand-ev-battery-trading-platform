import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";

export default function AddStaff({ isOpen, onClose, onSuccess }) {
    const [permissions, setPermissions] = useState([]);
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        permissions: [],
    });
    const [loading, setLoading] = useState(false);
    const baseURL = import.meta.env.VITE_API_BASE_URL;


    if (!isOpen) return null;

    // Fetch quyền staff có thêm authorized
    useEffect(() => {
        async function fetchPermissions() {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    console.warn("⚠️ Không tìm thấy token, không thể tải quyền.");
                    return;
                }

                const res = await fetch(`${baseURL}management/permissions`, {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (!res.ok) {
                    const errText = await res.text();
                    throw new Error(`Lỗi HTTP ${res.status}: ${errText}`);
                }

                const data = await res.json();
                setPermissions(data);
            } catch (err) {
                console.error("❌ Lỗi tải quyền:", err);
            }
        }

        fetchPermissions();
    }, []);

    // Cập nhật dữ liệu form
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Toggle quyền
    const togglePermission = (perm) => {
        setFormData((prev) => {
            const exists = prev.permissions.includes(perm);
            return {
                ...prev,
                permissions: exists
                    ? prev.permissions.filter((p) => p !== perm)
                    : [...prev.permissions, perm],
            };
        });
    };

    // Gửi form
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            alert("❌ Mật khẩu xác nhận không khớp!");
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                alert("⚠️ Không tìm thấy token, vui lòng đăng nhập lại!");
                return;
            }

            const payload = {
                fullName: formData.fullName,
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
                permissions: formData.permissions,
            };

            const res = await fetch(`${baseURL}management/staff`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errText = await res.text();
                console.error("❌ Backend error:", errText);
                alert("Tạo staff thất bại: " + errText);
                return;
            }

            alert("✅ Tạo tài khoản staff thành công!");
            onSuccess(); // Đóng modal & refresh nếu cần
        } catch (err) {
            console.error("❌", err);
            alert("Lỗi khi tạo staff. Vui lòng thử lại!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            {/* Khung modal */}
            <div className="bg-white rounded-2xl shadow-2xl w-[480px] max-h-[90vh] overflow-auto animate-fadeIn">
                {/* Header */}
                <div className="flex justify-between items-center border-b px-6 py-4">
                    <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                        👤 Add Staff Account
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-500 hover:text-slate-700 transition"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form nội dung */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700">
                            Full Name
                        </label>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                            placeholder="e.g., Nguyen Van A"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                            placeholder="example@email.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700">
                            Phone
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                            placeholder="e.g., 0901234567"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-slate-700">
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 text-slate-700">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    {/* Quyền */}
                    <div>
                        <label className="block text-sm font-medium mb-2 text-slate-700">
                            Assign Permissions
                        </label>
                        <div className="grid grid-cols-2 gap-2 border border-slate-200 p-3 rounded-lg bg-slate-50 max-h-[160px] overflow-y-auto">
                            {permissions.length > 0 ? (
                                permissions.map((p) => (
                                    <label
                                        key={p.permissionId}
                                        className="flex items-center gap-2 text-sm text-slate-700"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={formData.permissions.includes(p.permissionName)}
                                            onChange={() => togglePermission(p.permissionName)}
                                            className="accent-indigo-600"
                                        />
                                        {p.permissionName}
                                    </label>
                                ))
                            ) : (
                                <p className="text-xs text-slate-400 italic col-span-2">
                                    Loading permissions...
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 pt-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 transition"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 rounded-lg text-white font-medium bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 flex items-center justify-center gap-2 shadow-sm"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                "Create Staff"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
