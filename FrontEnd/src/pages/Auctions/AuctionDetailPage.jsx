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
    const hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
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
  const stepPrice =
    auction?.stepPrice && auction.stepPrice > 0 ? auction.stepPrice : 100000;

  const countdown = useCountdown(auction?.endTime);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No access token found. SignalR cannot authenticate.");
      setErrorMsg("Bạn chưa đăng nhập. Không thể kết nối real-time.");
      return;
    }
    // 1. Create the connection
    const newConnection = new HubConnectionBuilder()
      .withUrl("https://localhost:7272/auctionHub", {
        accessTokenFactory: () => token,
      }) // Make sure this URL is correct
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);

    // 2. Start the connection
    newConnection
      .start()
      .then(() => {
        console.log("Real-time connection established.");
        setConnection(newConnection);
      })
      .catch((err) => console.error("Connection failed: ", err));

    // 3. MUST HAVE: Clean up (disconnect) when component unmounts
    return () => {
      if (newConnection) {
        // We stop the connection, no need to invoke LeaveGroup here
        // The server (SignalR Hub) should handle disconnects automatically
        newConnection.stop();
      }
    };
  }, []);

  useEffect(() => {
    // Only join group if we have a connection AND an auctionId
    if (connection && auction?.auctionId) {
      connection
        .invoke("JoinAuctionGroup", auction.auctionId.toString())
        .then(() => console.log(`Joined auction group: ${auction.auctionId}`))
        .catch((err) => console.error("Failed to join group: ", err));

      // Return a cleanup function to leave the group
      return () => {
        if (connection) {
          connection
            .invoke("LeaveAuctionGroup", auction.auctionId.toString())
            .then(() => console.log(`Left auction group: ${auction.auctionId}`))
            .catch((err) => console.error("Failed to leave group: ", err));
        }
      };
    }
  }, [connection, auction?.auctionId]); // Depends on connection and auctionId

  // --- SignalR Event Listener (Lifecycle: When connection/stepPrice changes) ---
  useEffect(() => {
    if (connection) {
      const handleNewBid = (newBidData) => {
        // newBidData is what the SERVER broadcasts.
        // e.g., { fullName: "User B", bidAmount: 550000, bidTime: "..." }
        console.log("Received new bid:", newBidData);

        // Update the state with the new data from server (the source of truth)
        setAuction((previousAuction) => ({
          ...previousAuction,
          currentPrice: newBidData.bidAmount,
        }));

        // Add to bid history
        setBidHistory((previousHistory) => [newBidData, ...previousHistory]);

        // Update the next bid amount in the input
        // We use stepPrice from the component state, which is correct.
        setBidAmount(newBidData.bidAmount + stepPrice);
      };

      // 1. Listen for "ReceiveNewBid" event from server
      connection.on("ReceiveCurrentState", handleNewBid);

      // Clean up the listener
      return () => {
        connection.off("ReceiveCurrentState", handleNewBid);
      };
    }
  }, [connection, stepPrice]); // This dependency is correct.

  const fetchBidHistory = useCallback(async (auctionId) => {
    try {
      const res = await auctionApi.getBiddingHistory(auctionId);
      if (Array.isArray(res)) {
        const sorted = res.sort(
          (a, b) => new Date(b.bidTime) - new Date(a.bidTime),
        );
        setBidHistory(sorted);
      } else {
        setBidHistory([]);
      }
    } catch (error) {
      console.error("Failed to fetch bid history:", error);
      setBidHistory([]);
    }
  }, []);

  const fetchAuctionDetails = useCallback(async () => {
    try {
      setLoading(true);
      const auctionData = await auctionApi.getAuctionByItemId(id);
      if (!auctionData) throw new Error("Auction not found");

      setAuction(auctionData);
      const step = auctionData.stepPrice > 0 ? auctionData.stepPrice : 100000;
      setBidAmount(
        (auctionData.currentPrice || auctionData.startingPrice) + step,
      );

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

  const getMinBid = () =>
    (auction?.currentPrice || auction?.startingPrice || 0) + stepPrice;

  const handlePlaceBid = async () => {
    if (!LOGGED_IN_USER_ID) {
      navigate("/login");
      return;
    }
    if (!auction) {
      setErrorMsg("Auction data is not ready.");
      return;
    }
    const minBid = getMinBid();
    if (bidAmount < minBid) {
      setErrorMsg(`Giá đặt phải tối thiểu ${minBid.toLocaleString("vi-VN")} đ`);
      return;
    }
    if (bidAmount > walletBalance) {
      setErrorMsg("Số dư ví của bạn không đủ để đặt giá này.");
      return;
    }

    if (!connection) {
      setErrorMsg("Real-time service is not connected. Please refresh.");
      return;
    }
    try {
      setIsBidding(true);
      setErrorMsg("");

      await connection.invoke("PlaceBid", auction.auctionId, bidAmount);
    } catch (err) {
      console.error("Failed to place bid via real-time:", err);
      // The server can 'throw' an error back via SignalR
      setErrorMsg(err.message || "Không thể đặt giá. Vui lòng thử lại.");
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
          <Card
            bordered={false}
            className="shadow-lg rounded-lg overflow-hidden"
          >
            {images.length > 0 ? (
              <Carousel autoplay arrows className="rounded-lg">
                {images.map((url, idx) => (
                  <div key={idx}>
                    <img
                      src={url}
                      alt={`image-${idx}`}
                      className="w-full object-cover aspect-[3/2]"
                    />
                  </div>
                ))}
              </Carousel>
            ) : (
              <img
                src={`https://placehold.co/600x400/E8E4DC/2C2C2C?text=${encodeURIComponent(
                  auction.title || "No Image",
                )}`}
                alt="No Image"
                className="w-full object-cover aspect-[3/2]"
              />
            )}
          </Card>

          <Card bordered={false} className="shadow-lg p-6 rounded-lg mt-6">
            <h2 className="text-2xl font-bold border-b pb-4 mb-4">
              Mô Tả Chi Tiết
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {auction.description || "Không có mô tả."}
            </p>
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
              <p className="text-sm font-medium text-gray-600">
                Thời gian còn lại
              </p>
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
                <Tag color="gold">
                  Bước giá: {stepPrice.toLocaleString("vi-VN")} đ
                </Tag>
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

              {errorMsg && (
                <Alert
                  message={errorMsg}
                  type="error"
                  showIcon
                  closable={false}
                  className="mb-3 rounded-lg"
                />
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
                          <Avatar
                            style={{
                              backgroundColor: "#B8860B",
                              color: "white",
                            }}
                          >
                            {bid.fullName?.[0] || "U"}
                          </Avatar>
                        }
                        title={
                          <span className="font-semibold">
                            {bid.fullName || "Người dùng ẩn danh"}
                          </span>
                        }
                        description={
                          <div className="text-sm text-gray-500">
                            {new Date(bid.bidTime).toLocaleString("vi-VN")}
                          </div>
                        }
                      />
                      <div className="text-right">
                        <Tag
                          color="gold"
                          className="text-base font-semibold px-3 py-1 rounded-lg"
                        >
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
