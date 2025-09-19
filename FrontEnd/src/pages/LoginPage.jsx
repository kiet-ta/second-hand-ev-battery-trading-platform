import React, { useEffect, useState, useRef } from 'react';
import Logo from '../assets/images/Logo.png';
import '../assets/styles/LoginPage.css'; // Create a CSS file for styling
import banner1 from '../assets/images/banner1.png';
import banner2 from '../assets/images/banner2.png';
import banner3 from '../assets/images/banner3.png';

export default function LoginPage() {
    const clientId =
        import.meta.env.VITE_GOOGLE_CLIENT_ID ||
        '301055344643-gel1moqvoq9flgf8978aje7j9frtci79.apps.googleusercontent.com';

    const [user, setUser] = useState(null);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [currentSlide, setCurrentSlide] = useState(0);
    const googleButtonRef = useRef(null);

    const slides = [
        {
            id: 1,
            image: banner1,
            alt: "Xe điện nhập khẩu chính hãng"
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

    function handleSubmit(e) {
        e.preventDefault();
        // TODO: call your backend login API here
        console.log('Local login with', { username, password });
    }

    return (
        <div className="login-container">
            {/* Header */}
            <header className="login-header">
                <img src={Logo} alt="Logo" className="logo" />
                <h1>Cóc Mua Xe</h1>
                <h2>Sign in</h2>
            </header>

            {/* Nội dung chính: banner + form */}
            <div className="main-content">
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
                                <form onSubmit={handleSubmit}>
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
                                    Are you new? <a href="#">Create an account</a>
                                </p>
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