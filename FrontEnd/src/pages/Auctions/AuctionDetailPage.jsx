import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Spin, InputNumber, Button, List, Avatar, Card, Tag, Space, Carousel } from "antd";
import { FiClock, FiUser, FiTrendingUp, FiCheckCircle } from "react-icons/fi";
import auctionApi from "../../api/auctionApi";
import walletApi from "../../api/walletApi";
import userApi from "../../api/userApi";
import itemApi from "../../api/itemApi";

const LOGGED_IN_USER_ID = localStorage.getItem("userId");

const useCountdown = (endTimeStr) => {
  const calculateTimeRemaining = useCallback(() => {
    if (!endTimeStr) return { time: "N/A", isFinished: true };
    const now = new Date().getTime();
    const endTime = new Date(endTimeStr).getTime();
    const distance = endTime - now;
    if (distance < 0) return { time: "00h 00m 00s", isFinished: true };

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    const pad = (n) => String(n).padStart(2, "0");

    if (days > 0) return { time: `${days}d ${pad(hours)}h ${pad(minutes)}m`, isFinished: false };
    return { time: `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`, isFinished: false };
  }, [endTimeStr]);

  const [countdown, setCountdown] = useState(calculateTimeRemaining);

  useEffect(() => {
    if (!endTimeStr) return;
    const id = setInterval(() => setCountdown(calculateTimeRemaining()), 1000);
    return () => clearInterval(id);
  }, [calculateTimeRemaining, endTimeStr]);

  return countdown;
};

function AuctionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [auction, setAuction] = useState(null);
  const [sellerProfile, setSellerProfile] = useState(null);
  const [bidHistory, setBidHistory] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [bidAmount, setBidAmount] = useState(null);
  const [isBidding, setIsBidding] = useState(false);
  const [loading, setLoading] = useState(true);

  const countdown = useCountdown(auction?.endTime);

  const fetchBidHistory = useCallback(async (auctionId) => {
    try {
      const res = await auctionApi.getBiddingHistory(auctionId);
      if (Array.isArray(res)) {
        const sorted = res.sort((a, b) => new Date(b.bidTime) - new Date(a.bidTime));
        setBidHistory(sorted);
      } else {
        setBidHistory([]);
      }
    } catch {
      setBidHistory([]);
    }
  }, []);

  const fetchAuctionDetails = useCallback(async () => {
    try {
      setLoading(true);
      const auctionData = await auctionApi.getAuctionByItemId(id);
      if (!auctionData) return;

      setAuction(auctionData);
      const step = auctionData.stepPrice > 0 ? auctionData.stepPrice : 100000;
      setBidAmount((auctionData.currentPrice || auctionData.startingPrice) + step);

      const itemData = await itemApi.getItemById(auctionData.itemId);
      const seller = await userApi.getUserByID(itemData.updatedBy);
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

  const stepPrice = auction?.stepPrice && auction.stepPrice > 0 ? auction.stepPrice : 100000;
  const getMinBid = () =>
    (auction?.currentPrice || auction?.startingPrice || 0) + stepPrice;

  const handlePlaceBid = async () => {
    if (!LOGGED_IN_USER_ID) {
      navigate("/login");
      return;
    }
    const minBid = getMinBid();
    if (bidAmount < minBid || bidAmount > walletBalance) return;

    try {
      setIsBidding(true);
      const payload = { userId: LOGGED_IN_USER_ID, bidAmount };
      await auctionApi.bidAuction(auction.auctionId, payload);
      await fetchAuctionDetails();
    } finally {
      setIsBidding(false);
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#FAF8F3]">
        <Spin size="large" />
        <p className="mt-4 text-lg font-semibold text-gray-800">
          Đang tải chi tiết đấu giá...
        </p>
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
  const isOngoing = !countdown.isFinished;

  return (
    <div className="bg-[#FAF8F3] min-h-screen py-8 px-4 font-['Inter']">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* LEFT SIDE */}
        <div className="lg:col-span-3">
          <Card bordered={false} className="shadow-lg rounded-lg overflow-hidden">
            {images.length > 0 ? (
              <Carousel autoplay arrows className="rounded-lg">
                {images.map((url, idx) => (
                  <div key={idx}>
                    <img src={url} alt={`image-${idx}`} className="w-full object-cover aspect-[3/2]" />
                  </div>
                ))}
              </Carousel>
            ) : (
              <img
                src={`https://placehold.co/600x400/E8E4DC/2C2C2C?text=${encodeURIComponent(auction.title || "No Image")}`}
                alt="No Image"
                className="w-full object-cover aspect-[3/2]"
              />
            )}
          </Card>

          <Card bordered={false} className="shadow-lg p-6 rounded-lg mt-6">
            <h2 className="text-2xl font-bold border-b pb-4 mb-4">Mô Tả Chi Tiết</h2>
            <p className="text-gray-700 leading-relaxed">{auction.description || "Không có mô tả."}</p>
            <p className="mt-4 text-gray-700">
              <span className="font-semibold">Bước giá:</span>{" "}
              {stepPrice.toLocaleString("vi-VN")} đ
            </p>
          </Card>
        </div>

        {/* RIGHT SIDE */}
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
                <span className="text-sm text-gray-500">
                  Tối thiểu: {getMinBid().toLocaleString("vi-VN")} đ
                </span>
              </p>
              <p className="text-sm mb-2">
                Số dư ví:{" "}
                <span className="font-bold text-[#B8860B] ml-1">
                  {walletBalance.toLocaleString("vi-VN")} đ
                </span>
              </p>
              <Space.Compact style={{ width: "100%" }}>
                <InputNumber
                  size="large"
                  value={bidAmount}
                  onChange={setBidAmount}
                  min={getMinBid()}
                  step={stepPrice}
                  formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  parser={(v) => (v ? parseInt(v.replace(/\D/g, "")) : 0)}
                  addonAfter="VND"
                  disabled={!isOngoing}
                  style={{ width: "100%" }}
                />
                <Button
                  type="primary"
                  size="large"
                  loading={isBidding}
                  disabled={!isOngoing}
                  onClick={handlePlaceBid}
                  className="bg-[#D4AF37] hover:bg-[#B8860B] text-white font-bold"
                >
                  {isOngoing ? "Đặt Giá" : "Đã kết thúc"}
                </Button>
              </Space.Compact>
            </div>
          </Card>

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
                        description={
                          <div className="text-sm text-gray-500">
                            {new Date(bid.bidTime).toLocaleString("vi-VN")}
                          </div>
                        }
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
