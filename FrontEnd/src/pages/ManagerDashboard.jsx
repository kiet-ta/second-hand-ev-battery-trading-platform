import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import ManagerLayout from "../layout/ManagerLayout";
import AddStaff from "../components/Manager/AddStaff";

function LogoutConfirmationModal({ onCancel, onConfirm }) {
    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-xl">
                <p className="text-slate-700">Are you sure you want to log out?</p>
                <div className="mt-4 flex justify-end gap-3">
                    <button onClick={onCancel} className="px-4 py-2 border rounded">Cancel</button>
                    <button onClick={onConfirm} className="px-4 py-2 bg-red-500 text-white rounded">Logout</button>
                </div>
            </div>
        </div>
    );
}

export default function ManagerDashboard() {
    const navigate = useNavigate();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [showAddStaffModal, setShowAddStaffModal] = useState(false);

    const handleLogoutConfirm = () => {
        localStorage.clear();
        navigate("/login");
    };

    const handleAddStaff = () => setShowAddStaffModal(true);
    const handleCloseAddStaff = () => setShowAddStaffModal(false);
    const handleRefresh = () => window.location.reload();

    return (
        <ManagerLayout
            onAddStaff={handleAddStaff}
            onLogout={() => setShowLogoutConfirm(true)}
            onRefresh={handleRefresh}
        >


            <AnimatePresence>
                {showLogoutConfirm && (
                    <LogoutConfirmationModal
                        onCancel={() => setShowLogoutConfirm(false)}
                        onConfirm={handleLogoutConfirm}
                    />
                )}

                {showAddStaffModal && (
                    <AddStaff
                        isOpen={showAddStaffModal}
                        onClose={handleCloseAddStaff}
                        onSuccess={handleCloseAddStaff}
                    />
                )}
            </AnimatePresence>
        </ManagerLayout>
    );
}
