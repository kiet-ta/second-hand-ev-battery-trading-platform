import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Spin, Card } from "antd";
import {
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiTrendingUp,
  FiHeart,
  FiMessageSquare,
  FiUser,
  FiShoppingCart,
  FiCreditCard,
} from "react-icons/fi";
import { FaStar, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { GiGemChain } from "react-icons/gi";
import itemApi from "../../api/itemApi";
import userApi from "../../api/userApi";
import reviewApi from "../../api/reviewApi";
import ChatWithSellerButton from "../../components/Buttons/ChatWithSellerButton";
import placeholder from "../../assets/images/placeholder.png";
import { useParams } from "react-router-dom";
import orderItemApi from "../../api/orderItemApi";
import addressLocalApi from "../../api/addressLocalApi";


// Star Rating Component
const StarRating = ({ rating }) => (
  <div className="flex items-center">
    {Array.from({ length: 5 }).map((_, i) => (
      <FaStar
        key={i}
        className={i < rating ? "text-yellow-400" : "text-gray-300"}
      />
    ))}
  </div>
);

// Verified Tag
const VerifiedCheck = () => (
  <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
    <svg
      className="w-3 h-3 mr-1 text-green-500"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
    Đã duyệt
  </div>
);

function EVDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [availableStock, setAvailableStock] = useState(0);
  const [cartQuantity, setCartQuantity] = useState(0);
  const [sellerProfile, setSellerProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPhoneVisible, setIsPhoneVisible] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);




  const userId = parseInt(localStorage.getItem("userId"), 10);



  // Carousel Controls
  const handlePrev = useCallback(() => {
    if (!item?.itemImage) return;
    const count = item.itemImage.length;
    setSelectedImage((prev) => (prev - 1 + count) % count);
  }, [item]);

  const handleNext = useCallback(() => {
    if (!item?.itemImage) return;
    const count = item.itemImage.length;
    setSelectedImage((prev) => (prev + 1) % count);
  }, [item]);

  // Fetch item, seller, and reviews
  useEffect(() => {
    if (!id) {
      setFeedback({ type: "error", msg: "Không tìm thấy sản phẩm." });
      setLoading(false);
      return;
    }

    const fetchItemData = async () => {
      try {
        setLoading(true);
        const itemData = await itemApi.getItemDetailByID(id);
        setItem(itemData);
        setIsVerified(itemData.moderation === "Approved");

        const seller = await userApi.getUserByID(itemData.updatedBy);
        setSellerProfile(seller);

        const reviewRes = await reviewApi.getReviewByItemID(id);
        const rawReviews = reviewRes || [];
        const latestReviewsMap = new Map();

        for (const review of rawReviews) {
          const existingReview = latestReviewsMap.get(review.reviewerId);
          if (!existingReview || new Date(review.createdAt) > new Date(existingReview.createdAt)) {
            latestReviewsMap.set(review.reviewerId, review);
          }
        }
        const latestReviews = Array.from(latestReviewsMap.values());
        const enriched = await Promise.all(
          latestReviews.map(async (r) => {
            try {
              const user = await userApi.getUserByID(r.reviewerId);
              return {
                ...r,
                name: user.fullName,
                picture: user.avatarProfile || "https://via.placeholder.com/48",
              };
            } catch {
              return {
                ...r,
                name: "Người dùng ẩn danh",
                picture: "https://via.placeholder.com/48",
              };
            }
          })
        );

        setReviews(enriched);
        console.log(enriched);
      } catch (err) {
        console.error("❌ Lỗi tải dữ liệu sản phẩm:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchItemData();
  }, [id]);

  const handleAddToCart = useCallback(async () => {
    const buyerId = localStorage.getItem("userId");
    if (!buyerId) {
      navigate("/login");
      return;
    }

    if (!item || quantity < 1) {
      setFeedback({ type: "error", msg: "Vui lòng chọn số lượng hợp lệ." });
      return;
    }

    setIsProcessing(true);

    try {
      // 👉  GIỐNG HỆ PIN – chỉ khác name EV
      const payload = {
        buyerId: buyerId,
        itemId: Number(id),
        quantity: Number(quantity),
        price: Number(item.price), // phải là SỐ !!!
      };

      console.log("📤 Payload gửi BE:", payload);  // Kiểm tra nếu lỗi

      await orderItemApi.postOrderItem(payload);

      setFeedback({
        type: "success",
        msg: `Đã thêm ${quantity} x "${item.title}" vào giỏ hàng.`,
      });

      setCartQuantity(prev => prev + quantity);

    } catch (error) {
      console.error("Add to cart error:", error);
      setFeedback({
        type: "error",
        msg: "Không thể thêm giỏ hàng!",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [item, quantity]);

  const handleBuyNow = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const userId = localStorage.getItem("userId");
    if (!userId) {
      navigate("/login");
      return;
    }

    setIsProcessing(true);
    try {
      const orderItemPayload = {
        buyerId: userId,
        itemId: id,
        quantity: 1,
        price: item.price,
      };

      const createdOrderItem = await orderItemApi.postOrderItem(orderItemPayload);
      if (!createdOrderItem?.orderItemId)
        throw new Error("Không thể tạo OrderItem.");

      const allAddresses = await addressLocalApi.getAddressByUserId(userId);
      const defaultAddress =
        allAddresses.find((addr) => addr.isDefault) || allAddresses[0];

      if (!defaultAddress) {
        navigate("/profile/address");
        return;
      }
      const checkoutData = {
        source: "buyNow",
        totalAmount: item.price,
        orderItems: [
          {
            id: createdOrderItem.orderItemId,
            name: item.title || "Sản phẩm",
            price: item.price,
            quantity: 1,
            image:
              item.itemImage?.[0]?.imageUrl ||
              "https://placehold.co/100x100/e2e8f0/374151?text=?",
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
      setIsProcessing(false);
    }
  };

  const handleShowPhone = () => {
    if (isNaN(userId)) {
      setFeedback({ type: "error", msg: "Vui lòng đăng nhập để xem số điện thoại." });
      navigate("/login");
      return;
    }
    setIsPhoneVisible((prev) => !prev);
  };

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
  const imageUrls = item.itemImage?.map((i) => i.imageUrl) || [];
  const displayImage =
    imageUrls[selectedImage] ||
    "https://placehold.co/1200x800/eee/999?text=EV+Image";
  const price =
    item.price?.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    }) || "N/A";

  const keySpecs = [
    { label: "Thương hiệu", value: evDetail?.brand },
    { label: "Mẫu xe", value: evDetail?.model },
    { label: "Kiểu dáng", value: evDetail?.bodyStyle },
    { label: "Màu sắc", value: evDetail?.color },
    { label: "Biển số", value: evDetail?.licensePlate },
  ];

  return (
    <div className="bg-[#FAF8F3] min-h-screen p-6 lg:p-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* LEFT SIDE: IMAGES + DESCRIPTION */}
        <div className="lg:col-span-3 flex flex-col gap-8">
          {/* Image Gallery */}
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
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-[#FFF7E5]/70 p-3 rounded-full hover:bg-[#FBE6A2]/90 transition-all"
                  >
                    <FaChevronLeft className="text-[#B8860B]" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-[#FFF7E5]/70 p-3 rounded-full hover:bg-[#FBE6A2]/90 transition-all"
                  >
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
                    : "border-[#EAE6DA]"
                    }`}
                />
              ))}
            </div>
          </Card>

          {/* Specs */}
          <Card className="p-6 shadow-md border border-[#EAE6DA] rounded-2xl bg-white/90">
            <h2 className="text-2xl font-bold text-[#B8860B] mb-4 border-b border-[#EAE6DA] pb-2">
              Thông số kỹ thuật
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {keySpecs.map(
                (s) =>
                  s.value && (
                    <div key={s.label}>
                      <p className="text-sm text-gray-500">{s.label}</p>
                      <p className="font-semibold text-gray-800">{s.value}</p>
                    </div>
                  )
              )}
            </div>
          </Card>

          {/* Description */}
          <Card className="p-6 shadow-md border border-[#EAE6DA] rounded-2xl bg-white/90">
            <h2 className="text-2xl font-bold text-[#B8860B] mb-4 border-b border-[#EAE6DA] pb-2">
              Mô tả xe
            </h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {item.description}
            </p>
          </Card>
        </div>

        {/* RIGHT SIDE: SELLER INFO + CHAT + REVIEWS */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Main Info */}
          <Card className="p-6 rounded-2xl shadow-md border border-[#EAE6DA] bg-white/90">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-[#3A3A3A]">
                {item.title}
              </h1>
              {isVerified && <VerifiedCheck />}
            </div>

            {evDetail && (
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-gray-600 mt-2">
                <div className="flex items-center gap-2">
                  <FiCalendar />
                  {evDetail.year}
                </div>
                <div className="flex items-center gap-2">
                  <FiTrendingUp />
                  {evDetail.mileage} km
                </div>
                <div className="flex items-center gap-2">
                  <FiMapPin />
                  {evDetail.location || "N/A"}
                </div>
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
                className={`mt-4 px-4 py-3 rounded-lg text-sm font-semibold ${feedback.type === "success"
                  ? "bg-green-100 text-green-800"
                  : feedback.type === "loading"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-700"
                  }`}
              >
                {feedback.msg}
              </div>
            )}

            {/* Chat Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={handleAddToCart}
                className="flex-1 font-bold py-3 px-6 rounded-lg transition bg-[#B8860B] text-white hover:bg-[#A47500]"
              >
                <FiShoppingCart className="inline mr-2" />
                Thêm vào giỏ hàng
              </button>
              <button
                onClick={handleBuyNow}
                className={`flex-1 font-bold py-3 px-6 rounded-lg transition
                bg-green-600 text-white hover:bg-green-700"
                  }`}
              >
                <FiCreditCard className="inline mr-2" />
                Mua ngay
              </button>



            </div>
          </Card>

          {/* Seller Profile */}
          {sellerProfile && (
            <Card className="p-6 rounded-2xl shadow-md border border-[#EAE6DA] bg-white/90">
              <div className="flex flex-col gap-3 mt-3">
                <img
                  src={sellerProfile.avatarProfile || placeholder}
                  alt={sellerProfile.fullName}
                  className="w-16 h-16 rounded-full border-2 border-[#B8860B] shadow-lg object-cover"
                />

                <div className="flex-1 ml-1">
                  <p className="font-bold text-lg">{sellerProfile.fullName}</p>
                  <p className="text-sm text-green-600">Đang hoạt động</p>
                </div>

                {/* VIEW PROFILE */}
                <Link
                  to={`/seller/${item.updatedBy}`}
                  className="flex items-center justify-center gap-2
      bg-white border-[2px] border-[#B8860B] text-[#B8860B]
      font-semibold px-4 py-3 rounded-full shadow-sm
      hover:bg-[#FFF2D1] hover:shadow-md hover:scale-[1.02]
      transition-all duration-200"
                >
                  <FiUser className="text-lg" /> Hồ sơ
                </Link>

                {/* CHAT + FAVORITE (CHỈ GỌI COMPONENT) */}
                <ChatWithSellerButton
                  buyerId={userId}
                  sellerId={item?.updatedBy}
                  product={{
                    id: item.itemId,
                    title: item.title,
                    price: item.price,
                    imageUrl: item.itemImage?.[0]?.imageUrl,
                  }}
                />

              </div>
            </Card>
          )}

          {/* Reviews */}
          <Card className="p-6 rounded-2xl shadow-md border border-[#EAE6DA] bg-white/90">
            <h2 className="text-2xl font-bold text-[#B8860B] mb-4">
              Đánh giá ({reviews.length})
            </h2>

            <div className="flex flex-col gap-6 max-h-96 overflow-y-auto">
              {reviews.length > 0 ? (
                reviews.map((r, i) => (
                  <div
                    key={r.reviewId || i}
                    className="flex gap-4 border-b pb-4"
                  >
                    {/* Reviewer Image */}
                    <img
                      src={r.picture}
                      alt={r.name}
                      className="w-12 h-12 rounded-full object-cover border shadow-sm"
                    />

                    <div className="flex flex-col flex-1">
                      {/* Name + Rating */}
                      <p className="font-bold text-gray-800">{r.name}</p>
                      <StarRating rating={r.rating} />

                      {/* Comment */}
                      <p className="text-gray-700 mt-1 whitespace-pre-wrap">
                        {r.comment}
                      </p>

                      {/* Review Images */}
                      {r.reviewImages && r.reviewImages.length > 0 && (
                        <div className="flex mt-3 gap-3 flex-wrap">
                          {r.reviewImages.map((img, idx) => (
                            <img
                              key={idx}
                              src={img.imageUrl}
                              onClick={() => window.open(img.imageUrl, "_blank")}
                              className="w-20 h-20 rounded-lg object-cover border cursor-pointer hover:opacity-80 transition"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center">
                  Chưa có đánh giá cho sản phẩm này.
                </p>
              )}
            </div>          </Card>
        </div>
      </div>
    </div>
  );
}

export default EVDetails;
