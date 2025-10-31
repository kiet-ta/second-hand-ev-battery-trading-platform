import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DownOutlined } from "@ant-design/icons";
import { Dropdown, Space } from "antd";

const ProfileDropDown = ({ users, walletBalance }) => {
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        // Giữ lại thông tin remember
        const rememberEmail = localStorage.getItem("rememberEmail");
        const rememberPassword = localStorage.getItem("rememberPassword");

        localStorage.clear(); // Xoá mọi thứ

        // Ghi lại thông tin remember
        if (rememberEmail && rememberPassword) {
            localStorage.setItem("rememberEmail", rememberEmail);
            localStorage.setItem("rememberPassword", rememberPassword);
        }

        setShowLogoutConfirm(false);
        navigate("/login");
    };

    const items = [
        {
            key: "1",
            label: <a href="/profile">{users.fullName}</a>,
        },
        { type: "divider" },
        {
            key: "2",
            label: (
                <a href="/wallet" className="flex gap-2">
                    Ví:
                    <div className="font-semibold">{walletBalance} VND</div>
                </a>
            ),
        },
        {
            key: "3",
            label: <a href="/profile">Profile</a>,
        },
        {
            key: "4",
            label: <a href="/complaint">Gửi yêu cầu</a>,
        },
        {
            key: "5",
            label: (
                <a
                    href="#"
                    onClick={(e) => {
                        e.preventDefault();
                        setShowLogoutConfirm(true);
                    }}
                >
                    Đăng xuất
                </a>
            ),
        },
    ];

    return (
        <>
            {/* Dropdown avatar */}
            <Dropdown menu={{ items }}>
                <a onClick={(e) => e.preventDefault()}>
                    <Space>
                        <div>
                            <img
                                src={
                                    users.avatarProfile ||
                                    "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"
                                }
                                alt={users.fullName}
                                className="w-10 h-10 rounded-full object-cover shadow-md"
                            />
                        </div>
                        <DownOutlined />
                    </Space>
                </a>
            </Dropdown>

            {/* Modal xác nhận đăng xuất */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 shadow-lg text-center max-w-sm w-full">
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">
                            Đăng xuất
                        </h3>
                        <p className="text-slate-600 mb-4">
                            Bạn có chắc muốn đăng xuất không?
                        </p>
                        <div className="flex justify-center gap-3">
                            <button
                                className="px-4 py-2 text-sm rounded-md border border-slate-300 hover:bg-slate-100"
                                onClick={() => setShowLogoutConfirm(false)}
                            >
                                Hủy
                            </button>
                            <button
                                className="px-4 py-2 text-sm rounded-md bg-red-500 text-white hover:bg-red-600"
                                onClick={handleLogout}
                            >
                                Đăng xuất
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ProfileDropDown;
