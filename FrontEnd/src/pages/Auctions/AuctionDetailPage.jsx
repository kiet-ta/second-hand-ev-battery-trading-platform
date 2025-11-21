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
  Alert,
} from "antd";
import { FiClock, FiUser, FiTrendingUp, FiCheckCircle } from "react-icons/fi";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import auctionApi from "../../api/auctionApi";
import walletApi from "../../api/walletApi";
import userApi from "../../api/userApi";
import itemApi from "../../api/itemApi";

const LOGGED_IN_USER_ID = localStorage.getItem("userId");

// ---------------- Countdown Hook ----------------
const useCountdown = (endTimeStr) => {
  const calculateTimeRemaining = useCallback(() => {
    if (!endTimeStr) return { time: "N/A", isFinished: true };
    const now = new Date().getTime();
    const endTime = new Date(endTimeStr).getTime();
    const distance = endTime - now;
    if (distance < 0) return { time: "00h 00m 00s", isFinished: true };

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    const pad = (n) => String(n).padStart(2, "0");

    if (days > 0)
      return {
        time: `${days}d ${pad(hours)}h ${pad(minutes)}m`,
        isFinished: false,
      };

    return {
      time: `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`,
      isFinished: false,
    };
  }, [endTimeStr]);

  const [countdown, setCountdown] = useState(calculateTimeRemaining);

  useEffect(() => {
    if (!endTimeStr) return;
    const id = setInterval(() => setCountdown(calculateTimeRemaining()), 1000);
    return () => clearInterval(id);
  }, [calculateTimeRemaining, endTimeStr]);

  return countdown;
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

  // 🎯 NEW: manual-carousel like EVDetail
  const [selectedImage, setSelectedImage] = useState(0);

  const stepPrice =
    auction?.stepPrice && auction.stepPrice > 0 ? auction.stepPrice : 100000;

  const countdown = useCountdown(auction?.endTime);

  // ---------------- SignalR Setup ----------------
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setErrorMsg("Bạn chưa đăng nhập. Không thể kết nối real-time.");
      return;
    }

    const newConnection = new HubConnectionBuilder()
      .withUrl("https://localhost:7272/auctionHub", {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);

    newConnection.start().catch((err) => console.error("Connection failed:", err));

    return () => newConnection.stop();
  }, []);

  useEffect(() => {
    if (connection && auction?.auctionId) {
      connection.invoke("JoinAuctionGroup", auction.auctionId.toString());

      return () => {
        connection.invoke("LeaveAuctionGroup", auction.auctionId.toString());
      };
    }
  }, [connection, auction?.auctionId]);

  useEffect(() => {
    if (connection) {
      const handleNewBid = (newBidData) => {
        setAuction((prev) => ({
          ...prev,
          currentPrice: newBidData.bidAmount,
        }));

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

      const step =
        auctionData.stepPrice > 0 ? auctionData.stepPrice : 100000;
      setBidAmount(
        (auctionData.currentPrice || auctionData.startingPrice) + step
      );

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
  const getMinBid = () =>
    (auction?.currentPrice || auction?.startingPrice || 0) + stepPrice;

  const handlePlaceBid = async () => {
    if (!LOGGED_IN_USER_ID) return navigate("/login");

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
  const displayImage =
    images[selectedImage] ||
    "https://placehold.co/800x600/eee/999?text=No+Image";

  const displayPrice = auction.currentPrice || auction.startingPrice || 0;
  const isOngoing = !countdown.isFinished;

  // NAV Buttons for image
  const handlePrev = () => {
    if (!images.length) return;
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
  };
  const handleNext = () => {
    if (!images.length) return;
    setSelectedImage((prev) => (prev + 1) % images.length);
  };

  return (
    <div className="bg-[#FAF8F3] min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* LEFT SIDE: IMAGE GALLERY */}
        <div className="lg:col-span-3 space-y-6">

          {/* IMAGE CARD */}
          <Card className="p-0 rounded-2xl shadow-md overflow-hidden">
            <div className="relative">
              <img
                src={displayImage}
                alt="Auction Image"
                className="w-full object-cover aspect-[3/2]"
              />

              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-[#FFF7E5]/80 p-3 rounded-full hover:bg-[#FBE6A2]"
                  >
                    <FaChevronLeft className="text-[#B8860B]" />
                  </button>

                  <button
                    onClick={handleNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-[#FFF7E5]/80 p-3 rounded-full hover:bg-[#FBE6A2]"
                  >
                    <FaChevronRight className="text-[#B8860B]" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            <div className="flex gap-3 p-4 bg-[#FFFDF9] border-t">
              {images.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  onClick={() => setSelectedImage(i)}
                  className={`w-20 h-20 rounded-lg object-cover cursor-pointer border-2 ${
                    selectedImage === i
                      ? "border-[#B8860B]"
                      : "border-[#EAE6DA]"
                  }`}
                />
              ))}
            </div>
          </Card>

          {/* DESCRIPTION */}
          <Card className="p-6 shadow-md rounded-2xl">
            <h2 className="text-2xl font-bold border-b pb-4 mb-4">
              Mô Tả Chi Tiết
            </h2>
            <p className="text-gray-700">{auction.description}</p>
          </Card>
        </div>

        {/* RIGHT SIDE (unchanged logic) */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          <Card className="p-6 shadow-md rounded-2xl">
            <h1 className="text-3xl font-bold mb-2">{auction.title}</h1>

            <div className="bg-yellow-50 p-4 rounded-lg border text-center">
              <p className="text-sm text-gray-600">Thời gian còn lại</p>
              <div className="flex justify-center items-center gap-2">
                <FiClock className="text-2xl text-[#B8860B]" />
                <span className="text-3xl font-bold">
                  {isOngoing ? countdown.time : "ĐÃ KẾT THÚC"}
                </span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-gray-600">Giá hiện tại</p>
                  <p className="text-4xl font-bold text-[#B8860B]">
                    {displayPrice.toLocaleString("vi-VN")} đ
                  </p>
                </div>
                <Tag color="gold">Bước giá: {stepPrice.toLocaleString()} đ</Tag>
              </div>
            </div>

            <div className="mt-6">
              <p className="font-semibold mb-2">
                Giá của bạn
                <span className="float-right text-sm text-gray-500">
                  Tối thiểu: {getMinBid().toLocaleString("vi-VN")} đ
                </span>
              </p>

              {errorMsg && (
                <Alert className="mb-3" type="error" message={errorMsg} showIcon />
              )}

              <Space.Compact style={{ width: "100%" }}>
                <InputNumber
                  size="large"
                  value={bidAmount}
                  onChange={setBidAmount}
                  min={getMinBid()}
                  step={stepPrice}
                  formatter={(v) =>
                    `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(v) => parseInt(v.replace(/\D/g, ""))}
                  addonAfter="VND"
                  disabled={!isOngoing}
                  style={{ width: "100%" }}
                />

                <Button
                  type="primary"
                  loading={isBidding}
                  disabled={!isOngoing}
                  onClick={handlePlaceBid}
                  className="bg-[#D4AF37] hover:bg-[#B8860B]"
                >
                  {isOngoing ? "Đặt Giá" : "Đã kết thúc"}
                </Button>
              </Space.Compact>
            </div>
          </Card>

          {/* SELLER */}
          {sellerProfile && (
            <Card className="p-6 shadow-md rounded-2xl">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FiUser /> Người Bán
              </h2>

              <div className="flex items-center gap-4">
                <img
                  className="w-16 h-16 rounded-full ring-2 ring-[#D4AF37]"
                  src={
                    sellerProfile.avatar ||
                    "https://i.pinimg.com/736x/b6/10/ae/b610ae5879e2916e1bb7c4c161754f4d.jpg"
                  }
                />

                <div className="flex-1">
                  <p className="font-bold text-lg">{sellerProfile.fullName}</p>
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <FiCheckCircle /> Đã xác minh
                  </p>
                </div>

                <Link
                  to={`/seller/${sellerProfile.userId}`}
                  className="border px-4 py-2 rounded-lg text-[#B8860B]"
                >
                  Xem hồ sơ
                </Link>
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
                      avatar={
                        <Avatar style={{ background: "#B8860B", color: "#fff" }}>
                          {bid.fullName?.[0] || "U"}
                        </Avatar>
                      }
                      title={<b>{bid.fullName || "Người dùng"}</b>}
                      description={new Date(bid.bidTime).toLocaleString("vi-VN")}
                    />
                    <Tag color="gold" className="text-base px-3">
                      {bid.bidAmount.toLocaleString("vi-VN")} đ
                    </Tag>
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