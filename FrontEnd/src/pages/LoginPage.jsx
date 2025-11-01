import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { message, Popover } from "antd";
import authApi from "../api/authApi";
import LoginPicture from "../assets/images/LoginPicture.jpg";

export default function LoginPage() {
    const navigate = useNavigate();
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const [user, setUser] = useState(null);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(false);
    const [error, setError] = useState("");
    const baseURL = import.meta.env.VITE_API_BASE_URL;
    const googleButtonRef = useRef(null);

    // Khi load lại trang, nếu có remember data thì tự điền
    useEffect(() => {
        const savedEmail = localStorage.getItem("rememberEmail");
        const savedPassword = localStorage.getItem("rememberPassword");
        if (savedEmail && savedPassword) {
            setEmail(savedEmail);
            setPassword(savedPassword);
            setRemember(true);
        }
    }, []);

    // Load script Google
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
                text: "signin_with",
                shape: "rectangular",
                logo_alignment: "center",
                width: "280",
            });
        }
    }

    // Login bằng Google
    async function handleCredentialResponse(response) {
        const googleToken = response.credential;
        try {
            const res = await fetch(`${baseURL}auth/tokens/google`, {
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
            message.success("Đăng nhập bằng Google thành công!");

            const role = userData.role?.toLowerCase();
            if (role === "manager" || role === "staff") navigate("/manage");
            else if (role === "seller") navigate("/seller");
            else navigate("/");
        } catch (err) {
            console.error("Google Login Error:", err);
        }
    }

    // Login thủ công
    const handleLocalLogin = async (e) => {
        e.preventDefault();
        setError("");

        if (!email || !password)
            return setError("Vui lòng nhập đầy đủ thông tin đăng nhập.");
        if (password.length < 6)
            return setError("Mật khẩu phải có ít nhất 6 ký tự.");

        try {
            const data = await authApi.login({ email: email.trim(), password: password.trim() });

            // ✅ Trích xuất data
            const res = data.data;
            const newUser = { ...res, token: res.token };

            // 💾 Lưu token + user
            localStorage.setItem("userId", res.userId);
            localStorage.setItem("token", res.token);
            localStorage.setItem("user", JSON.stringify(newUser));

            message.success("Đăng nhập thành công!");
            setUser(newUser);

            // ✅ Lưu “Ghi nhớ đăng nhập”
            if (remember) {
                localStorage.setItem("rememberEmail", email);
                localStorage.setItem("rememberPassword", password);
            } else {
                localStorage.removeItem("rememberEmail");
                localStorage.removeItem("rememberPassword");
            }

            // ✅ Điều hướng theo vai trò
            const role = res.role?.toLowerCase();
            if (role === "manager" || role === "staff") navigate("/manage");
            else if (role === "seller") navigate("/seller");
            else navigate("/");
        } catch (err) {
            console.error("Login error:", err);
            setError("Thông tin đăng nhập không chính xác.");
        }
    };


    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFF8E7] px-4">
            <div className="relative bg-white rounded-3xl shadow-xl flex flex-col lg:flex-row items-center justify-between w-full max-w-4xl overflow-hidden">
                {/* Form đăng nhập */}
                <div className="w-full lg:w-1/2 p-10">
                    {!user ? (
                        <form onSubmit={handleLocalLogin} className="space-y-4">
                            <h2 className="text-3xl font-semibold text-gray-800">Đăng nhập</h2>
                            <p className="text-gray-500 mb-6">
                                Chào mừng bạn quay lại! Vui lòng nhập thông tin để tiếp tục.
                            </p>

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

                            <div className="flex justify-between items-center text-sm">
                                <label className="flex items-center gap-2 text-gray-600">
                                    <input
                                        type="checkbox"
                                        checked={remember}
                                        onChange={(e) => setRemember(e.target.checked)}
                                        className="accent-[#D4AF37]"
                                    />
                                    Ghi nhớ đăng nhập
                                </label>

                                <Link
                                    to="/forgot-password"
                                    className="text-gray-500 hover:text-[#D4AF37] transition-colors"
                                >
                                    Quên mật khẩu?
                                </Link>
                            </div>

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
                                    Đăng nhập
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
                                Chưa có tài khoản?{" "}
                                <Link
                                    to="/register"
                                    className="!text-[#D4AF37] hover:underline font-medium"
                                >
                                    Đăng ký ngay
                                </Link>
                            </p>
                        </form>
                    ) : (
                        <div className="text-center">
                            <p>Xin chào, {user.fullName}</p>
                        </div>
                    )}
                </div>

                {/* Ảnh minh họa */}
                <div className="relative w-full lg:w-1/2 flex items-center justify-center bg-white">
                    <img
                        src={LoginPicture}
                        alt="Hình minh họa Cóc Mua Xe"
                        className="w-[360px] h-auto object-contain drop-shadow-md mix-blend-multiply"
                    />
                </div>
            </div>
        </div>
    );
}
