import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Spin, Card } from 'antd';
import {
  FiMessageSquare,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiTrendingUp
} from 'react-icons/fi';
import { FaStar, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { GiGemChain } from "react-icons/gi";
import itemApi from '../api/itemApi';
import userApi from '../api/userApi';
import chatApi from '../api/chatApi';
import reviewApi from '../api/reviewApi';

// ⭐ Star Rating Component
const StarRating = ({ rating }) => (
  <div className="flex items-center">
    {Array.from({ length: 5 }).map((_, i) => (
      <FaStar key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'} />
    ))}
  </div>
);

// ✅ Verified Check
const VerifiedCheck = () => (
  <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
    <svg className="w-3 h-3 mr-1 text-green-500" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd" />
    </svg>
    Đã duyệt
  </div>
);

function EVDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const itemId = location.state;

  const [item, setItem] = useState(null);
  const [sellerProfile, setSellerProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isPhoneVisible, setIsPhoneVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  // Carousel controls
  const handlePrev = useCallback(() => {
    if (!item?.itemImage) return;
    const count = item.itemImage.length;
    setSelectedImage(prev => (prev - 1 + count) % count);
  }, [item]);

  const handleNext = useCallback(() => {
    if (!item?.itemImage) return;
    const count = item.itemImage.length;
    setSelectedImage(prev => (prev + 1) % count);
  }, [item]);

  // Fetch data
  useEffect(() => {
    if (!itemId) {
      setFeedback({ type: "error", msg: "Không tìm thấy sản phẩm." });
      setLoading(false);
      return;
    }

    const fetchItemData = async () => {
      try {
        setLoading(true);
        const itemData = await itemApi.getItemDetailByID(itemId);
        setItem(itemData);
        setIsVerified(itemData.moderation === 'approved_tag');

        const seller = await userApi.getUserByID(itemData.updatedBy);
        setSellerProfile(seller);

        const reviewRes = await reviewApi.getReviewByItemID(itemId);
        const rawReviews = reviewRes.exists || [];

        const enriched = await Promise.all(rawReviews.map(async r => {
          try {
            const user = await userApi.getUserByID(r.reviewerId);
            return {
              ...r,
              name: user.fullName,
              picture: user.avatarProfile || 'https://via.placeholder.com/48'
            };
          } catch {
            return { ...r, name: 'Người dùng ẩn danh', picture: 'https://via.placeholder.com/48' };
          }
        }));

        setReviews(enriched);
      } catch (err) {
        console.error(err);
        setFeedback({ type: "error", msg: "Không thể tải chi tiết sản phẩm." });
      } finally {
        setLoading(false);
      }
    };

    fetchItemData();
  }, [itemId]);

  const checkLogin = (action) => {
    const userId = parseInt(localStorage.getItem("userId"), 10);
    if (isNaN(userId)) {
      setFeedback({ type: "error", msg: "Vui lòng đăng nhập để tiếp tục." });
      navigate("/login");
      return;
    }
    action(userId);
  };

  const handleChatWithSeller = async () => {
    checkLogin(async (buyerId) => {
      const sellerId = item?.updatedBy;
      if (!sellerId || buyerId === sellerId) {
        setFeedback({ type: "error", msg: "Không thể nhắn tin cho chính mình." });
        return;
      }

      try {
        setFeedback({ type: "loading", msg: "Đang tạo cuộc trò chuyện..." });
        const room = await chatApi.createChatRoom(buyerId, sellerId);
        setFeedback({ type: "success", msg: "Đã mở cuộc trò chuyện với người bán!" });
        setTimeout(() => {
          navigate('/profile/chats', {
            state: {
              activeSection: 'chat',
              chatRoomId: room.cid,
              receiverId: sellerId
            }
          });
        }, 1200);
      } catch {
        setFeedback({ type: "error", msg: "Không thể bắt đầu trò chuyện. Kiểm tra kết nối mạng." });
      }
    });
  };

  const handleShowPhone = () => checkLogin(() => setIsPhoneVisible(prev => !prev));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#FAF8F3]">
        <Spin size="large" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center text-gray-700 py-10">
        Không tìm thấy thông tin sản phẩm.
      </div>
    );
  }

  const { evDetail } = item;
  const imageUrls = item.itemImage?.map(i => i.imageUrl) || [];
  const displayImage = imageUrls[selectedImage] || 'https://placehold.co/1200x800/eee/999?text=EV+Image';
  const price = item.price?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) || "N/A";

  const keySpecs = [
    { label: 'Thương hiệu', value: evDetail?.brand },
    { label: 'Mẫu xe', value: evDetail?.model },
    { label: 'Kiểu dáng', value: evDetail?.bodyStyle },
    { label: 'Màu sắc', value: evDetail?.color },
    { label: 'Biển số', value: evDetail?.licensePlate },
  ];

  return (
    <div className="bg-[#FAF8F3] min-h-screen p-6 lg:p-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">

        {/* LEFT: Image + Specs + Description */}
        <div className="lg:col-span-3 flex flex-col gap-8">

          <Card className="p-0 rounded-2xl overflow-hidden shadow-md border border-[#EAE6DA]">
            <div className="relative">
              <img
                src={displayImage}
                alt={item.title}
                className="w-full object-cover aspect-[3/2]"
              />
              {imageUrls.length > 1 && (
                <>
                  <button
                    onClick={handlePrev}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-[#FFF7E5]/70 p-3 rounded-full hover:bg-[#FBE6A2]/90 transition-all">
                    <FaChevronLeft className="text-[#B8860B]" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-[#FFF7E5]/70 p-3 rounded-full hover:bg-[#FBE6A2]/90 transition-all">
                    <FaChevronRight className="text-[#B8860B]" />
                  </button>
                </>
              )}
            </div>
            <div className="flex gap-3 p-4 bg-[#FFFDF9] border-t">
              {imageUrls.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  onClick={() => setSelectedImage(i)}
                  className={`w-20 h-20 rounded-lg object-cover cursor-pointer border-2 ${selectedImage === i
                    ? "border-[#B8860B]"
                    : "border-[#EAE6DA]"}`}
                />
              ))}
            </div>
          </Card>

          <Card className="p-6 shadow-md border border-[#EAE6DA] rounded-2xl bg-white/90">
            <h2 className="text-2xl font-bold text-[#B8860B] mb-4 border-b border-[#EAE6DA] pb-2">
              Thông số kỹ thuật
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {keySpecs.map((s) => s.value && (
                <div key={s.label}>
                  <p className="text-sm text-gray-500">{s.label}</p>
                  <p className="font-semibold text-gray-800">{s.value}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 shadow-md border border-[#EAE6DA] rounded-2xl bg-white/90">
            <h2 className="text-2xl font-bold text-[#B8860B] mb-4 border-b border-[#EAE6DA] pb-2">
              Mô tả xe
            </h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {item.description}
            </p>
          </Card>
        </div>

        {/* RIGHT: Info + Seller + Reviews */}
        <div className="lg:col-span-2 flex flex-col gap-8">

          <Card className="p-6 rounded-2xl shadow-md border border-[#EAE6DA] bg-white/90">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-[#3A3A3A]">{item.title}</h1>
              {isVerified && <VerifiedCheck />}
            </div>

            {evDetail && (
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-gray-600 mt-2">
                <div className="flex items-center gap-2"><FiCalendar />{evDetail.year}</div>
                <div className="flex items-center gap-2"><FiTrendingUp />{evDetail.mileage} km</div>
                <div className="flex items-center gap-2"><FiMapPin />{evDetail.location || 'N/A'}</div>
              </div>
            )}

            {evDetail?.hasAccessories && (
              <div className="bg-emerald-100 text-emerald-800 px-3 py-1 mt-3 inline-flex items-center gap-2 rounded-full text-sm font-medium">
                <GiGemChain /> Bao gồm phụ kiện
              </div>
            )}

            <div className="bg-[#FFF7E5] p-4 mt-4 rounded-lg text-center shadow-inner">
              <span className="text-4xl font-bold text-[#B8860B]">{price}</span>
            </div>

            {feedback && (
              <div
                className={`mt-4 px-4 py-3 rounded-lg text-sm font-semibold ${
                  feedback.type === "success"
                    ? "bg-green-100 text-green-800"
                    : feedback.type === "loading"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {feedback.msg}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={handleChatWithSeller}
                className="flex-1 bg-[#B8860B] text-white font-bold py-3 px-6 rounded-lg hover:bg-[#A47500] transition">
                <FiMessageSquare className="inline mr-2" />
               Liên hệ người bán
              </button>
              <button
                onClick={handleShowPhone}
                className="flex-1 bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition">
                <FiPhone className="inline mr-2" />
                {isPhoneVisible ? sellerProfile?.phone || 'Không có số' : 'Hiện số điện thoại'}
              </button>
            </div>
          </Card>

          {sellerProfile && (
            <Card className="p-6 rounded-2xl shadow-md border border-[#EAE6DA] bg-white/90 flex items-center gap-4">
              <img
                src={sellerProfile.avatarProfile || "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"}
                alt={sellerProfile.fullName}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className="flex-1 mb-5">
                <p className="font-bold text-lg">{sellerProfile.fullName}</p>
                <p className="text-sm text-green-600">Đang hoạt động</p>
              </div>
              <Link
                to={`/seller/${item.updatedBy}`}
                className="border border-[#B8860B] text-[#B8860B] font-semibold py-2 px-4 rounded-lg hover:bg-[#FFF7E5] transition">
                Xem hồ sơ
              </Link>
            </Card>
          )}

          <Card className="p-6 rounded-2xl shadow-md border border-[#EAE6DA] bg-white/90">
            <h2 className="text-2xl font-bold text-[#B8860B] mb-4">Đánh giá ({reviews.length})</h2>
            <div className="flex flex-col gap-6 max-h-96 overflow-y-auto">
              {reviews.length > 0 ? (
                reviews.map((r, i) => (
                  <div key={r.reviewId || i} className="flex gap-4 border-b pb-4">
                    <img src={r.picture} alt={r.name} className="w-12 h-12 rounded-full object-cover" />
                    <div>
                      <p className="font-bold">{r.name}</p>
                      <StarRating rating={r.rating} />
                      <p className="text-gray-700 mt-1">{r.comment}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center">Chưa có đánh giá cho sản phẩm này.</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default EVDetails;
