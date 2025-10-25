import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { message, Popover } from "antd";
import authApi from "../api/authApi";
import Logo from "../components/Logo";
import RegisterPicture from "../assets/images/LoginPicture.jpg"; // Hình cóc cưỡi xe vàng

export default function RegisterPage() {
    const baseURL = import.meta.env.VITE_API_BASE_URL;
    const navigate = useNavigate();
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const [user, setUser] = useState(null);
    const [fullname, setFullname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const googleButtonRef = useRef(null);

    // Load Google script
    useEffect(() => {
        const id = "google-identity-script";
        if (document.getElementById(id)) {
            initGSI();
            return;
        }
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client?hl=vi";
        script.async = true;
        script.id = id;
        script.onload = () => initGSI();
        document.body.appendChild(script);
    }, []);

    useEffect(() => {
        if (!user && googleButtonRef.current) initGSI();
    }, [user]);

    function initGSI() {
        if (!window.google?.accounts?.id) return;
        window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredentialResponse,
        });
        if (googleButtonRef.current) {
            window.google.accounts.id.renderButton(googleButtonRef.current, {
                theme: "outline",
                size: "large",
                text: "signup_with",
                shape: "rectangular",
                logo_alignment: "center",
                width: "280",
            });
        }
    }

    async function handleCredentialResponse(response) {
        const googleToken = response.credential;
        try {
            const res = await fetch(`${baseURL}Auth/google`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ credential: googleToken }),
            });
            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();
            const userData = data.data;
            localStorage.setItem("token", userData.token);
            localStorage.setItem("userId", userData.userId);
            localStorage.setItem("user", JSON.stringify(userData));
            navigate("/");
        } catch (err) {
            console.error("Google Register Error:", err);
        }
    }

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");

        if (!fullname || !email || !password || !confirmPassword)
            return setError("Vui lòng nhập đầy đủ thông tin.");
        if (password !== confirmPassword)
            return setError("Mật khẩu nhập lại không khớp.");

        try {
            const res = await authApi.register({
                fullName: fullname,
                email,
                password,
                confirmPassword,
            });
            navigate("/login");
        } catch (err) {
            console.error("Register error:", err);
            setError("Đăng ký thất bại. Vui lòng thử lại.");
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFF8E7] px-4">
            {/* Card tổng */}
            <div className="relative bg-white rounded-3xl shadow-xl flex flex-col lg:flex-row items-center justify-between w-full max-w-4xl overflow-hidden">

                {/* Form đăng ký */}
                <div className="w-full lg:w-1/2 p-10">
                    {!user ? (
                        <form onSubmit={handleRegister} className="space-y-4">
                            <h2 className="text-3xl font-semibold text-gray-800">Đăng ký</h2>
                            <p className="text-gray-500 mb-6">
                                Tạo tài khoản để bắt đầu cùng Cóc Mua Xe.
                            </p>

                            <input
                                type="text"
                                placeholder="Họ và tên"
                                value={fullname}
                                onChange={(e) => setFullname(e.target.value)}
                                className="w-full border border-gray-300 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                            />

                            <input
                                type="text"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full border border-gray-300 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                            />

                            <input
                                type="password"
                                placeholder="Mật khẩu"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full border border-gray-300 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                            />

                            <input
                                type="password"
                                placeholder="Nhập lại mật khẩu"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full border border-gray-300 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                            />

                            <Popover
                                content={error}
                                trigger="click"
                                open={!!error}
                                onOpenChange={(visible) => !visible && setError("")}
                            >
                                <button
                                    type="submit"
                                    className="w-full bg-[#D4AF37] hover:bg-[#C19A32] text-white font-semibold py-3 rounded-xl transition-all"
                                >
                                    Đăng ký
                                </button>
                            </Popover>

                            <div className="flex items-center my-4">
                                <div className="flex-grow h-px bg-gray-300" />
                                <span className="mx-3 text-gray-400 text-sm">hoặc</span>
                                <div className="flex-grow h-px bg-gray-300" />
                            </div>

                            <div className="flex justify-center">
                                <div ref={googleButtonRef} />
                            </div>

                            <p className="text-center text-sm text-gray-600 mt-6">
                                Đã có tài khoản?{" "}
                                <Link
                                    to="/login"
                                    className="!text-[#D4AF37] hover:underline font-medium"
                                >
                                    Đăng nhập
                                </Link>
                            </p>
                        </form>
                    ) : (
                        <div className="text-center">
                            <p>Xin chào, {user.name}</p>
                        </div>
                    )}
                </div>

                {/* Ảnh minh họa */}
                <div className="relative w-full lg:w-1/2 flex items-center justify-center bg-white">
                    <img
                        src={RegisterPicture}
                        alt="Hình minh họa Cóc Mua Xe"
                        className="w-[360px] h-auto object-contain drop-shadow-md mix-blend-multiply"
                    />
                </div>
            </div>
        </div>
    );
}
