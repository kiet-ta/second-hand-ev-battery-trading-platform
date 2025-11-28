import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { HubConnectionBuilder } from "@microsoft/signalr";
import {
  Spin,
  InputNumber,
  Button,
  List,
  Avatar,
  Card,
  Tag,
  Space,
  Carousel,
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

// ---------- Countdown Hook ----------
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

const useAuctionCountdown = (startTimeStr, endTimeStr) => {
  const calc = useCallback(() => {
    if (!startTimeStr && !endTimeStr)
      return { time: "N/A", isFinished: true, status: "unknown" };
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

// ---------- Component ----------
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

  // ---------- Fetch auction & related data ----------
  const fetchBidHistory = useCallback(async (auctionId) => {
    try {
      const res = await auctionApi.getBiddingHistory(auctionId);
      const sorted = Array.isArray(res) ? res.sort((a, b) => new Date(b.bidTime) - new Date(a.bidTime)) : [];
      setBidHistory(sorted);
    } catch (err) {
      console.error("Failed to fetch bid history:", err);
      setBidHistory([]);
    }
  }, []);

  const fetchAuctionDetails = useCallback(async () => {
    try {
      setLoading(true);
      const auctionData = await auctionApi.getAuctionByItemId(id);
      if (!auctionData) {
        setAuction(null);
        return;
      }
      setAuction(auctionData);
      setBidAmount((auctionData.currentPrice || auctionData.startingPrice) + stepPrice);

      // item + seller
      const item = await itemApi.getItemById(auctionData.itemId);
      const seller = await userApi.getUserByID(item.updatedBy);
      setSellerProfile(seller);

      // wallet
      if (LOGGED_IN_USER_ID) {
        const wallet = await walletApi.getWalletByUser(LOGGED_IN_USER_ID);
        setWalletBalance(wallet?.balance || 0);
      }

      // buy now price (if available)
      if (auctionData.isBuyNow) {
        setBuyNowPrice(item?.price || auctionData.currentPrice || auctionData.startingPrice);
      }

      await fetchBidHistory(auctionData.auctionId);
    } catch (err) {
      console.error("Error fetching auction details:", err);
    } finally {
      setLoading(false);
    }
  }, [id, fetchBidHistory, stepPrice]);

  useEffect(() => {
    fetchAuctionDetails();
  }, [fetchAuctionDetails]);

  // ---------- SignalR connection ----------
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      // don't show an intrusive blocking error; bidding will navigate to login if needed
      console.warn("No token found - SignalR won't connect.");
      setErrorMsg("Bạn chưa đăng nhập. Không thể kết nối real-time.");
      return;
    }
    const newConnection = new HubConnectionBuilder()
      .withUrl("https://localhost:7272/auctionHub", { accessTokenFactory: () => token })
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);
    newConnection.start().catch((err) => {
      console.error("SignalR start failed:", err);
    });

    return () => {
      if (newConnection) newConnection.stop().catch(() => { });
    };
  }, []);

  // join/leave group when auction changes
  useEffect(() => {
    if (connection && auction?.auctionId) {
      connection.invoke("JoinAuctionGroup", auction.auctionId.toString())
        .catch((err) => console.error("JoinAuctionGroup failed:", err));
      return () => {
        if (connection) {
          connection.invoke("LeaveAuctionGroup", auction.auctionId.toString())
            .catch((err) => console.error("LeaveAuctionGroup failed:", err));
        }
      };
    }
  }, [connection, auction?.auctionId]);

  // receive updates
  useEffect(() => {
    if (!connection) return;
    const handleNewBid = (newBidData) => {
      // server should broadcast an object like: { fullName, bidAmount, bidTime, bidderId, ... }
      console.log("Real-time update:", newBidData);
      setAuction(prev => prev ? ({ ...prev, currentPrice: newBidData.bidAmount }) : prev);
      setBidHistory(prev => [newBidData, ...prev]);
      setBidAmount(newBidData.bidAmount + stepPrice);
    };
    connection.on("ReceiveCurrentState", handleNewBid);
    return () => connection.off("ReceiveCurrentState", handleNewBid);
  }, [connection, stepPrice]);

  // ---------- Buy Now ----------
  const handleBuyNow = async () => {
    if (!LOGGED_IN_USER_ID) return navigate("/login");
    if (!auction) return;
    setIsProcessingBuyNow(true);
    try {
      const allAddresses = await addressLocalApi.getAddressByUserId(LOGGED_IN_USER_ID);
      const defaultAddress = (allAddresses || []).find(a => a.isDefault) || (allAddresses || [])[0];
      if (!defaultAddress) return navigate("/profile/address");
      const orderItemPayload = {
        buyerId: LOGGED_IN_USER_ID,
        itemId: auction.itemId,
        quantity: 1,
        price: buyNowPrice,
      };
      const createdOrderItem = await orderItemApi.postOrderItem(orderItemPayload);
      if (!createdOrderItem?.orderItemId) throw new Error("Không tạo được Order Item");



      const checkoutData = {
        source: "buyNow",
        totalAmount: buyNowPrice,
        orderItems: [
          {
            id: createdOrderItem.orderItemId,
            itemId: auction.itemId,
            name: auction.title || "Sản phẩm",
            price: buyNowPrice,
            quantity: 1,
            image: auction.images?.[0]?.imageUrl || "https://placehold.co/100x100/e2e8f0/374151?text=?",
          },
        ],
        allAddresses,
        selectedAddressId: defaultAddress.addressId,
        auctionId: auction.auctionId,
      };

      localStorage.setItem("checkoutData", JSON.stringify(checkoutData));
      navigate("/checkout/buy-now", { state: checkoutData });
    } catch (err) {
      console.error("Buy Now failed:", err);
      setErrorMsg(err.message || "Không thể mua ngay. Vui lòng thử lại.");
    } finally {
      setIsProcessingBuyNow(false);
    }
  };

  // ---------- Bidding ----------
  const getMinBid = () => (auction?.currentPrice || auction?.startingPrice || 0) + stepPrice;
  const handlePlaceBid = async () => {
    setErrorMsg("");
    if (!LOGGED_IN_USER_ID) return navigate("/login");
    if (!auction) return setErrorMsg("Dữ liệu đấu giá chưa sẵn sàng.");
    if (isUpcoming) return setErrorMsg("Đấu giá chưa bắt đầu.");
    const minBid = getMinBid();
    if (!bidAmount || bidAmount < minBid) {
      return setErrorMsg(`Giá đặt tối thiểu: ${minBid.toLocaleString("vi-VN")} đ`);
    }
    if (bidAmount > walletBalance) return setErrorMsg("Số dư ví không đủ.");
    if (!connection) return setErrorMsg("Real-time service chưa kết nối.");
    try {
      setIsBidding(true);
      await connection.invoke("PlaceBid", auction.auctionId, bidAmount);
      // server will broadcast the accepted bid and update view
    } catch (err) {
      console.error("PlaceBid error:", err);
      setErrorMsg(err?.message || "Không thể đặt giá, thử lại.");
    } finally {
      setIsBidding(false);
    }
  };

  // ---------- UI helpers ----------
  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#FAF8F3]">
        <Spin size="large" />
        <p className="mt-4 text-lg font-semibold text-gray-800">Đang tải chi tiết đấu giá...</p>
      </div>
    );

  if (!auction)
    return (
      <div className="p-8 bg-[#FAF8F3] min-h-screen flex items-center justify-center text-gray-700 text-lg">
        Không tìm thấy dữ liệu.
      </div>
    );

  const images = auction.images?.map((img) => img.imageUrl) || [];
  const displayPrice = auction.currentPrice || auction.startingPrice || 0;
  const isActive = isOngoing && !countdown.isFinished;

  // image carousel ref-less navigation
  const handlePrev = () => setSelectedImage((s) => (s - 1 + images.length) % images.length);
  const handleNext = () => setSelectedImage((s) => (s + 1) % images.length);

  return (
    <div className="bg-[#FAF8F3] min-h-screen py-8 px-4 font-['Inter']">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* LEFT */}
        <div className="lg:col-span-3">
          <Card bordered={false} className="shadow-lg rounded-lg overflow-hidden p-0">
            {images.length > 0 ? (
              <div className="relative">
                <Carousel
                  afterChange={(idx) => setSelectedImage(idx)}
                  selectedIndex={selectedImage}
                  autoplay={false}
                  dots={false}
                >
                  {images.map((url, idx) => (
                    <div key={idx} className="w-full">
                      <img src={url} alt={`img-${idx}`} className="w-full object-cover aspect-3/2" />
                    </div>
                  ))}
                </Carousel>

                {images.length > 1 && (
                  <>
                    <button onClick={handlePrev} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-3 rounded-full hover:scale-105">
                      <FaChevronLeft className="text-[#B8860B]" />
                    </button>
                    <button onClick={handleNext} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-3 rounded-full hover:scale-105">
                      <FaChevronRight className="text-[#B8860B]" />
                    </button>
                  </>
                )}
              </div>
            ) : (
              <img
                src={`https://placehold.co/800x600/E8E4DC/2C2C2C?text=${encodeURIComponent(auction.title || "No Image")}`}
                alt="No Image"
                className="w-full object-cover aspect-3/2"
              />
            )}

            {/* thumbnails */}
            {images.length > 0 && (
              <div className="flex gap-3 p-4 bg-[#FFFDF9] border-t overflow-x-auto">
                {images.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    onClick={() => setSelectedImage(i)}
                    className={`w-20 h-20 rounded-lg object-cover cursor-pointer border-2 ${selectedImage === i ? "border-[#B8860B]" : "border-[#EAE6DA]"}`}
                  />
                ))}
              </div>
            )}
          </Card>

          <Card bordered={false} className="shadow-lg p-6 rounded-lg mt-6">
            <h2 className="text-2xl font-bold border-b pb-4 mb-4">Mô Tả Chi Tiết</h2>
            <p className="text-gray-700 leading-relaxed">{auction.description || "Không có mô tả."}</p>
            <p className="mt-4 text-gray-700">
              <span className="font-semibold">Bước giá:</span> {stepPrice.toLocaleString("vi-VN")} đ
            </p>
          </Card>
        </div>

        {/* RIGHT */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card bordered={false} className="shadow-lg p-6 rounded-lg">
            <h1 className="text-3xl font-bold mb-2">{auction.title}</h1>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-center">
              <p className="text-sm font-medium text-gray-600">Thời gian còn lại</p>
              <div className="flex items-center justify-center gap-2 mt-1">
                <FiClock className="text-2xl text-[#B8860B]" />
                <span className="text-3xl font-extrabold text-[#B8860B]">
                  {countdown.isFinished ? "ĐÃ KẾT THÚC" : countdown.time}
                </span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm text-gray-600">Giá hiện tại</p>
                  <p className="text-4xl font-extrabold text-[#B8860B]">
                    {displayPrice.toLocaleString("vi-VN")} đ
                  </p>
                </div>
                <Tag color="gold">Bước giá: {stepPrice.toLocaleString("vi-VN")} đ</Tag>
              </div>
            </div>

            <div className="mt-6">
              <p className="font-semibold mb-2 flex justify-between">
                Giá của bạn
                <span className="text-sm text-gray-500">Tối thiểu: {getMinBid().toLocaleString("vi-VN")} đ</span>
              </p>
              <p className="text-sm mb-2">
                Số dư ví:{" "}
                <span className="font-bold text-[#B8860B] ml-1">
                  {walletBalance.toLocaleString("vi-VN")} đ
                </span>
              </p>

              {errorMsg && (
                <Alert message={errorMsg} type="error" showIcon closable onClose={() => setErrorMsg("")} className="mb-3 rounded-lg" />
              )}

              <Space.Compact style={{ width: "100%" }}>
                <InputNumber
                  size="large"
                  value={bidAmount}
                  onChange={(v) => setBidAmount(v)}
                  min={getMinBid()}
                  step={stepPrice}
                  formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  parser={(v) => (v ? parseInt(v.replace(/\D/g, "")) : 0)}
                  addonAfter="VND"
                  disabled={!isActive}
                  style={{ width: "100%" }}
                />
                <Button
                  type="primary"
                  size="large"
                  loading={isBidding}
                  disabled={!isActive}
                  onClick={handlePlaceBid}
                  className="bg-[#D4AF37] hover:bg-[#B8860B] text-white font-bold"
                >
                  {isActive ? (isBidding ? "Đang đặt..." : "Đặt Giá") : (isUpcoming ? "Chưa bắt đầu" : "Đã kết thúc")}
                </Button>
              </Space.Compact>
            </div>

            {auction.isBuyNow && buyNowPrice && (
              <div className="mt-4">
                <Button
                  block
                  size="large"
                  onClick={handleBuyNow} 
                  loading={isProcessingBuyNow}
                  disabled={isEnded || (auction.currentPrice >= buyNowPrice)}
                  style={{
                    background: !isEnded && auction.currentPrice < buyNowPrice ? "linear-gradient(90deg,#34D399,#059669)" : undefined,
                    color: "white",
                    fontWeight: 700,
                  }}
                >
                  {isEnded
                    ? "Đã kết thúc"
                    : auction.currentPrice >= buyNowPrice
                      ? `Mua ngay không khả dụng`
                      : `Mua ngay (${buyNowPrice.toLocaleString("vi-VN")} đ)`}
                </Button>
              </div>
            )}          </Card>

          {sellerProfile && (
            <Card bordered={false} className="shadow-lg p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FiUser /> Người Bán
              </h2>
              <div className="flex items-center gap-4">
                <img
                  className="w-16 h-16 rounded-full object-cover ring-2 ring-[#D4AF37] p-0.5"
                  src={
                    sellerProfile.avatar ||
                    "https://i.pinimg.com/736x/b6/10/ae/b610ae5879e2916e1bb7c4c161754f4d.jpg"
                  }
                  alt={sellerProfile.fullName}
                />
                <div className="flex-1">
                  <p className="font-bold text-lg">{sellerProfile.fullName}</p>
                  <p className="text-sm text-green-600 flex items-center gap-1 font-semibold">
                    <FiCheckCircle /> Đã xác minh
                  </p>
                </div>
                <Link
                  to={`/seller/${sellerProfile.userId}`}
                  className="border border-[#C4B5A0] text-[#B8860B] font-semibold py-2 px-4 rounded-lg hover:bg-yellow-50"
                >
                  Xem hồ sơ
                </Link>
              </div>
            </Card>
          )}

          {bidHistory.length > 0 && (
            <Card bordered={false} className="shadow-lg p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FiTrendingUp /> Lịch Sử Đặt Giá
              </h2>
              <div className="max-h-80 overflow-y-auto pr-2">
                <List
                  itemLayout="horizontal"
                  dataSource={bidHistory}
                  renderItem={(bid) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <Avatar style={{ backgroundColor: "#B8860B", color: "white" }}>
                            {bid.fullName?.[0] || "U"}
                          </Avatar>
                        }
                        title={<span className="font-semibold">{bid.fullName || "Người dùng ẩn danh"}</span>}
                        description={<div className="text-sm text-gray-500">{new Date(bid.bidTime).toLocaleString("vi-VN")}</div>}
                      />
                      <div className="text-right">
                        <Tag color="gold" className="text-base font-semibold px-3 py-1 rounded-lg">
                          {bid.bidAmount.toLocaleString("vi-VN")} đ
                        </Tag>
                      </div>
                    </List.Item>
                  )}
                />
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuctionDetailPage;
