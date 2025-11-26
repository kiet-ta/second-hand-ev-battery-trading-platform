import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { HubConnectionBuilder } from "@microsoft/signalr";
import { Spin, List, Avatar, Card, Tag, Alert } from "antd";
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
  const [selectedImage, setSelectedImage] = useState(0);
  const [buyNowPrice, setBuyNowPrice] = useState(null);
  const [isProcessingBuyNow, setIsProcessingBuyNow] = useState(false);

  const stepPrice = auction?.stepPrice && auction.stepPrice > 0 ? auction.stepPrice : 100000;
  const countdown = useAuctionCountdown(auction?.startTime, auction?.endTime);
  const isUpcoming = countdown.status === "upcoming";
  const isOngoing = countdown.status === "ongoing";
  const isEnded = countdown.status === "ended";

  // ---------------- Fetch BuyNow Price ----------------
  useEffect(() => {
    const fetchBuyNowPrice = async () => {
      if (auction?.isBuyNow) {
        try {
          const item = await itemApi.getItemById(auction.itemId);
          setBuyNowPrice(item.price || auction.currentPrice || auction.startingPrice);
        } catch (err) {
          console.error("Cannot fetch Buy Now price:", err);
        }
      }
    };
    fetchBuyNowPrice();
  }, [auction]);

  // ---------------- Buy Now Handler ----------------
