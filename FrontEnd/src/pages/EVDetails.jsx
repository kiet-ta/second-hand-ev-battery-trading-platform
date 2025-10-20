import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Spin, Alert, message, Card } from 'antd'; // Using Ant Design for feedback
import { FiMessageSquare, FiPhone, FiMapPin, FiCalendar, FiTrendingUp } from 'react-icons/fi';
import { FaStar, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { GiGemChain } from "react-icons/gi";

// API Hooks (Adjust paths as necessary for your project structure)
import itemApi from '../api/itemApi';
import userApi from '../api/userApi';
import chatApi from '../api/chatApi';
import reviewApi from '../api/reviewApi'; 

// ====================================================================
// 1. Reusable Components
// ====================================================================

// Star Rating Component
const StarRating = ({ rating }) => (
 <div className="flex items-center">
  {Array.from({ length: 5 }).map((_, i) => (
   <FaStar key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'} />
  ))}
 </div>
);

// Verified Check Component
const VerifiedCheck = ({ className = "" }) => (
  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 ${className}`}>
    <svg className="-ml-0.5 mr-1.5 h-3 w-3 text-green-500 fill-current" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
    Đã Duyệt
  </div>
);


// ====================================================================
// 2. Main EVDetails Component
// ====================================================================

function EVDetails() {
 const location = useLocation();
 // Retrieve itemId from location.state
 const itemId = location.state; 
 const navigate = useNavigate();
 
 // --- State Management ---
 const [item, setItem] = useState(null);
 const [sellerProfile, setSellerProfile] = useState(null);
  const [reviews, setReviews] = useState([]); // Dynamic reviews
 const [isPhoneVisible, setIsPhoneVisible] = useState(false);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);
 const [isVerified, setIsVerified] = useState(false);
 const [selectedImage, setSelectedImage] = useState(0); // Carousel state

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
 
  // --- Data Fetching Effect ---
 useEffect(() => {
  if (!itemId) {
   setError("No item ID provided. Please navigate from a product card.");
   setLoading(false);
   return;
  }

  const fetchItemData = async () => {
   try {
    setLoading(true);
        
        // 1. Fetch Item Data & Check Verification
    const itemData = await itemApi.getItemDetailByID(itemId);
    setItem(itemData);
    setIsVerified(itemData.moderation === 'approved_tag');
        
        // 2. Fetch Seller Profile
    const sellerId = itemData.updatedBy;
    if (sellerId) {
     const userData = await userApi.getUserByID(sellerId);
     setSellerProfile(userData);
    }

        // 3. Fetch and Enrich Reviews
        try {
            const reviewResponse = await reviewApi.getReviewByItemID(itemId);
            const rawReviews = reviewResponse.exists || []; 

            const enrichedReviews = await Promise.all(
                rawReviews.map(async (review) => {
                    const reviewerData = await userApi.getUserByID(review.reviewerId);
                    return {
                        ...review,
                        name: reviewerData.fullName,
                        picture: reviewerData.avatarProfile || 'https://via.placeholder.com/48',
                    };
                })
            );
            setReviews(enrichedReviews);
        } catch (e) {
            setReviews([]);
        }
        
   } catch (err) {
    console.error("Error fetching EV details:", err);
    setError("Failed to load vehicle details. Please check your API.");
   } finally {
    setLoading(false);
   }
  };

  fetchItemData();
 }, [itemId]);

 // --- Action Handlers ---
const checkLoginAndExecute = (callback) => {
 const userId = parseInt(localStorage.getItem("userId"), 10);
 if (isNaN(userId)) {
  message.error("Please log in to perform this action.");
  navigate('/login');
  return false;
 }
 callback(userId);
 return true;
}

const handleChatWithSeller = async () => {
 checkLoginAndExecute(async (buyerId) => {
  const sellerId = item?.updatedBy;

  if (!sellerId || buyerId === sellerId) {
   message.error("Cannot chat with self.");
   return;
  }

  try {
   message.loading('Starting chat...', 0);
   const room = await chatApi.createChatRoom(buyerId, sellerId);
   message.destroy();
   message.success(`Chat room ${room.cid} is ready!`);
   navigate('/profile', { state: { activeSection: 'chat', chatRoomId: room.cid, receiverId: sellerId } });
  } catch (error) {
   message.destroy();
   message.error("Failed to start chat. Check network.");
  }
 });
};

// ********************************************************************
// MODIFICATION 2: Add handleShowPhone for the phone button
// ********************************************************************
const handleShowPhone = () => {
 checkLoginAndExecute(() => {
  // If logged in, toggle phone visibility
  setIsPhoneVisible(prev => !prev);
 });
}; 
 // --- Conditional Renders (Loading/Error) ---
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

 const { evDetail } = item;

  // --- Render Variables ---
  const itemImages = item.itemImage || [];
  const imageUrls = itemImages.map(img => img.imageUrl);
  const placeholderImage = 'https://placehold.co/1200x800/374151/d1d5db?text=EV+Image';
  const displayImage = imageUrls[selectedImage] || placeholderImage;
  const formattedPrice = item.price ? item.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : 'N/A';


 // Key Specifications for easy mapping
 const keySpecs = [
  { label: 'Brand', value: evDetail?.brand },
  { label: 'Model', value: evDetail?.model },
  { label: 'Body Style', value: evDetail?.bodyStyle },
  { label: 'Color', value: evDetail?.color },
  { label: 'License Plate', value: evDetail?.licensePlate }
 ];

 return (
  <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
   <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">

    {/* Left Column: Image, Specs, Description */}
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
     

     <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold border-b pb-4 mb-4">Key Specifications</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
       {keySpecs.map(spec => (
        spec.value && <div key={spec.label}>
         <p className="text-sm text-gray-500">{spec.label}</p>
         <p className="font-semibold">{spec.value}</p>
        </div>
       ))}
      </div>
     </div>

     <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold border-b pb-4 mb-4">Description</h2>
      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
       {item.description}
      </p>
     </div>
    </div>

    {/* Right Column: Main Info, Seller, Reviews */}
    <div className="lg:col-span-2 flex flex-col gap-8">
     <div className="bg-white rounded-lg shadow-md p-6 flex flex-col gap-4">
              {/* TITLE and VERIFIED CHECK */}
              <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                      {item.title}
                  </h1>
                  {isVerified && <VerifiedCheck />}
              </div>


      {evDetail && (
       <div className="flex flex-wrap gap-x-4 gap-y-2 text-gray-600 items-center">
        <div className="flex items-center gap-2"><FiCalendar /><span>{evDetail.year}</span></div>
        <div className="flex items-center gap-2"><FiTrendingUp /><span>{evDetail.mileage} km</span></div>
        <div className="flex items-center gap-2"><FiMapPin /><span>{evDetail.location || 'N/A'}</span></div>
       </div>
      )}
      {evDetail?.hasAccessories && (
       <div className="bg-teal-100 text-teal-800 text-sm font-semibold mr-2 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 self-start">
        <GiGemChain /> Includes Accessories
       </div>
      )}

      <div className="bg-gray-100 p-4 rounded-lg my-2">
       <span className="text-4xl font-extrabold text-indigo-600">{formattedPrice}</span>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-2">
       <button
        onClick={handleChatWithSeller}
        className="flex-1 bg-blue-500 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors">
        <FiMessageSquare /> Chat with Seller
       </button>       <button
        onClick={handleShowPhone}
        className="flex-1 bg-green-500 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 hover:bg-green-600 transition-colors"
       >
        <FiPhone/>
        {isPhoneVisible && (sellerProfile?.phone || 'Show Phone') }
       </button>
      </div>
     </div>

     {sellerProfile && (
      <div className="bg-white rounded-lg shadow-md p-6 flex items-center gap-4">
       <img
        className="w-16 h-16 rounded-full object-cover"
        src={sellerProfile.avatarProfile || 'https://via.placeholder.com/64'}
        alt={sellerProfile.fullName}
       />
       <div className="flex-1">
        <p className="font-bold text-lg">{sellerProfile.fullName}</p>
        <p className="text-sm text-gray-500">Active recently</p>
       </div>
       <button className="border border-indigo-600 text-indigo-600 font-semibold py-2 px-4 rounded-lg hover:bg-indigo-50 transition-colors">
        View Profile
       </button>
      </div>
     )}

     {/* Reviews Section (Dynamic data source) */}
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

export default EVDetails;