import React, { useEffect, useState, useRef } from 'react';
import Logo from '../components/Logo';
import '../assets/styles/LoginPage.css';
import banner1 from '../assets/images/banner1.png';
import banner2 from '../assets/images/banner2.png';
import banner3 from '../assets/images/banner3.png';
import authApi from '../api/authApi';
import { Link, useNavigate } from 'react-router-dom';
import { message, Popover } from "antd";

export default function LoginPage() {
    const navigate = useNavigate();
    const clientId =
        import.meta.env.VITE_GOOGLE_CLIENT_ID ||
        '301055344643-gel1moqvoq9flgf8978aje7j9frtci79.apps.googleusercontent.com';

    const [user, setUser] = useState(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const [currentSlide, setCurrentSlide] = useState(0);
    const googleButtonRef = useRef(null);

    const slides = [
        { id: 1, image: banner1, alt: "Xe điện nhập khẩu chính hãng" },
        { id: 2, image: banner2, alt: "VinFast electric vehicles" },
        { id: 3, image: banner3, alt: "Xe đạp - Xe điện Vĩnh Trường" }
    ];

    // Banner slider
    useEffect(() => {
        const slideInterval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(slideInterval);
    }, [slides.length]);

    // Load Google script
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
            console.error("JWT decoding failed:", e);
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
            const newUser = {
                id: profile.sub,
                email: profile.email,
                name: profile.name,
                picture: profile.picture,
                token: response.credential,
            };
            setUser(newUser);
            localStorage.setItem("user", JSON.stringify(newUser));
        }
    }

    // 👇 FIX: The previously missing logic is completed here
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
            // 1. Call API login
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

            // 2. Decode the JWT to check the role and navigate
            const decodedToken = parseJwt(res.token);
            if (decodedToken && decodedToken.role) {
                const role = decodedToken.role.toLowerCase();

                if (role === 'manager' || role === 'staff') {
                    navigate('/manage');
                } else if (role === 'seller') {
                    navigate('/seller');
                } else {
                    // Default to buyer, check for seller registration status if possible (assuming res.isSellerRegistered exists)
                    // If not registered as a full seller, push them to the onboarding page first.
                    navigate('/');
                }
            } else {
                navigate('/'); // Default to homepage if role is missing
            }

        } catch (err) {
            console.error("Login error:", err);
            setError("Incorrect login information.");
        }
    };


    function signOut() {
        if (user?.token) {
            fetch(`https://oauth2.googleapis.com/revoke?token=${user.token}`, {
                method: 'POST',
                headers: {
                    'Content-type': 'application/x-www-form-urlencoded',
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
                                <form onSubmit={handleLocalLogin}>
                                    <p className='header-login'>Sign In</p>
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

                                {/* <a href="#" className="forgot-password">
                                    Forgot Password
                                </a> */}

                                <div className="divider">
                                    <span>OR</span>
                                </div>

                                {/* <div className="social-login">
                                    <div ref={googleButtonRef} />
                                </div> */}

                                <p className="signup-link">
                                    Are you new? <Link to="/register">Create an account</Link>
                                </p>
                            </>
                        ) : (
                            <div className="user-info">
                                <img src={user.picture || "https://via.placeholder.com/50"} alt="avatar" className="avatar" />
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