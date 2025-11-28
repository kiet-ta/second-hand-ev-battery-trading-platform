import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { InputNumber, Spin, Card } from "antd";
import {
  FiShoppingCart,
  FiCreditCard,
  FiPhone,
  FiUser,
  FiMessageCircle,
  FiMessageSquare,
  FiHeart,
} from "react-icons/fi";
import { FaStar, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { GiBatteryPack } from "react-icons/gi";
import itemApi from "../../api/itemApi";
import userApi from "../../api/userApi";
import orderItemApi from "../../api/orderItemApi";
import reviewApi from "../../api/reviewApi";
import addressLocalApi from "../../api/addressLocalApi";
import placeholder from "../../assets/images/placeholder.png"
import { useParams } from "react-router-dom";
import ChatWithSellerButton from "../../components/Buttons/ChatWithSellerButton";


// Star rating component
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

function BatteryDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  const userId = parseInt(localStorage.getItem("userId"), 10);

  const [item, setItem] = useState(null);
  const [sellerProfile, setSellerProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [cartQuantity, setCartQuantity] = useState(0);
  const [availableStock, setAvailableStock] = useState(0);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPhoneVisible, setIsPhoneVisible] = useState(false);

  // Carousel handlers
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

  // Fetch data
  useEffect(() => {
    if (!id) {
      setFeedback({ type: "error", msg: "Không tìm thấy sản phẩm." });
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        // Get item detail
        const itemData = await itemApi.getItemDetailByID(id);
        setItem(itemData);

        const userId = parseInt(localStorage.getItem("userId"), 10);

        // Get current quantity in cart
        let inCart = 0;
        if (!isNaN(userId)) {
          try {
            const cartItems = await orderItemApi.getOrderItem(userId);
            const exist = cartItems.find(ci => ci.itemId === parseInt(id));
            inCart = exist ? exist.quantity : 0;
          } catch (err) {
            // 404 => cart empty
          }
        }
        setCartQuantity(inCart);

        // Available stock = item quantity - cart
        const remain = itemData.quantity - inCart;
        setAvailableStock(remain > 0 ? remain : 0);

        // Default quantity
        setQuantity(remain > 0 ? 1 : 0);

        // Seller profile
        const userData = await userApi.getUserByID(itemData.updatedBy);
        setSellerProfile(userData);

        // Reviews
        const reviewResponse = await reviewApi.getReviewByItemID(id);
        const rawReviews = reviewResponse || [];

        const enriched = await Promise.all(
          rawReviews.map(async (r) => {
            try {
              const u = await userApi.getUserByID(r.reviewerId);
              return {
                ...r,
                name: u.fullName,
                picture: u.avatarProfile || "https://via.placeholder.com/48",
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

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleShowPhone = () => {
    if (isNaN(userId)) {
      setFeedback({ type: "error", msg: "Vui lòng đăng nhập để xem số điện thoại." });
      navigate("/login");
      return;
    }
    setIsPhoneVisible((prev) => !prev);
  };

  // Helper
  const formatPrice = (price) =>
    price?.toLocaleString("vi-VN", { style: "currency", currency: "VND" }) ||
    "N/A";

  // Add to cart (always POST, no PUT)
  const handleAddToCart = useCallback(async () => {
    const buyerId = parseInt(localStorage.getItem("userId"), 10);
    if (isNaN(buyerId)) {
      navigate("/login");
      return;
    }

    if (!item || quantity < 1) {
      setFeedback({ type: "error", msg: "Vui lòng chọn số lượng hợp lệ." });
      return;
    }

    if (quantity > availableStock) {
      setFeedback({
        type: "error",
        msg: `Chỉ còn ${availableStock} sản phẩm trong kho.`,
      });
      return;
    }

    setIsProcessing(true);

    try {
      await orderItemApi.postOrderItem({
        buyerId,
        itemId: id,
        quantity,
        price: item.price,
      });

      setFeedback({
        type: "success",
        msg: `${quantity} x ${item.title} đã được thêm vào giỏ hàng.`,
      });

      // Update cart quantity + available stock
      setCartQuantity(prev => prev + quantity);
      setAvailableStock(prev => prev - quantity);
    } catch (error) {
      console.error("Add to cart error:", error);
      setFeedback({
        type: "error",
        msg: "Không thể thêm vào giỏ hàng.",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [item, quantity, availableStock]);


  const handleFavorite = async () => {
    const buyerId = localStorage.getItem("userId");
    if (!buyerId) return navigate("/login");

    try {
      await favouriteApi.postFavourite({
        userId: buyerId,
        itemId: id,
      });
      setFeedback({ type: "success", msg: "Đã quan tâm sản phẩm!" });
    } catch (err) {
      setFeedback({ type: "error", msg: "Không thể quan tâm sản phẩm." });
    }
  };

  //  NHẮN TIN VỚI NGƯỜI BÁN (đi thẳng đến trang chat)
  const handleChat = () => {
    const buyerId = localStorage.getItem("userId");
    if (!buyerId) return navigate("/login");

    navigate(`/chat?sellerId=${item.updatedBy}&itemId=${item.itemId}`);
  };

  // Buy now
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
            id: id,
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

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-[#FAF8F3]">
        <Spin size="large" />
      </div>
    );

  if (!item)
    return (
      <div className="text-center text-gray-700 py-10">
        Không tìm thấy sản phẩm.
      </div>
    );

  const battery = item.batteryDetail;
  const imageUrls = item.itemImage?.map((img) => img.imageUrl) || [];
  const displayImage =
    imageUrls[selectedImage] ||
    "https://placehold.co/1200x800/ddd/999?text=Battery+Image";

  return (
    <div className="bg-[#FAF8F3] min-h-screen p-6 lg:p-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Column */}
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

          <Card className="p-6 shadow-md border border-[#EAE6DA] rounded-2xl bg-white/90">
            <h2 className="text-2xl font-bold text-[#B8860B] mb-4 border-b border-[#EAE6DA] pb-2">
              Thông số kỹ thuật
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Spec label="Thương hiệu" value={battery?.brand} />
              <Spec label="Dung lượng" value={`${battery?.capacity} kWh`} />
              <Spec label="Điện áp" value={`${battery?.voltage} V`} />
              <Spec
                label="Chu kỳ sạc"
                value={battery?.chargeCycles?.toLocaleString()}
              />
              <Spec label="Số lượng" value={item.quantity} />
            </div>
          </Card>

          <Card className="p-6 shadow-md border border-[#EAE6DA] rounded-2xl bg-white/90">
            <h2 className="text-2xl font-bold text-[#B8860B] mb-4 border-b border-[#EAE6DA] pb-2">
              Mô tả sản phẩm
            </h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {item.description}
            </p>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <Card className="p-6 rounded-2xl shadow-md border border-[#EAE6DA] bg-white/90">
            <h1 className="text-3xl font-bold text-[#3A3A3A]">
              {item.title}
            </h1>
            <div className="mt-2">{item.moderation === "Approved" && <VerifiedCheck />}</div>

            <div className="flex items-center gap-2 text-gray-600 mt-3">
              <GiBatteryPack className="text-xl text-[#B8860B]" />
              <span>
                <strong>{battery?.brand}</strong> | {battery?.capacity}kWh |{" "}
                {battery?.voltage}V
              </span>
            </div>

            <div className="bg-[#FFF7E5] p-4 mt-4 rounded-lg text-center shadow-inner">
              <span className="text-4xl font-bold text-[#B8860B]">
                {formatPrice(item.price)}
              </span>
            </div>

            <div className="flex flex-col gap-2 mt-4">
              <div className="flex items-center gap-4">
                <span className="font-semibold text-gray-700">Số lượng:</span>
                <InputNumber
                  min={1}
                  max={availableStock}
                  value={quantity}
                  onChange={setQuantity}
                  disabled={availableStock === 0}
                />
              </div>
              {cartQuantity > 0 && (
                <div className="text-sm text-blue-600 mt-1">
                  Đang có <strong>{cartQuantity}</strong> sản phẩm này trong giỏ.
                </div>
              )}
              <div className="text-sm text-gray-700">
                Tồn kho còn lại: <strong>{availableStock}</strong>
              </div>
              {availableStock === 0 && (
                <div className="font-bold text-red-500">Đã hết hàng</div>
              )}
            </div>

            {feedback && (
              <div
                className={`mt-4 px-4 py-3 rounded-lg text-sm font-semibold ${feedback.type === "success"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-700"
                  }`}
              >
                {feedback.msg}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={availableStock > 0 ? handleAddToCart : null}
                disabled={availableStock === 0}
                className={`flex-1 font-bold py-3 px-6 rounded-lg transition
                    ${availableStock === 0
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-[#B8860B] text-white hover:bg-[#A47500]"
                  }`}
              >
                <FiShoppingCart className="inline mr-2" />
                Thêm vào giỏ hàng
              </button>
              <button
                onClick={availableStock > 0 ? handleBuyNow : null}
                disabled={availableStock === 0}
                className={`flex-1 font-bold py-3 px-6 rounded-lg transition
    ${availableStock === 0
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700"
                  }`}
              >
                <FiCreditCard className="inline mr-2" />
                Mua ngay
              </button>



            </div>
          </Card>

          {sellerProfile && (
            <Card className="p-6 rounded-2xl shadow-md border border-[#EAE6DA] bg-white/90">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <img
                  src={sellerProfile.avatarProfile || placeholder}
                  alt={sellerProfile.fullName}
                  className="w-16 h-16 rounded-full object-cover"
                />

                {/* Info */}
                <div className="flex-1">
                  <p className="font-bold text-lg">{sellerProfile.fullName}</p>
                  <p className="text-sm text-green-600">Đang hoạt động</p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-between gap-3 mt-3">

                {/* VIEW PROFILE */}
                <Link
                  to={`/seller/${item.updatedBy}`}
                  className="flex-1 flex items-center justify-center gap-2
      bg-white border-[2px] border-[#B8860B] text-[#B8860B]
      font-semibold px-4 py-3 rounded-full shadow-sm
      hover:bg-[#FFF2D1] hover:shadow-md hover:scale-[1.02]
      transition-all duration-200"
                >
                  <FiUser className="text-lg" /> Hồ sơ
                </Link>

                {/* CHAT */}
                <button
                  disabled={loading}
                  onClick={(e) => { handleChat("normal"); e.stopPropagation(); }}
                  className="flex-1 flex items-center justify-center gap-2
      bg-gradient-to-r from-[#6D28D9] to-[#4F46E5] 
      text-white font-semibold px-4 py-3 rounded-full
      shadow-md hover:shadow-xl hover:scale-[1.03]
      active:scale-[0.97] transition-all duration-200"
                >
                  <FiMessageSquare className="text-lg" />
                  {loading ? "Đang mở..." : "Nhắn tin"}
                </button>

                {/* FAVORITE */}
                <button
                  disabled={loading}
                  onClick={(e) => { setShowConfirm(true); e.stopPropagation(); }}
                  className="flex-1 flex items-center justify-center gap-2
      bg-gradient-to-r from-[#F59E0B] to-[#D97706]
      text-white font-semibold px-4 py-3 rounded-full
      shadow-md hover:shadow-xl hover:scale-[1.03]
      active:scale-[0.97] transition-all duration-200"
                >
                  <FiHeart className="text-lg" />
                  {loading ? "Đang xử lý..." : "Quan tâm"}
                </button>

              </div>
            </Card>
          )}



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

                      <p className="text-gray-700 mt-1 whitespace-pre-wrap">
                        {r.comment}
                      </p>

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
            </div>          
            </Card>
        </div>
      </div>
    </div>
  );
}

// Helper for specs
const Spec = ({ label, value }) =>
  value ? (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-semibold text-gray-800">{value}</p>
    </div>
  ) : null;

export default BatteryDetails;
