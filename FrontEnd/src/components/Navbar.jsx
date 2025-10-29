import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Logo from './Logo';
import walletApi from '../api/walletApi';
import NotificationDropdown from './DropDowns/NotificationDropdown';
import ProfileDropDown from './DropDowns/ProfileDropDown';
import { IoMdHome } from "react-icons/io";
import { RiAuctionFill } from "react-icons/ri";
import { FaShoppingCart, FaSuitcase } from "react-icons/fa";
import { FiHeart } from "react-icons/fi";

function Navbar({ data }) {
    const navigate = useNavigate();
    const [walletBalance, setWalletBalance] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const userId = localStorage.getItem("userId");
            if (userId && data) { // Only fetch if user is logged in
                try {
                    const walletData = await walletApi.getWalletByUser(userId);
                    setWalletBalance(walletData.balance);
                } catch (error) {
                    console.error("Lỗi khi tải số dư ví:", error);
                }
            } else {
                setWalletBalance(null); // Clear balance if user logs out
            }
        };
        fetchData();
    }, [data]); // Refetch when user data (login state) changes

    const handleSellerClick = (e) => {
        e.preventDefault();
        const jwt = localStorage.getItem("token");
        if (!jwt) {
            navigate('/login');
            return;
        }
        try {
            const decodeJWT = jwtDecode(jwt);
            if (decodeJWT.role === "buyer") {
                navigate('/seller-registration');
            } else {
                // Navigate to manager page if role is Manager
                if (decodeJWT.role === "Manager") {
                    navigate('/manage');
                } else {
                    navigate('/seller');
                }
            }
        } catch (error) {
            console.error("Invalid token:", error);
            // Clear potentially invalid token/userId and redirect
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            navigate('/login');
        }
    };

    const leftmenu = [
        { name: 'Trang Chủ', link: '/', icon: <IoMdHome /> },
        { name: 'Đấu Giá', link: '/auctions', icon: <RiAuctionFill /> }
    ];

    const navBg = 'bg-[#FAF8F3]';
    const textPrimary = 'text-[#2C2C2C]';
    const textHover = 'hover:text-[#B8860B]';
    const borderColor = 'border-[#C4B5A0]';

    return (
        <header className={`${navBg} ${textPrimary} w-full shadow-sm border-b-2 ${borderColor}`}>
            <div className="max-w-7xl mx-auto px-4 flex flex-col"> {/* Use px-4 consistent with footer/homepage */}
                <div className="flex items-center justify-between w-full h-10 py-2"> {/* Adjusted height and padding */}
                    <div className="flex items-center">
                        {leftmenu.map((item) => (
                            <Link key={item.name} to={item.link} className={`mr-6 ${textHover} flex items-center font-medium transition-colors text-sm`}> {/* Adjusted font size/spacing */}
                                {item.icon}
                                <span className="ml-1.5">{item.name}</span> {/* Adjusted margin */}
                            </Link>
                        ))}
                         <a href="#" onClick={handleSellerClick} className={`ml-4 ${textHover} flex items-center font-medium transition-colors text-sm`}> {/* Adjusted spacing/size */}
                            <FaSuitcase />
                            <span className="ml-1.5">{data?.role === "Manager" ? "Quản Lý" : "Kênh Người Bán"}</span>
                        </a>
                    </div>
                    <div className="flex items-center mt-5">
                        {data ? (
                            <>
                                <NotificationDropdown userId={data.userId} />
                                <div className="ml-5">
                                    <ProfileDropDown users={data} walletBalance={walletBalance} />
                                </div>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className={`mx-3 ${textHover} font-medium transition-colors text-sm`}> {/* Adjusted spacing/size */}
                                    Đăng Nhập
                                </Link>
                                <Link to="/register" className={`mx-3 ${textHover} font-medium transition-colors text-sm`}> {/* Adjusted spacing/size */}
                                    Đăng Ký
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                <div className="w-full flex h-20 items-center">
                    <div className="w-1/4">
                        <Logo />
                    </div>
                    <div className="w-2/4 px-4">
                        <form action='/search' method='GET' className="w-full rounded-lg bg-white relative shadow-md border border-[#E8E4DC]">
                            <input type="text" name="query" placeholder="Tìm kiếm xe điện & pin cao cấp..." className="w-full text-lg p-3 rounded-lg border-none focus:ring-2 focus:ring-[#D4AF37] text-[#2C2C2C] pr-[100px]" /> {/* Adjusted padding */}
                            <div className="absolute right-0 top-0 h-full flex items-center"> {/* Use flex for vertical centering */}
                                <select name="itemType" className="h-full bg-[#D4AF37] text-[#2C2C2C] text-center font-bold border-none rounded-r-lg hover:bg-[#B8860B] transition-colors cursor-pointer px-4 appearance-none"> {/* Added appearance-none */}
                                    <option value="all">Tất cả</option>
                                    <option value="ev">Xe</option>
                                    <option value="battery">Pin</option>
                                </select>
                            </div>
                            <button type="submit" className="hidden">Tìm</button>
                        </form>
                    </div>
                    <div className="w-1/4 flex justify-end items-center">
                        <Link to={'/cart'} className={`mx-4 ${textHover} flex items-center font-medium transition-colors`}>
                            <FaShoppingCart className="text-xl" />
                            <span className="ml-2 text-lg">Giỏ Hàng</span>
                        </Link>
                        <Link to={'/favourite'} className={`mx-4 ${textHover} flex items-center font-medium transition-colors`}>
                            <FiHeart className="text-xl" />
                            <span className="ml-2 text-lg">Yêu Thích</span>
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Navbar;