import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ProfileContent from './pages/ProfileContent.jsx';
import UserManagementSystem from './pages/UserManagementSystem.jsx';

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile" element={<ProfileContent />} />
            <Route path="/manage" element={<UserManagementSystem />} />
        </Routes>
    );
}

export default App
