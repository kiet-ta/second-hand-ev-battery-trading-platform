import React, { useEffect, useState, useRef } from 'react';
import Logo from '../components/Logo';
import '../assets/styles/LoginPage.css';
import banner1 from '../assets/images/banner1.png';
import banner2 from '../assets/images/banner2.png';
import banner3 from '../assets/images/banner3.png';
import { Link, useNavigate } from 'react-router-dom';
import { Popover } from 'antd';
import authApi from '../api/authApi'
import { Modal } from "antd";
import Swal from "sweetalert2";
import { FaRegEyeSlash, FaRegEye } from "react-icons/fa";
import PasswordInput from '../components/PasswordInput';

export default function RegisterPage() {
    const clientId =
        import.meta.env.VITE_GOOGLE_CLIENT_ID ||
        '301055344643-gel1moqvoq9flgf8978aje7j9frtci79.apps.googleusercontent.com';

    const [user, setUser] = useState(null);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [fullname, setFullname] = useState('');
    const [currentSlide, setCurrentSlide] = useState(0);
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const googleButtonRef = useRef(null);
    const navigate = useNavigate();
    const slides = [
        {
            id: 1,
            image: banner1,
        },
        {
            id: 2,
            image: banner2,
            alt: "VinFast electric vehicles"
        },
        {
            id: 3,
            image: banner3,
            alt: "Xe đạp - Xe điện Vĩnh Trường"
        }
    ];

    useEffect(() => {
        const slideInterval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000); // 5 giây

        return () => clearInterval(slideInterval);
    }, [slides.length]);

    useEffect(() => {
        const id = 'google-identity-script';
        if (document.getElementById(id)) {
            initGSI();
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client?hl=en';
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

    function parseJwt(token) {
        try {
            const payload = token.split('.')[1];
            const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map(
                        (c) =>
                            '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
                    )
                    .join('')
            );
            return JSON.parse(jsonPayload);
        } catch (e) {
            return null;
        }
    }

    function initGSI() {
        if (!window.google?.accounts?.id) return;
        window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredentialResponse,
        });
        if (googleButtonRef.current) {
            window.google.accounts.id.renderButton(googleButtonRef.current, {
                theme: 'outline',
                size: 'large',
                text: 'signin_with',
                hl: 'en',
            });
        }
    }

    function handleCredentialResponse(response) {
        const profile = parseJwt(response.credential);
        if (profile) {
            setUser({
                id: profile.sub,
                email: profile.email,
                name: profile.name,
                picture: profile.picture,
                token: response.credential,
            });
        }
    }

    function signOut() {
        if (user?.token) {
            fetch(`https://oauth2.googleapis.com/revoke?token=${user.token}`, {
                method: 'POST',
                headers: {
                    'Content-type': 'application/x-www-form-urlencoded',
                },
            }).finally(() => {
                setUser(null);
                initGSI();
            });
        } else {
            setUser(null);
            initGSI();
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();

        if (!email || !password || !confirmPassword || !fullname) {
            setError("Please enter complete information!");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("Email is not valid!");
            return;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
        if (!passwordRegex.test(password)) {
            setError("Password must be ≥8 characters, contain uppercase, lowercase, numbers and special characters!");
            return;
        }

        if (password !== confirmPassword) {
            setError("Re-entered password does not match!");
            return;
        }

        setError("");
        setLoading(true);

        try {
            // 🟩 1️⃣ Gọi API đăng ký
            const newUser = {
                userId: 0,
                fullName: fullname,
                email,
                password,
                confirmPassword,
            };

            const res = await authApi.register(newUser);
            console.log("✅ Register success:", res);

            const { success, data } = res;

            if (!success || !data?.token) {
                throw new Error("Register failed: No token returned");
            }

            // 🟩 2️⃣ Lưu token và user info vào localStorage
            localStorage.setItem("token", data.token);
            localStorage.setItem("userId", data.userId);
            localStorage.setItem("fullname", data.fullName);
            localStorage.setItem("email", data.email);
            localStorage.setItem("role", data.role);
            localStorage.setItem("expiresAt", data.expiresAt);

            // 🟩 3️⃣ Hiển thị popup cực đẹp
            Swal.fire({
                icon: "success",
                title: "🎉 Đăng ký & đăng nhập thành công!",
                html: `
                <p style="font-size: 16px; color: #444;">Chào mừng <b>${data.fullName}</b> đến với <b style="color:#4F39F6;">Cóc Mua Xe</b>!</p>
                <p style="color:#666;">Hệ thống đang chuyển bạn đến trang chủ...</p>
            `,
                background: "#fff",
                color: "#333",
                confirmButtonColor: "#4F39F6",
                confirmButtonText: "Vào trang chủ ngay",
                showConfirmButton: false,
                timer: 2500,
                timerProgressBar: true,
            });

            // 🟩 4️⃣ Tự động chuyển sang trang chủ
            setTimeout(() => navigate("/"), 2500);
        } catch (err) {
            console.error("❌ Register error:", err);

            Swal.fire({
                icon: "error",
                title: "Đăng ký thất bại 😥",
                html: `<p style="color:#555;">${err.message || "Vui lòng kiểm tra lại thông tin hoặc thử lại sau."}</p>`,
                confirmButtonColor: "#4F39F6",
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="login-container">
            {/* Header */}
            <header className="bg-maincolor">
                <div className="w-1/4 h-full flex justify-start"><Logo></Logo></div>
            </header>

            {/* Nội dung chính: banner + form */}
            <div className="login-main">
                {/* Banner bên trái */}
                <div className="banner-container">
                    <div className="relative w-full h-full">
                        {slides.map((slide, index) => (
                            <div
                                key={slide.id}
                                className={`banner-slide ${index === currentSlide ? 'active' : ''}`}
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

                                <p className="signup-link">
                                    Already have an account?  <Link to="/login">Sign In</Link>
                                </p>
                                <form onSubmit={handleSubmit}>
                                    <p className='header-login'>Sign Up</p>
                                    <input
                                        type="text"
                                        placeholder="Full Name"
                                        value={fullname}
                                        onChange={(e) => setFullname(e.target.value)}
                                        className="login-input"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Email"
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

                                    <input
                                        type="password"
                                        placeholder="Re-enter password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
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
                                            SIGN UP
                                        </button>
                                    </Popover>
                                </form>

                                <div className="divider">
                                    <span>OR</span>
                                </div>

                                {/* <div className="social-login">
                                    <div ref={googleButtonRef} />
                                </div> */}


                            </>
                        ) : (
                            <div className="user-info">
                                <img src={user.picture} alt="avatar" className="avatar" />
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