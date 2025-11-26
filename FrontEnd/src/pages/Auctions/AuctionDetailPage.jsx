import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { HubConnectionBuilder } from "@microsoft/signalr";
import {
  Spin,
  List,
  Avatar,
  Card,
  Tag,
  Alert,
} from "antd";
import { FiClock, FiUser, FiTrendingUp, FiCheckCircle } from "react-icons/fi";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import auctionApi from "../../api/auctionApi";
import walletApi from "../../api/walletApi";
import userApi from "../../api/userApi";
import itemApi from "../../api/itemApi";
import addressLocalApi from "../../api/addressLocalApi";
import orderItemApi from "../../api/orderItemApi";

const LOGGED_IN_USER_ID = localStorage.getItem("userId");

// ---------------- Countdown & Status Hook ----------------
const useAuctionCountdown = (startTimeStr, endTimeStr) => {
  const calc = useCallback(() => {
    if (!startTimeStr && !endTimeStr) return { time: "N/A", isFinished: true, status: "unknown" };

    const now = Date.now();
    const start = startTimeStr ? new Date(startTimeStr).getTime() : null;
    const end = endTimeStr ? new Date(endTimeStr).getTime() : null;

    if (start && now < start) {
      const diff = start - now;
      return { time: formatDuration(diff), isFinished: false, status: "upcoming", target: start };
    }

    if ((start && end && now >= start && now < end) || (!start && end && now < end)) {
      const diff = end - now;
      return { time: formatDuration(diff), isFinished: false, status: "ongoing", target: end };
    }

    return { time: "00h 00m 00s", isFinished: true, status: "ended", target: end || (start || Date.now()) };
  }, [startTimeStr, endTimeStr]);

  const [state, setState] = useState(calc);

  useEffect(() => {
    const id = setInterval(() => setState(calc()), 1000);
    return () => clearInterval(id);
  }, [calc]);

  return state;
};

