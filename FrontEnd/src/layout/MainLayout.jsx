import React, { useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ScrollToTop from "../components/ScrollToTop";
import userApi from "../api/userApi";

function MainLayout() {
    const [userProfile, setUser] = useState(null);
    const location = useLocation(); // Dùng để biết đang ở trang nào

    const fetchUser = async () => {
        const currentUserId = localStorage.getItem("userId");
        const token = localStorage.getItem("token");

        if (!currentUserId || !token) {
            localStorage.removeItem("userId");
            localStorage.removeItem("token");
            setUser(null);
            return;
        }

        try {
            const user = await userApi.getUserByID(currentUserId);
            setUser(user);
        } catch (error) {
            console.error("Error fetching user profile:", error);
            localStorage.removeItem("userId");
            localStorage.removeItem("token");
            setUser(null);
        }
    };

    useEffect(() => {
        fetchUser();

        const handleStorageChange = (event) => {
            if (event.key === "userId" || event.key === "token") {
                fetchUser();
            }
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    const mainRef = useRef(null);

    const isComparePage = location.pathname.startsWith("/compare");

    return (
        <div className="flex flex-col min-h-screen bg-[#FAF8F3]">
            <ScrollToTop />
            <Navbar data={userProfile} />

            {/* MAIN CONTENT */}
            <main
                ref={mainRef}
                className={`flex-grow transition-all duration-300 ${isComparePage
                    ? "bg-transparent px-0 py-0" // Full width, bỏ padding & nền
                    : "container mx-auto px-6 py-8"
                    }`}
            >
                <Outlet />
            </main>

            <Footer />
        </div>
    );
}

export default MainLayout;