const handleBuyNow = async () => {
  if (!LOGGED_IN_USER_ID) return navigate("/login");
  setIsProcessingBuyNow(true);
  try {
    // 1️⃣ Create OrderItem
    const orderItemPayload = {
      buyerId: LOGGED_IN_USER_ID,
      itemId: auction.itemId,
      quantity: 1,
      price: buyNowPrice,
    };
    const createdOrderItem = await orderItemApi.postOrderItem(orderItemPayload);
    if (!createdOrderItem?.orderItemId) throw new Error("Cannot create order item");

    // 2️⃣ Fetch user addresses
    const allAddresses = await addressLocalApi.getAddressByUserId(LOGGED_IN_USER_ID);
    const defaultAddress = allAddresses.find(a => a.isDefault) || allAddresses[0];
    if (!defaultAddress) return navigate("/profile/address");

    // 3️⃣ Prepare checkoutData
    const checkoutData = {
      source: "buyNow",
      totalAmount: buyNowPrice,
      orderItems: [
        {
          id: createdOrderItem.orderItemId,
          itemId: auction.itemId,
          name: auction.title || "Sản phẩm",
          price: buyNowPrice ,
          quantity: 1,
          image: auction.images?.[0]?.imageUrl || "https://placehold.co/100x100/e2e8f0/374151?text=?",
        },
      ],
      allAddresses,
      selectedAddressId: defaultAddress.addressId,
      auctionId: auction.auctionId, // ✅ mark auction Buy Now
    };

    localStorage.setItem("checkoutData", JSON.stringify(checkoutData));
    navigate("/checkout/buy-now", { state: checkoutData });

  } catch (err) {
    console.error("Buy Now error:", err);
  } finally {
    setIsProcessingBuyNow(false);
  }
};

  // ---------------- SignalR ----------------
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return setErrorMsg("Bạn chưa đăng nhập. Không thể kết nối real-time.");
    const newConnection = new HubConnectionBuilder()
      .withUrl("https://localhost:7272/auctionHub", { accessTokenFactory: () => token })
      .withAutomaticReconnect()
      .build();
    setConnection(newConnection);
    newConnection.start().catch(err => console.error("Connection failed:", err));
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
        setAuction(prev => ({ ...prev, currentPrice: newBidData.bidAmount }));
        setBidHistory(prev => [newBidData, ...prev]);
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
      const sorted = Array.isArray(res) ? res.sort((a,b) => new Date(b.bidTime)-new Date(a.bidTime)) : [];
      setBidHistory(sorted);
    } catch { setBidHistory([]); }
  }, []);

  const fetchAuctionDetails = useCallback(async () => {
    try {
      setLoading(true);
      const auctionData = await auctionApi.getAuctionByItemId(id);
      setAuction(auctionData);
      setBidAmount((auctionData.currentPrice || auctionData.startingPrice) + stepPrice);

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
  }, [id, fetchBidHistory, stepPrice]);

  useEffect(() => { fetchAuctionDetails(); }, [fetchAuctionDetails]);

  // ---------------- Bidding ----------------
  const getMinBid = () => (auction?.currentPrice || auction?.startingPrice || 0) + stepPrice;
  const handlePlaceBid = async () => {
    if (!LOGGED_IN_USER_ID) return navigate("/login");
    if (isUpcoming) return setErrorMsg("Đấu giá chưa bắt đầu.");
    const minBid = getMinBid();
    if (bidAmount < minBid) return setErrorMsg(`Giá đặt tối thiểu: ${minBid.toLocaleString("vi-VN")} đ`);
    if (bidAmount > walletBalance) return setErrorMsg("Số dư ví không đủ.");
    if (!connection) return setErrorMsg("Real-time chưa kết nối.");
    try {
      setIsBidding(true);
      await connection.invoke("PlaceBid", auction.auctionId, bidAmount);
    } catch (err) { setErrorMsg(err.message || "Không thể đặt giá."); }
    finally { setIsBidding(false); }
  };

  if (loading) return <div className="flex justify-center items-center h-screen bg-[#FAF8F3]"><Spin size="large" /></div>;
  if (!auction) return <div className="p-8 text-center text-gray-700">Không tìm thấy dữ liệu.</div>;

  const images = auction.images?.map(x => x.imageUrl) || [];
  const displayImage = images[selectedImage] || "https://placehold.co/800x600/eee/999?text=No+Image";
  const displayPrice = auction.currentPrice || auction.startingPrice || 0;
  const handlePrev = () => { if (!images.length) return; setSelectedImage(prev => (prev-1+images.length)%images.length); };
  const handleNext = () => { if (!images.length) return; setSelectedImage(prev => (prev+1)%images.length); };

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
                <img key={i} src={url} onClick={() => setSelectedImage(i)}
                  className={`w-20 h-20 rounded-lg object-cover cursor-pointer border-2 ${selectedImage===i ? "border-[#B8860B]" : "border-[#EAE6DA]"}`}/>
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

            <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-gray-600">Giá hiện tại</p>
                  <p className="text-4xl font-bold text-[#B8860B]">{displayPrice.toLocaleString("vi-VN")} đ</p>
                </div>
              </div>
              <Tag color="gold">Bước giá: {stepPrice.toLocaleString()} đ</Tag>
            </div>

            {/* Bid input */}
            <div className="mt-6">
              <p className="font-semibold mb-2 flex justify-between">
                Giá của bạn
                <span className="text-sm text-gray-500">Tối thiểu: {getMinBid().toLocaleString("vi-VN")} đ</span>
              </p>
              {errorMsg && <Alert className="mb-3" type="error" message={errorMsg} showIcon />}
              <div className="flex gap-2 w-full">
                <input type="number" value={bidAmount||""} onChange={e=>setBidAmount(Number(e.target.value))} min={getMinBid()} step={stepPrice}
                  disabled={!isOngoing}
                  className={`flex-1 px-5 py-4 text-lg font-medium rounded-xl border transition-all ${isOngoing?"border-[#D4AF37] bg-[#FFFDF9] text-gray-900":"border-[#D4AF37] bg-[#FFFDF9] text-gray-500 cursor-not-allowed"}`}/>
                <button onClick={handlePlaceBid} disabled={!isOngoing || isBidding}
                  className={`flex-1 py-4 font-semibold rounded-xl text-white transition-all duration-300 ${!isOngoing?"bg-gray-300 cursor-not-allowed":"bg-gradient-to-r from-[#FFD700] to-[#D4AF37] shadow-lg hover:from-[#D4AF37] hover:to-[#B8860B] transform hover:-translate-y-0.5"}`}>
                  {isUpcoming ? "Chưa bắt đầu" : isOngoing ? (isBidding?"Đang đặt giá...":"Đặt Giá") : "Đã kết thúc"}
                </button>
              </div>
            </div>

            {/* Buy Now button */}
            {auction.isBuyNow && buyNowPrice && (
              <button
                onClick={handleBuyNow}
                disabled={isEnded || isProcessingBuyNow}
                className={`w-full py-4 mt-4 rounded-2xl font-semibold text-white shadow-lg transition-all duration-300 ${isEnded?"bg-gray-300 cursor-not-allowed":"bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transform hover:-translate-y-0.5"}`}>
                {isEnded ? "Đã kết thúc" : isProcessingBuyNow ? "Đang xử lý..." : `Mua ngay (${buyNowPrice.toLocaleString("vi-VN")} đ)`}
              </button>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default AuctionDetailPage;
