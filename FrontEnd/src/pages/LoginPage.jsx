import React, { useEffect, useState, useRef } from "react";
import Logo from "../components/Logo";
import "../assets/styles/LoginPage.css";
import banner1 from "../assets/images/banner1.png";
import banner2 from "../assets/images/banner2.png";
import banner3 from "../assets/images/banner3.png";
import authApi from "../api/authApi";
import { Link, useNavigate } from "react-router-dom";
import { message, Popover } from "antd";

export default function LoginPage() {
    const navigate = useNavigate();
    const clientId =
        import.meta.env.VITE_GOOGLE_CLIENT_ID;

    const [user, setUser] = useState(null);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [currentSlide, setCurrentSlide] = useState(0);
    const googleButtonRef = useRef(null);

    const slides = [
        { id: 1, image: banner1, alt: "Xe điện nhập khẩu chính hãng" },
        { id: 2, image: banner2, alt: "VinFast electric vehicles" },
        { id: 3, image: banner3, alt: "Xe đạp - Xe điện Vĩnh Trường" },
    ];

    // Banner auto slide
    useEffect(() => {
        const slideInterval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(slideInterval);
    }, [slides.length]);

    // Load Google Identity script
    useEffect(() => {
        const id = "google-identity-script";
        if (document.getElementById(id)) {
            initGSI();
            return;
        }
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client?hl=en";
        script.async = true;
        script.id = id;
        script.onload = () => initGSI();
        document.body.appendChild(script);
    }, []);

    useEffect(() => {
        if (!user && googleButtonRef.current) {
            initGSI();
        }
    }, [user]);

    // Parse JWT (dành cho local login)
    function parseJwt(token) {
        try {
            const payload = token.split(".")[1];
            const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split("")
                    .map(
                        (c) =>
                            "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
                    )
                    .join("")
            );
            return JSON.parse(jsonPayload);
        } catch (e) {
            console.error("JWT decoding failed:", e);
            return null;
        }
    }

    // Initialize Google Identity Services
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

    // ✅ Handle Google Login success
    async function handleCredentialResponse(response) {
        const googleToken = response.credential;

        try {
            const res = await fetch("https://localhost:7272/api/Auth/google", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ credential: googleToken }),
            });

            if (!res.ok) {
                const errText = await res.text();
                throw new Error(`Google login failed: ${errText}`);
            }

            const data = await res.json();
            if (!data.success || !data.data) {
                throw new Error(data.message || "Invalid Google login response");
            }

            const userData = data.data;

            // Lưu thông tin user vào localStorage
            localStorage.setItem("token", userData.token);
            localStorage.setItem("userId", userData.userId);
            localStorage.setItem("user", JSON.stringify(userData));

            message.success("Đăng nhập Google thành công!");

            // Chuyển hướng theo vai trò
            const role = userData.role?.toLowerCase();
            if (role === "manager" || role === "staff") navigate("/manage");
            else if (role === "seller") navigate("/seller");
            else navigate("/");

        } catch (err) {
            console.error("Google Login Error:", err);
            message.error("Đăng nhập Google thất bại. Vui lòng thử lại!");
        }
    }

    // Local login (email/password)
    const handleLocalLogin = async (e) => {
        e.preventDefault();
        setError("");

        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();

        if (!trimmedEmail || !trimmedPassword) {
            setError("Please enter all login information.");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (trimmedEmail.includes("@") && !emailRegex.test(trimmedEmail)) {
            setError("Invalid email.");
            return;
        }
        if (trimmedPassword.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        try {
            const data = await authApi.login(trimmedEmail, trimmedPassword);
            const res = data.data;

            const newUser = {
                ...res.user,
                userId: res.userId,
                token: res.token,
            };

            localStorage.setItem("userId", res.userId);
            localStorage.setItem("token", res.token);
            setUser(newUser);
            message.success("Login successful!");

            const decodedToken = parseJwt(res.token);
            const role = decodedToken?.role?.toLowerCase();
            if (role === "manager" || role === "staff") navigate("/manage");
            else if (role === "seller") navigate("/seller");
            else navigate("/");

        } catch (err) {
            console.error("Login error:", err);
            setError("Incorrect login information.");
        }
    };

    // Đăng xuất
    function signOut() {
        if (user?.token) {
            fetch(`https://oauth2.googleapis.com/revoke?token=${user.token}`, {
                method: "POST",
                headers: {
                    "Content-type": "application/x-www-form-urlencoded",
                },
            }).finally(() => {
                setUser(null);
                localStorage.removeItem("user");
                initGSI();
            });
        } else {
            setUser(null);
            localStorage.removeItem("user");
            initGSI();
        }
    }

    return (
        <div className="login-container">
            {/* Header */}
            <header className="bg-maincolor">
                <div className="w-1/4 h-full flex justify-start">
                    <Logo />
                </div>
            </header>

            {/* Nội dung chính */}
            <div className="login-main">
                {/* Banner bên trái */}
                <div className="banner-container">
                    <div className="relative w-full h-full">
                        {slides.map((slide, index) => (
                            <div
                                key={slide.id}
                                className={`banner-slide ${index === currentSlide ? "active" : ""
                                    }`}
                            >
                                <img src={slide.image} alt={slide.alt} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form login bên phải */}
                <div className="login-right">
                    <div className="login-box">
                        {!user ? (
                            <>
                                <form onSubmit={handleLocalLogin}>
                                    <p className="header-login">Sign In</p>

                                    <input
                                        type="text"
                                        placeholder="Phone number / Username / Email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="login-input"
                                    />
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="login-input"
                                    />

                                    <Popover
                                        content={error}
                                        trigger="click"
                                        open={!!error}
                                        onOpenChange={(visible) => {
                                            if (!visible) setError("");
                                        }}
                                    >
                                        <button type="submit" className="login-btn">
                                            SIGN IN
                                        </button>
                                    </Popover>
                                </form>

                                <div className="divider">
                                    <span>OR</span>
                                </div>

                                {/* Nút Google Login */}
                                <div className="social-login">
                                    <div ref={googleButtonRef} />
                                </div>

                                <p className="signup-link">
                                    Are you new?{" "}
                                    <Link to="/register">Create an account</Link>
                                </p>
                            </>
                        ) : (
                            <div className="user-info">
                                <img
                                    src={
                                        user.picture ||
                                        "https://via.placeholder.com/50"
                                    }
                                    alt="avatar"
                                    className="avatar"
                                />
                                <div>
                                    <strong>{user.name}</strong>
                                    <p>{user.email}</p>
                                </div>
                                <button onClick={signOut} className="logout-btn">
                                    Sign out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
