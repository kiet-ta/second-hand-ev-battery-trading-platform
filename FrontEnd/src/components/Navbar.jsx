import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { Input, Select, message } from "antd";
import { BsGrid } from "react-icons/bs";
import { FaCar, FaBatteryFull, FaCubes, FaSearch, FaShoppingCart, FaSuitcase } from "react-icons/fa";
import { FiHeart } from "react-icons/fi";
import { IoMdHome } from "react-icons/io";
import { RiAuctionFill } from "react-icons/ri";
import Logo from "./Logo";
import walletApi from "../api/walletApi";
import NotificationDropdown from "./DropDowns/NotificationDropdown";
import ProfileDropDown from "./DropDowns/ProfileDropDown";
import { IoHelp } from "react-icons/io5";


const { Option } = Select;

function Navbar({ data }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [walletBalance, setWalletBalance] = useState(null);
  const [query, setQuery] = useState("");
  const [itemType, setItemType] = useState("all");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("query") || "";
    const type = params.get("itemType") || "all";
    setQuery(q);
    setItemType(type);
  }, [location.search]);

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

  const handleSellerClick = () => {
    const jwt = localStorage.getItem("token");
    if (!jwt) {
      message.warning("Vui lòng đăng nhập để truy cập kênh người bán");
      return navigate("/login");
    }

    try {
      const decodeJWT = jwtDecode(jwt);
      if (decodeJWT.role === "buyer") navigate("/seller-registration");
      else if (decodeJWT.role === "Manager") navigate("/manage");
      else navigate("/seller");
    } catch (error) {
      console.error("Invalid token:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      navigate("/login");
    }
  };

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
              <div>
                <Link className="flex items-center mr-2 hover:text-[#B8860B] font-medium text-sm transition-colors"
                to="/complaint">
                <IoHelp/> Gửi yêu cầu
                </Link>
              </div>
                <NotificationDropdown userId={data.userId} />
                <div className="ml-4">
                  <ProfileDropDown users={data} walletBalance={walletBalance} />
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="mx-3 hover:text-[#B8860B] font-medium text-sm">
                  Đăng Nhập
                </Link>
                <Link to="/register" className="mx-3 hover:text-[#B8860B] font-medium text-sm">
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
          <div className="w-2/4 px-4 relative overflow-visible z-50">
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
                <Option value="ev">
                  <div className="flex items-center gap-2">
                    <FaCar className="text-[#C99700]" /> Xe
                  </div>
                </Option>
                <Option value="battery">
                  <div className="flex items-center gap-2">
                    <FaBatteryFull className="text-[#C99700]" /> Pin
                  </div>
                </Option>
                <Option value="accessory">
                  <div className="flex items-center gap-2">
                    <FaCubes className="text-[#C99700]" /> Phụ Kiện
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
