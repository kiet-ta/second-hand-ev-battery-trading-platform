import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { InputNumber, Spin, Alert, message, Card } from 'antd';
import { FiShoppingCart, FiCreditCard, FiMessageSquare, FiPhone, FiBatteryCharging } from 'react-icons/fi';
import { FaStar, FaChevronLeft, FaChevronRight } from 'react-icons/fa'; // Carousel icons
import { GiBatteryPack } from "react-icons/gi";

// API Hooks
import itemApi from "../api/itemApi";
import userApi from '../api/userApi';
import orderItemApi from '../api/orderItemApi';
import reviewApi from '../api/reviewApi'; // Import review API

// Reusable component for star ratings
const StarRating = ({ rating }) => (
  <div className="flex items-center">
    {Array.from({ length: 5 }).map((_, i) => (
      <FaStar key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'} />
    ))}
  </div>
);

function BatteryDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const itemId = location.state;

  const [item, setItem] = useState(null);
  const [sellerProfile, setSellerProfile] = useState(null);
  const [reviews, setReviews] = useState([]); // Array for fetched/enriched reviews
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0); // For carousel

  // --- Carousel Handlers ---
  const handlePrev = useCallback(() => {
    if (!item || !item.itemImage) return;
    const count = item.itemImage.length;
    setSelectedImage(prev => (prev - 1 + count) % count);
  }, [item]);

  const handleNext = useCallback(() => {
    if (!item || !item.itemImage) return;
    const count = item.itemImage.length;
    setSelectedImage(prev => (prev + 1) % count);
  }, [item]);
  // -------------------------


  useEffect(() => {
    if (!itemId) {
      setError("No item ID provided.");
      setLoading(false);
      return;
    }

    const fetchItemData = async () => {
      try {
        setLoading(true);

        // 1. Fetch Item Data (Battery Details)
        const itemData = await itemApi.getItemDetailByID(itemId);
        setItem(itemData);
        setQuantity(itemData.quantity > 0 ? 1 : 0); // Reset quantity on load

        // 2. Fetch Seller Profile (using itemData.updatedBy)
        const userData = await userApi.getUserByID(itemData.updatedBy);
        setSellerProfile(userData);

        // 3. Fetch Reviews and Enrich with User Data
        const reviewResponse = await reviewApi.getReviewByItemID(itemId);
        const rawReviews = reviewResponse.exists || [];

        const enrichedReviews = await Promise.all(
          rawReviews.map(async (review) => {
            try {
              const reviewerData = await userApi.getUserByID(review.reviewerId);
              return {
                ...review,
                name: reviewerData.fullName,
                // Assuming the user profile contains a field like avatarProfile
                picture: reviewerData.avatarProfile || 'https://via.placeholder.com/48',
              };
            } catch (e) {
              console.warn(`Could not load profile for reviewer ${review.reviewerId}:`, e);
              return { ...review, name: "Anonymous User", picture: 'https://via.placeholder.com/48' };
            }
          })
        );
        setReviews(enrichedReviews);

      } catch (err) {
        console.error("Error fetching item details:", err);
        setError("Failed to load product details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchItemData();
  }, [itemId]);

  // --- Handlers ---
  const handleBuyNowClick = async () => {
    if (quantity < 1) {
      message.error("Please select a quantity greater than zero.");
      return;
    }
    const cartPayload = {
      "buyerId": localStorage.getItem("userId"),
      "itemId": itemId,
      "quantity": quantity,
      "price": item.price // Use the actual item price
    };
    try {
      await orderItemApi.postOrderItem(cartPayload);
      message.success(`1x ${item.title} added to cart for Buy Now!`);
    } catch (error) {
      console.error("Error adding item to cart", error);
      message.error("Failed to process Buy Now.");
    }
    // Redirect to cart page
    navigate('/cart', { state: { selectedItemId: itemId } });
  };


  const handleAddToCart = async () => {
    if (!item || quantity < 1) {
      message.error("Please select a valid quantity.");
      return;
    }
    const cartPayload = {
      "buyerId": localStorage.getItem("userId"),
      "itemId": itemId,
      "quantity": quantity,
      "price": item.price
    };

    try {
      await orderItemApi.postOrderItem(cartPayload);
      message.success(`${quantity} x ${item.title} added to cart!`);
    } catch (error) {
      console.error("Error adding item to cart", error);
      message.error("Could not add item to cart. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <Alert message="Error" description={error} type="error" showIcon />
      </div>
    );
  }

  if (!item) {
    return null;
  }

  // --- Render Variables ---
  const batteryDetail = item.batteryDetail;
  const itemImages = item.itemImage || [];
  const imageUrls = itemImages.map(img => img.imageUrl);
  const placeholderImage = 'https://placehold.co/1200x800/374151/d1d5db?text=Battery+Image';
  const displayImage = imageUrls[selectedImage] || placeholderImage;

  const formatPrice = (price) => {
    if (price === undefined || price === null) return 'N/A';
    // Using toLocaleString with currency formatting for Vietnamese Dong
    return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  };

  // Key Specifications for Battery
  const keySpecs = [
    { label: 'Brand', value: batteryDetail?.brand },
    { label: 'Capacity', value: batteryDetail?.capacity ? `${batteryDetail.capacity} kWh` : undefined },
    { label: 'Voltage', value: batteryDetail?.voltage ? `${batteryDetail.voltage} V` : undefined },
    { label: 'Charge Cycles', value: batteryDetail?.chargeCycles?.toLocaleString() },
    { label: 'Item ID', value: item.itemId },
    { label: 'Quantity Available', value: item.quantity?.toLocaleString() },
  ];

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">

        {/* Left Column: Images and Description */}
        <div className="lg:col-span-3 flex flex-col gap-8">
          <Card className="shadow-lg p-0">
            <div className="relative">
              <img
                src={displayImage}
                alt={`${item.title} image`}
                onError={(e) => { e.currentTarget.src = placeholderImage; }}
                className="w-full object-cover rounded-t-lg aspect-[3/2]"
              />

              {/* Carousel Navigation */}
              {imageUrls.length > 1 && (
                <>
                  <button onClick={handlePrev} className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 p-3 rounded-full text-white transition-all z-10" aria-label="Previous image"><FaChevronLeft /></button>
                  <button onClick={handleNext} className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 p-3 rounded-full text-white transition-all z-10" aria-label="Next image"><FaChevronRight /></button>
                </>
              )}
            </div>
            {/* Thumbnails */}
            <div className="flex gap-3 p-4 overflow-x-auto justify-start bg-gray-50 rounded-b-lg border-t">
              {imageUrls.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Thumbnail ${index + 1}`}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 object-cover rounded-md cursor-pointer transition-shadow duration-200 ${selectedImage === index ? 'ring-4 ring-indigo-500 shadow-lg' : 'ring-2 ring-gray-200'}`}
                />
              ))}
            </div>
          </Card>

          {/* Key Specifications (Battery specific) */}
          <Card className="shadow-md p-6">
            <h2 className="text-2xl font-bold border-b pb-4 mb-4">Key Specifications</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              {keySpecs.filter(spec => spec.value).map(spec => (
                <div key={spec.label}>
                  <p className="text-sm text-gray-500">{spec.label}</p>
                  <p className="font-semibold">{spec.value}</p>
                </div>
              ))}
            </div>
          </Card>
          <Card className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold border-b pb-4 mb-4">Description</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {item.description}
            </p>
          </Card>
        </div>

        {/* Right Column: Product Info, Seller, Comments */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <Card className="bg-white rounded-lg shadow-md p-6 flex flex-col gap-4">
            <h1 className="text-3xl font-bold text-gray-900 leading-tight">
              {item.title}
            </h1>
            <div className="text-md text-gray-500 flex items-center gap-2">
              {/* Battery Detail line */}
              <GiBatteryPack className='text-xl text-indigo-500' />
              {batteryDetail && (
                <span>
                  <strong>{batteryDetail.brand}</strong> | Capacity: {batteryDetail.capacity}kWh | Voltage: {batteryDetail.voltage}V
                </span>
              )}
            </div>
            <div className="bg-gray-100 p-4 rounded-lg">
              <span className="text-4xl font-extrabold text-indigo-600">{formatPrice(item.price)}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-semibold text-gray-700">Quantity:</span>
              <InputNumber min={1} max={item.quantity} value={quantity} onChange={setQuantity} />
              <span className="text-sm text-gray-500">{item.quantity} available</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors"
              >
                <FiShoppingCart />
                Add to Cart
              </button>
              <button
                className="flex-1 bg-green-500 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 hover:bg-green-600 transition-colors"
                onClick={handleBuyNowClick}
              >
                <FiCreditCard />
                Buy Now
              </button>
            </div>
          </Card>

          {sellerProfile && (
            <Card className="bg-white rounded-lg shadow-md p-6 flex items-center gap-4">
              <img
                className="w-16 h-16 rounded-full object-cover"
                src={sellerProfile.avatarProfile || 'https://via.placeholder.com/64'}
                alt={sellerProfile.fullName}
              />
              <div className="flex-1">
                <p className="font-bold text-lg">{sellerProfile.fullName}</p>
                <p className="text-sm text-green-600">Active recently</p>
              </div>
              <button className="border border-indigo-600 text-indigo-600 font-semibold py-2 px-4 rounded-lg hover:bg-indigo-50 transition-colors">
                View Profile
              </button>
            </Card>
          )}

          {/* Reviews Section */}
          <Card className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold border-b pb-4 mb-4">Reviews ({reviews.length})</h2>
            <div className="flex flex-col gap-6 max-h-96 overflow-y-auto pr-2">
              {reviews.length > 0 ? (
                reviews.map((review, index) => (
                  <div key={review.reviewId || index} className="flex gap-4 border-b border-gray-100 pb-4 last:border-b-0">
                    <img
                      src={review.picture}
                      alt={review.name}
                      className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <p className="font-bold">{review.name}</p>
                        <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="my-1">
                        <StarRating rating={review.rating} />
                      </div>
                      <p className="text-gray-800">{review.comment}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No reviews for this product yet.</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default BatteryDetails;