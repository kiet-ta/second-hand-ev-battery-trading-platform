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
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const baseURL = import.meta.env.VITE_API_BASE_URL;

    if (!isOpen) return null;

    // Fetch permissions
    useEffect(() => {
        async function fetchPermissions() {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                const res = await fetch(`${baseURL}management/permissions`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (!res.ok) {
                    const errText = await res.text();
                    throw new Error(`HTTP ${res.status}: ${errText}`);
                }

                const data = await res.json();
                setPermissions(data);
            } catch (err) {
                console.error("Error fetching permissions:", err);
            }
        }
        fetchPermissions();
    }, []);

    // Validation rules
    const validateField = (name, value) => {
        switch (name) {
            case "fullName":
                if (!value.trim()) return "Full name is required";
                if (value.length < 3) return "Full name must be at least 3 characters";
                break;
            case "email":
                { if (!value.trim()) return "Vui lòng nhập Email";
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) return "Vui lòng nhập Email chính xác";
                break; }
            case "phone":
                { if (!value.trim()) return "Vui lòng nhập số điện thoại";
                const phoneRegex = /^[0-9]{9,15}$/;
                if (!phoneRegex.test(value)) return "Vui lòng nhập đúng số điện thoại";
                break; }
            case "password":
                { if (!value) return "Password is required";
                // Strong password: at least 8 chars, uppercase, lowercase, number, special char
                const strongPwd = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
                if (!strongPwd.test(value))
                    return "Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.";
                break; }
            case "confirmPassword":
                if (value !== formData.password) return "Mật khẩu không trùng";
                break;
            default:
                return "";
        }
        return "";
    };

    // Handle input change with validation
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Validate field on change
        const errorMsg = validateField(name, value);
        setErrors((prev) => ({ ...prev, [name]: errorMsg }));
    };

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

    // Validate whole form
    const validateForm = () => {
        const newErrors = {};
        Object.keys(formData).forEach((key) => {
            const error = validateField(key, formData[key]);
            if (error) newErrors[key] = error;
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Submit handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        if (!validateForm()) return;

        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setErrors({ form: "Vui lòng đăng nhập." });
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
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errText = await res.text();
                if (errText.includes("Email already exists")) {
                    setErrors({ email: "Email đã tồn tại" });
                } else {
                    setErrors({ form: errText });
                }
                return;
            }

            // Success
            onSuccess();
            setFormData({
                fullName: "",
                email: "",
                password: "",
                confirmPassword: "",
                phone: "",
                permissions: [],
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
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

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {errors.form && <p className="text-red-500 text-sm">{errors.form}</p>}

                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700">Full Name</label>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                            placeholder="e.g., Nguyen Van A"
                            required
                        />
                        {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                            placeholder="example@email.com"
                            required
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700">Phone</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                            placeholder="e.g., 0901234567"
                            required
                        />
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-slate-700">Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                placeholder="••••••••"
                                required
                            />
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 text-slate-700">Confirm Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                placeholder="••••••••"
                                required
                            />
                            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                        </div>
                    </div>

                    {/* Permissions */}
                    <div>
                        <label className="block text-sm font-medium mb-2 text-slate-700">Assign Permissions</label>
                        <div className="grid grid-cols-2 gap-2 border border-slate-200 p-3 rounded-lg bg-slate-50 max-h-[160px] overflow-y-auto">
                            {permissions.length > 0 ? (
                                permissions.map((p) => (
                                    <label key={p.permissionId} className="flex items-center gap-2 text-sm text-slate-700">
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
                                <p className="text-xs text-slate-400 italic col-span-2">Loading permissions...</p>
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
                            {loading ? <Loader2 size={16} className="animate-spin" /> : "Create Staff"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
