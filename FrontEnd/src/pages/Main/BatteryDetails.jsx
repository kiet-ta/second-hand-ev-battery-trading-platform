import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { InputNumber, Spin, Alert, Card } from "antd";
import {
  FiShoppingCart,
  FiCreditCard,
  FiBatteryCharging,
} from "react-icons/fi";
import { FaStar, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { GiBatteryPack } from "react-icons/gi";
import itemApi from "../../api/itemApi";
import userApi from "../../api/userApi";
import orderItemApi from "../../api/orderItemApi";
import reviewApi from "../../api/reviewApi";
import addressLocalApi from "../../api/addressLocalApi";
import placeholder from "../../assets/images/placeholder.png"
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
  const itemId = location.state;

  const [item, setItem] = useState(null);
  const [sellerProfile, setSellerProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);


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
    if (!itemId) {
      setFeedback({ type: "error", msg: "Không tìm thấy sản phẩm." });
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const itemData = await itemApi.getItemDetailByID(itemId);
        setItem(itemData);
        setQuantity(itemData.quantity > 0 ? 1 : 0);

        const userData = await userApi.getUserByID(itemData.updatedBy);
        setSellerProfile(userData);

        const reviewResponse = await reviewApi.getReviewByItemID(itemId);
        const rawReviews = reviewResponse.exists || [];

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
  }, [itemId]);

  // Helper
  const formatPrice = (price) =>
    price?.toLocaleString("vi-VN", { style: "currency", currency: "VND" }) ||
    "N/A";

  const handleAddToCart = useCallback(async () => {
    const buyerId = parseInt(localStorage.getItem("userId"), 10);
    if (isNaN(buyerId)) {
      setFeedback({ type: "error", msg: "Vui lòng đăng nhập để tiếp tục." });
      navigate("/login");
      return;
    }

    if (!item || quantity < 1) {
      setFeedback({ type: "error", msg: "Vui lòng chọn số lượng hợp lệ." });
      return;
    }

    setIsProcessing(true);

    try {
      // 🔹 Try to get current order items (handle 404 as empty)
      let existingOrderItems = [];
      try {
        const res = await orderItemApi.getOrderItem(buyerId);
        existingOrderItems = Array.isArray(res) ? res : [];
      } catch (err) {
        if (err.response && err.response.status === 404) {
          existingOrderItems = [];
        } else throw err;
      }

      // 🔹 Check if this item already exists in cart
      const existingItem = existingOrderItems.find(
        (oi) => oi.itemId === itemId
      );

      if (existingItem) {
        // 🔹 Fetch latest item data to check stock
        const itemData = await itemApi.getItemById(itemId);
        const availableStock = itemData?.quantity ?? 0;
        const newQuantity = existingItem.quantity + quantity;

        if (newQuantity > availableStock) {
          setFeedback({
            type: "error",
            msg: `Số lượng trong kho không đủ. Chỉ còn ${availableStock} sản phẩm.`,
          });
          return;
        }

        // ✅ Update (PUT)
        const payload = {
          quantity: newQuantity,
          price: item.price,
        };

        await orderItemApi.putOrderItem(existingItem.orderItemId, payload);
        setFeedback({
          type: "success",
          msg: `Đã cập nhật số lượng sản phẩm trong giỏ hàng (${newQuantity}).`,
        });
      } else {
        // 🆕 Create (POST)
        const payload = {
          buyerId,
          itemId,
          quantity,
          price: item.price,
        };

        await orderItemApi.postOrderItem(payload);
        setFeedback({
          type: "success",
          msg: `${quantity} x ${item.title} đã được thêm vào giỏ hàng.`,
        });
      }
    } catch (error) {
      console.error("❌ Add to cart error:", error);
      setFeedback({
        type: "error",
        msg: "Không thể thêm vào giỏ hàng. Vui lòng thử lại.",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [item, itemId, quantity, navigate]);
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
        itemId: itemId,
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
            id: itemId,
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

            <div className="flex items-center gap-4 mt-4">
              <span className="font-semibold text-gray-700">Số lượng:</span>
              <InputNumber
                min={1}
                max={item.quantity}
                value={quantity}
                onChange={setQuantity}
                disabled={item.quantity === 0}
              />
              {item.quantity === 0 ? <>
                <div className="font-bold text-red-500">Đã hết hàng</div>
              </>
                :
                <></>}

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
                onClick={item.quantity > 0 ? handleAddToCart : null}
                disabled={item.quantity === 0}
                className={`flex-1 font-bold py-3 px-6 rounded-lg transition
                    ${item.quantity === 0
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-[#B8860B] text-white hover:bg-[#A47500]"
                  }`}
              >
                <FiShoppingCart className="inline mr-2" />
                Thêm vào giỏ hàng
              </button>
              <button
                onClick={item.quantity > 0 ? handleBuyNow : null}
                disabled={item.quantity === 0}
                className={`flex-1 font-bold py-3 px-6 rounded-lg transition
    ${item.quantity === 0
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
            <Card className="p-6 rounded-2xl shadow-md border border-[#EAE6DA] bg-white/90 flex items-center gap-4">
              <img
                src={sellerProfile.avatarProfile || placeholder}
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
            <h2 className="text-2xl font-bold text-[#B8860B] mb-4">
              Đánh giá ({reviews.length})
            </h2>
            <div className="flex flex-col gap-6 max-h-96 overflow-y-auto">
              {reviews.length > 0 ? (
                reviews.map((r, i) => (
                  <div key={r.reviewId || i} className="flex gap-4 border-b pb-4">
                    <img
                      src={r.picture}
                      alt={r.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-bold">{r.name}</p>
                      <StarRating rating={r.rating} />
                      <p className="text-gray-700 mt-1">{r.comment}</p>
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