const formatDuration = (ms) => {
  if (ms <= 0) return "00h 00m 00s";
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  ms -= days * (1000 * 60 * 60 * 24);
  const hours = Math.floor(ms / (1000 * 60 * 60));
  ms -= hours * (1000 * 60 * 60);
  const minutes = Math.floor(ms / (1000 * 60));
  ms -= minutes * (1000 * 60);
  const seconds = Math.floor(ms / 1000);

  const pad = (n) => String(n).padStart(2, "0");
  if (days > 0) return `${days}d ${pad(hours)}h ${pad(minutes)}m`;
  return `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
};

// ---------------- Main Component ----------------
function AuctionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [connection, setConnection] = useState(null);
  const [auction, setAuction] = useState(null);
  const [sellerProfile, setSellerProfile] = useState(null);
  const [bidHistory, setBidHistory] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [bidAmount, setBidAmount] = useState(null);
  const [isBidding, setIsBidding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Carousel
  const [selectedImage, setSelectedImage] = useState(0);

  const stepPrice = auction?.stepPrice && auction.stepPrice > 0 ? auction.stepPrice : 100000;

  const countdown = useAuctionCountdown(auction?.startTime, auction?.endTime);

  const isUpcoming = countdown.status === "upcoming";
  const isOngoing = countdown.status === "ongoing";
  const isEnded = countdown.status === "ended";

  // ---------------- Buy Now ----------------
  const [buyNowPrice, setBuyNowPrice] = useState(null);
  const [isProcessingBuyNow, setIsProcessingBuyNow] = useState(false);

  useEffect(() => {
    const fetchBuyNowPrice = async () => {
      if (auction?.isBuyNow) {
        try {
          const item = await itemApi.getItemById(auction.itemId);
          setBuyNowPrice(item.price || auction.currentPrice || auction.startingPrice);
        } catch (err) {
          console.error("Không thể lấy giá Buy Now:", err);
        }
      }
    };
    fetchBuyNowPrice();
  }, [auction]);

  const handleBuyNow = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) return navigate("/login");

    setIsProcessingBuyNow(true);
    try {
      const orderItemPayload = {
        buyerId: userId,
        itemId: auction.itemId,
        quantity: 1,
        price: buyNowPrice,
      };

      const createdOrderItem = await orderItemApi.postOrderItem(orderItemPayload);
      if (!createdOrderItem?.orderItemId) throw new Error("Không thể tạo OrderItem.");

      const allAddresses = await addressLocalApi.getAddressByUserId(userId);
      const defaultAddress = allAddresses.find((addr) => addr.isDefault) || allAddresses[0];

      if (!defaultAddress) {
        navigate("/profile/address");
        return;
      }

      const checkoutData = {
        source: "buyNow",
        totalAmount: buyNowPrice,
        orderItems: [
          {
            id: auction.itemId,
            name: auction.title || "Sản phẩm",
            price: buyNowPrice,
            quantity: 1,
            image: auction.images?.[0]?.imageUrl || "https://placehold.co/100x100/e2e8f0/374151?text=?",
          },
        ],
        allAddresses,
        selectedAddressId: defaultAddress.addressId,
      };

      localStorage.setItem("checkoutData", JSON.stringify(checkoutData));
      navigate("/checkout/buy-now", { state: checkoutData });
    } catch (err) {
      console.error("❌ Lỗi mua ngay:", err);
    } finally {
      setIsProcessingBuyNow(false);
    }
  };

  // ---------------- SignalR Setup ----------------
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setErrorMsg("Bạn chưa đăng nhập. Không thể kết nối real-time.");
      return;
    }

    const newConnection = new HubConnectionBuilder()
      .withUrl("https://localhost:7272/auctionHub", { accessTokenFactory: () => token })
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);

    newConnection.start().catch((err) => console.error("Connection failed:", err));

    return () => newConnection.stop();
  }, []);

  useEffect(() => {
    if (connection && auction?.auctionId) {
      connection.invoke("JoinAuctionGroup", auction.auctionId.toString());
      return () => connection.invoke("LeaveAuctionGroup", auction.auctionId.toString());
    }
  }, [connection, auction?.auctionId]);

  useEffect(() => {
    if (connection) {
      const handleNewBid = (newBidData) => {
        setAuction((prev) => ({ ...prev, currentPrice: newBidData.bidAmount }));
        setBidHistory((prev) => [newBidData, ...prev]);
        setBidAmount(newBidData.bidAmount + stepPrice);
      };
      connection.on("ReceiveCurrentState", handleNewBid);
      return () => connection.off("ReceiveCurrentState", handleNewBid);
    }
  }, [connection, stepPrice]);

  // ---------------- API Fetch ----------------
  const fetchBidHistory = useCallback(async (auctionId) => {
    try {
      const res = await auctionApi.getBiddingHistory(auctionId);
      const sorted = Array.isArray(res)
        ? res.sort((a, b) => new Date(b.bidTime) - new Date(a.bidTime))
        : [];
      setBidHistory(sorted);
    } catch {
      setBidHistory([]);
    }
  }, []);

  const fetchAuctionDetails = useCallback(async () => {
    try {
      setLoading(true);
      const auctionData = await auctionApi.getAuctionByItemId(id);
      setAuction(auctionData);

      const step = auctionData.stepPrice > 0 ? auctionData.stepPrice : 100000;
      setBidAmount((auctionData.currentPrice || auctionData.startingPrice) + step);

      const item = await itemApi.getItemById(auctionData.itemId);
      const seller = await userApi.getUserByID(item.updatedBy);
      setSellerProfile(seller);

      if (LOGGED_IN_USER_ID) {
        const wallet = await walletApi.getWalletByUser(LOGGED_IN_USER_ID);
        setWalletBalance(wallet.balance || 0);
      }

      await fetchBidHistory(auctionData.auctionId);
    } finally {
      setLoading(false);
    }
  }, [id, fetchBidHistory]);

  useEffect(() => {
    fetchAuctionDetails();
  }, [fetchAuctionDetails]);

  // ---------------- Bidding ----------------
  const getMinBid = () => (auction?.currentPrice || auction?.startingPrice || 0) + stepPrice;

  const handlePlaceBid = async () => {
    if (!LOGGED_IN_USER_ID) return navigate("/login");
    if (isUpcoming) {
      setErrorMsg("Đấu giá chưa bắt đầu.");
      return;
    }

    const minBid = getMinBid();
    if (bidAmount < minBid)
      return setErrorMsg(`Giá đặt tối thiểu: ${minBid.toLocaleString("vi-VN")} đ`);
    if (bidAmount > walletBalance)
      return setErrorMsg("Số dư ví không đủ.");
    if (!connection) return setErrorMsg("Real-time chưa kết nối.");

    try {
      setIsBidding(true);
      await connection.invoke("PlaceBid", auction.auctionId, bidAmount);
    } catch (err) {
      setErrorMsg(err.message || "Không thể đặt giá.");
    } finally {
      setIsBidding(false);
    }
  };

  // ---------------- UI ----------------
  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-[#FAF8F3]">
        <Spin size="large" />
      </div>
    );

  if (!auction)
    return <div className="p-8 text-center text-gray-700">Không tìm thấy dữ liệu.</div>;

  const images = auction.images?.map((x) => x.imageUrl) || [];
  const displayImage = images[selectedImage] || "https://placehold.co/800x600/eee/999?text=No+Image";
  const displayPrice = auction.currentPrice || auction.startingPrice || 0;

  const handlePrev = () => { if (!images.length) return; setSelectedImage((prev) => (prev - 1 + images.length) % images.length); };
  const handleNext = () => { if (!images.length) return; setSelectedImage((prev) => (prev + 1) % images.length); };

  return (
    <div className="bg-[#FAF8F3] min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* LEFT: IMAGE GALLERY */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="p-0 rounded-2xl shadow-md overflow-hidden">
            <div className="relative">
              <img src={displayImage} alt="Auction" className="w-full object-cover aspect-[3/2]" />
              {images.length > 1 && (
                <>
                  <button onClick={handlePrev} className="absolute left-4 top-1/2 -translate-y-1/2 bg-[#FFF7E5]/80 p-3 rounded-full hover:bg-[#FBE6A2]">
                    <FaChevronLeft className="text-[#B8860B]" />
                  </button>
                  <button onClick={handleNext} className="absolute right-4 top-1/2 -translate-y-1/2 bg-[#FFF7E5]/80 p-3 rounded-full hover:bg-[#FBE6A2]">
                    <FaChevronRight className="text-[#B8860B]" />
                  </button>
                </>
              )}
            </div>
            <div className="flex gap-3 p-4 bg-[#FFFDF9] border-t">
              {images.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  onClick={() => setSelectedImage(i)}
                  className={`w-20 h-20 rounded-lg object-cover cursor-pointer border-2 ${selectedImage === i ? "border-[#B8860B]" : "border-[#EAE6DA]"}`}
                />
              ))}
            </div>
          </Card>

          {/* DESCRIPTION */}
          <Card className="p-6 shadow-md rounded-2xl">
            <h2 className="text-2xl font-bold border-b pb-4 mb-4">Mô Tả Chi Tiết</h2>
            <p className="text-gray-700">{auction.description}</p>
          </Card>
        </div>

        {/* RIGHT SIDE */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card className="p-6 shadow-md rounded-2xl">
            <h1 className="text-3xl font-bold mb-2">{auction.title}</h1>

            <div className="bg-yellow-50 p-4 rounded-lg border text-center">
              <p className="text-sm text-gray-600">Thời gian còn lại</p>
              <div className="flex justify-center items-center gap-2">
                <FiClock className="text-2xl text-[#B8860B]" />
                <span className="text-4xl font-bold">{isUpcoming ? countdown.time : isOngoing ? countdown.time : "ĐÃ KẾT THÚC"}</span>
              </div>
            </div>

            {/* CURRENT PRICE */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-gray-600">Giá hiện tại</p>
                  <p className="text-4xl font-bold text-[#B8860B]">{displayPrice.toLocaleString("vi-VN")} đ</p>
                </div>
              </div>
              <Tag color="gold">Bước giá: {stepPrice.toLocaleString()} đ</Tag>
            </div>

            {/* YOUR BID */}
            <div className="mt-6">
              <p className="font-semibold mb-2 flex justify-between">
                Giá của bạn
                <span className="text-sm text-gray-500">Tối thiểu: {getMinBid().toLocaleString("vi-VN")} đ</span>
              </p>

              {errorMsg && <Alert className="mb-3" type="error" message={errorMsg} showIcon />}

              <div className="flex gap-2 w-full">
                <input
                  type="number"
                  value={bidAmount || ""}
                  onChange={(e) => setBidAmount(Number(e.target.value))}
                  min={getMinBid()}
                  step={stepPrice}
                  disabled={!isOngoing}
                  className={`flex-1 px-5 py-4 text-lg font-medium rounded-xl border transition-all
                    ${isOngoing
                      ? "border-[#D4AF37] bg-[#FFFDF9] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
                      : "border-[#D4AF37] bg-[#FFFDF9] text-gray-500 cursor-not-allowed"
                    }`}
                />

                <button
                  onClick={handlePlaceBid}
                  disabled={!isOngoing || isBidding}
                  className={`flex-1 py-4 font-semibold rounded-xl text-white transition-all duration-300
                    ${!isOngoing
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-gradient-to-r from-[#FFD700] to-[#D4AF37] shadow-lg hover:from-[#D4AF37] hover:to-[#B8860B] transform hover:-translate-y-0.5"
                    }`}
                >
                  {isUpcoming ? "Chưa bắt đầu" : isOngoing ? (isBidding ? "Đang đặt giá..." : "Đặt Giá") : "Đã kết thúc"}
                </button>
              </div>
            </div>

            {/* BUY NOW */}
            {auction.isBuyNow && buyNowPrice && (
              <button
                onClick={handleBuyNow}
                disabled={isEnded || isProcessingBuyNow}
                className={`w-full py-4 mt-4 rounded-2xl font-semibold text-white shadow-lg transition-all duration-300
                  ${isEnded
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transform hover:-translate-y-0.5"
                  }`}
              >
                {isEnded
                  ? "Đã kết thúc"
                  : isProcessingBuyNow
                  ? "Đang xử lý..."
                  : `Mua ngay (${buyNowPrice.toLocaleString("vi-VN")} đ)`}
              </button>
            )}
          </Card>

          {/* SELLER */}
          {sellerProfile && (
            <Card className="p-6 shadow-md rounded-2xl">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FiUser /> Người Bán
              </h2>
              <div className="flex items-center gap-4">
                <img className="w-16 h-16 rounded-full ring-2 ring-[#D4AF37]"
                  src={sellerProfile.avatar || "https://i.pinimg.com/736x/b6/10/ae/b610ae5879e2916e1bb7c4c161754f4d.jpg"} />
                <div className="flex-1">
                  <p className="font-bold text-lg">{sellerProfile.fullName}</p>
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <FiCheckCircle /> Đã xác minh
                  </p>
                </div>
                <Link to={`/seller/${sellerProfile.userId}`} className="border px-4 py-2 rounded-lg text-[#B8860B]">Xem hồ sơ</Link>
              </div>
            </Card>
          )}

          {/* BID HISTORY */}
          {bidHistory.length > 0 && (
            <Card className="p-6 shadow-md rounded-2xl">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FiTrendingUp /> Lịch Sử Đặt Giá
              </h2>
              <List
                dataSource={bidHistory}
                className="max-h-80 overflow-y-auto"
                renderItem={(bid) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar style={{ background: "#B8860B", color: "#fff" }}>{bid.fullName?.[0] || "U"}</Avatar>}
                      title={<b>{bid.fullName || "Người dùng"}</b>}
                      description={new Date(bid.bidTime).toLocaleString("vi-VN")}
                    />
                    <Tag color="gold" className="text-base px-3">{bid.bidAmount.toLocaleString("vi-VN")} đ</Tag>
                  </List.Item>
                )}
              />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuctionDetailPage;
