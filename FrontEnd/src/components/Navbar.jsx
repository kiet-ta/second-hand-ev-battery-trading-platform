import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { Input, Select, message } from "antd";
import { BsGrid } from "react-icons/bs";
import {
  FaCar,
  FaBatteryFull,
  FaCubes,
  FaSearch,
  FaShoppingCart,
  FaSuitcase,
  FaShoppingBasket,
} from "react-icons/fa";
import { FiHeart } from "react-icons/fi";
import { IoMdHome } from "react-icons/io";
import { RiAuctionFill } from "react-icons/ri";
import { IoHelp } from "react-icons/io5";
import Logo from "./Logo";
import walletApi from "../api/walletApi";
import NotificationDropdown from "./DropDowns/NotificationDropdown";
import ProfileDropDown from "./DropDowns/ProfileDropDown";
import userApi from "../api/userApi";

const { Option } = Select;

function Navbar({ data }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [walletBalance, setWalletBalance] = useState(null);
  const [query, setQuery] = useState("");
  const [itemType, setItemType] = useState("all");

  // ✅ Initialize query + itemType on first mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setQuery(params.get("query") || "");
    setItemType(params.get("itemType") || "all");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ Sync input when user navigates to a different search page (not typing)
  useEffect(() => {
    // Only react to URL changes *after navigation*, not while typing
    const params = new URLSearchParams(location.search);
    const newQuery = params.get("query") || "";
    const newType = params.get("itemType") || "all";

    // if pathname = /search and user didn't just type, sync query
    if (location.pathname === "/search") {
      // Only update if URL differs from input
      if (newQuery !== query) setQuery(newQuery);
      if (newType !== itemType) setItemType(newType);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  // ✅ Fetch wallet balance
  useEffect(() => {
    const fetchData = async () => {
      const userId = localStorage.getItem("userId");
      if (userId && data) {
        try {
          const walletData = await walletApi.getWalletByUser(userId);
          setWalletBalance(walletData.balance);
        } catch (error) {
          console.error("Lỗi khi tải số dư ví:", error);
        }
      } else {
        setWalletBalance(null);
      }
    };
    fetchData();
  }, [data]);

  // ✅ Seller click logic
  const handleSellerClick = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      message.warning("Vui lòng đăng nhập để truy cập kênh người bán");
      return navigate("/login");
    }

    try {
      const userId = localStorage.getItem('userId');

      const userRole = await userApi.getUserByID(userId).then(user => user.role);
      if (userRole === "Buyer") navigate("/seller-registration");
      else if (userRole === "Manager") navigate("/manage");
      else navigate("/seller");
    } catch (error) {
      console.error("Invalid token:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      navigate("/login");
    }
  };

  // ✅ Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/search?query=${encodeURIComponent(query)}&itemType=${itemType}`);
  };

  const leftmenu = [
    { name: "Trang Chủ", link: "/", icon: <IoMdHome /> },
    { name: "Đấu Giá", link: "/auctions", icon: <RiAuctionFill /> },
  ];

  return (
    <header className="bg-[#FAF8F3] text-[#2C2C2C] w-full shadow-sm border-b border-[#E0DCCF]">
      <div className="max-w-7xl mx-auto px-4 flex flex-col">
        {/* ==== TOP NAV ==== */}
        <div className="flex items-center justify-between w-full py-2">
          {/* Left Nav */}
          <div className="flex items-center">
            {leftmenu.map((item) => (
              <Link
                key={item.name}
                to={item.link}
                className="mr-6 hover:text-[#B8860B] flex items-center font-medium text-sm transition-colors"
              >
                {item.icon}
                <span className="ml-1.5">{item.name}</span>
              </Link>
            ))}
            <button
              onClick={handleSellerClick}
              className="ml-4 hover:text-[#B8860B] flex items-center font-medium text-sm transition-colors"
            >
              <FaSuitcase />
              <span className="ml-1.5">
                {data?.role === "Manager" ? "Quản Lý" : "Kênh Người Bán"}
              </span>
            </button>
          </div>

          {/* Right Nav */}
          <div className="flex items-center">
            {data ? (
              <>
                <Link
                  className="mx-3 gap-2 hover:text-[#B8860B] font-medium text-sm flex"
                  to="/complaint"
                >
                  <IoHelp /> Gửi yêu cầu
                </Link>
                <Link
                  className="flex items-center mx-3 gap-2 hover:text-[#B8860B] font-medium text-sm transition-colors"
                  to="/profile/purchase"
                >
                  <FaShoppingBasket /> Đơn hàng của tôi
                </Link >
                <NotificationDropdown userId={data.userId} className="flex items-center mx-3 gap-2 hover:text-[#B8860B] font-medium text-sm transition-colors" />
                <div className="mx-3">
                  <ProfileDropDown users={data} walletBalance={walletBalance} />
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="mx-3 hover:text-[#B8860B] font-medium text-sm"
                >
                  Đăng Nhập
                </Link>
                <Link
                  to="/register"
                  className="mx-3 hover:text-[#B8860B] font-medium text-sm"
                >
                  Đăng Ký
                </Link>
              </>
            )}
          </div>
        </div>

        {/* ==== MAIN NAV WITH SEARCH ==== */}
        <div className="w-full flex items-center py-3">
          {/* Logo */}
          <div className="w-1/4">
            <Logo />
          </div>

          {/* Search Bar */}
          <div className="w-2/4 px-4 relative ">
            <form
              onSubmit={handleSearch}
              className="flex items-center bg-white border border-[#E8E4DC] rounded-full shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg"
            >
              <Input
                placeholder="Tìm kiếm xe điện, pin, phụ kiện..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onPressEnter={handleSearch}
                bordered={false}
                className="rounded-l-full px-5 py-2.5 text-base placeholder-gray-400 focus:ring-0 focus:outline-none flex-grow"
                prefix={<FaSearch className="text-[#C99700] mr-2" />}
              />

              <Select
                value={itemType}
                onChange={(value) => setItemType(value)}
                bordered={false}
                dropdownStyle={{
                  borderRadius: "12px",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
                  padding: "6px",
                }}
                popupClassName="rounded-lg"
                style={{
                  width: 130,
                  height: "44px",
                  display: "flex",
                  alignItems: "center",
                  borderLeft: "1px solid #eee",
                  backgroundColor: "#fff",
                  borderTopRightRadius: "9999px",
                  borderBottomRightRadius: "9999px",
                }}
              >
                <Option value="all">
                  <div className="flex items-center gap-2">
                    <BsGrid className="text-[#C99700]" /> Tất cả
                  </div>
                </Option>
                <Option value="Ev">
                  <div className="flex items-center gap-2">
                    <FaCar className="text-[#C99700]" /> Xe
                  </div>
                </Option>
                <Option value="battery">
                  <div className="flex items-center gap-2">
                    <FaBatteryFull className="text-[#C99700]" /> Pin
                  </div>
                </Option>
              </Select>
            </form>
          </div>

          {/* Right Menu */}
          <div className="w-1/4 flex justify-end items-center">
            <Link
              to="/cart"
              className="mx-3 hover:text-[#B8860B] flex items-center font-medium transition-colors"
            >
              <FaShoppingCart className="text-xl" />
              <span className="ml-2 text-lg">Giỏ Hàng</span>
            </Link>
            <Link
              to="/favourite"
              className="mx-3 hover:text-[#B8860B] flex items-center font-medium transition-colors"
            >
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
