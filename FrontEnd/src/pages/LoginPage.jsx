import React, { useEffect, useState, useRef } from 'react';
import Logo from '../assets/images/Logo.png';
import { fakeUser } from "../fakeUser";
import '../App.css';
import '../assets/styles/LoginPage.css';
import banner1 from '../assets/images/banner1.png';
import banner2 from '../assets/images/banner2.png';
import banner3 from '../assets/images/banner3.png';
import { Link } from 'react-router-dom';


export default function LoginPage() {
    const clientId =
        import.meta.env.VITE_GOOGLE_CLIENT_ID ||
        '574647661928-vh01sb0pk7e8d6gdbkbfth60m2r9guq9.apps.googleusercontent.com';

    const [user, setUser] = useState(null); // cho cả Google + Local
    const [username, setUsername] = useState('');
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
    const handleLocalLogin = (e) => {
        e.preventDefault();

        if (
            (username === fakeUser.email || username === fakeUser.name) &&
            password === fakeUser.password
        ) {
            localStorage.setItem("user", JSON.stringify(fakeUser));
            setUser(fakeUser);
            console.log(fakeUser);
            alert("Đăng nhập thành công!");
        } else {
            setError("Wrong!");
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
            <Link to='/'>             <header className="login-header">
                <img src={Logo} alt="Logo" className="logo" />
                <h1>Cóc Mua Xe</h1>
            </header>
</Link>

            {/* Nội dung chính: banner + form */}
            <div className="main-content-login flex">
                {/* Banner bên trái */}
                <div className="banner-container w-1/2">
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
                <div className="login-right w-1/2">
                    <div className="login-box">
                        {!user ? (
                            <>
                                <form onSubmit={handleLocalLogin}>
                                    <p className='header-login'>Sign In</p>
                                    <input
                                        type="text"
                                        placeholder="Phone number / Username / Email"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="login-input"
                                    />
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="login-input"
                                    />
                                    <button type="submit" className="login-btn">
                                        SIGN IN
                                    </button>
                                </form>

                                {error && <p style={{ color: "red" }}>{error}</p>}

                                <a href="#" className="forgot-password">
                                    Forgot Password
                                </a>

                                <div className="divider">
                                    <span>OR</span>
                                </div>

                                <div className="social-login">
                                    <div ref={googleButtonRef} />
                                </div>

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
