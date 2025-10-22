import React, { useEffect, useRef, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ScrollToTop from '../components/ScrollToTop';
import userApi from '../api/userApi';

function MainLayout() {
    const [userProfile, setUser] = useState(null);

    const fetchUser = async () => {
        const currentUserId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');

        if (!currentUserId || !token) {
            localStorage.removeItem('userId');
            localStorage.removeItem('token');
            setUser(null);
            return;
        }

        try {
            const user = await userApi.getUserByID(currentUserId);
            setUser(user);
        } catch (error) {
            console.error("Error fetching user profile:", error);
            localStorage.removeItem('userId');
            localStorage.removeItem('token');
            setUser(null);
        }
    };

    useEffect(() => {
        fetchUser();

        const handleStorageChange = (event) => {
            if (event.key === 'userId' || event.key === 'token') {
                fetchUser();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const mainRef = useRef(null);

    return (
        <div className="flex flex-col min-h-screen bg-[#FAF8F3]">
            <ScrollToTop />
            <Navbar data={userProfile} />

            {/* Main content grows to fill space */}
            <main ref={mainRef} className="flex-grow">
                <Outlet />
            </main>

            <Footer />
        </div>
    );
}

export default MainLayout;
