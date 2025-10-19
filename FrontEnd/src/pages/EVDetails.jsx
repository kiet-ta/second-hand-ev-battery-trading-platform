import React, { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Spin, Alert, message, Card } from 'antd'; // Added Card for structure
import { FiMessageSquare, FiPhone, FiMapPin, FiCalendar, FiTrendingUp, FiCheckCircle } from 'react-icons/fi';
import { FaStar, FaChevronLeft, FaChevronRight } from 'react-icons/fa'; // Carousel icons
import { GiGemChain } from "react-icons/gi";

// API Hooks (Assuming these paths are correct in your project structure)
import itemApi from '../api/itemApi';
import userApi from '../api/userApi';
import reviewApi from '../api/reviewApi';

// --- Reusable Components ---

const StarRating = ({ rating }) => (
    <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => (
            <FaStar key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'} />
        ))}
    </div>
);

// --- Component Definition ---

function EVDetails() {
    const location = useLocation();
    // Assuming the itemId is passed in location.state as a number/string
    const itemId = location.state; 

    // State Management
    const [item, setItem] = useState(null);
    const [sellerProfile, setSellerProfile] = useState(null);
    const [reviews, setReviews] = useState([]); // Store array of review objects
    const [isPhoneVisible, setIsPhoneVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedImage, setSelectedImage] = useState(0); // For carousel

    // --- Data Fetching Effect ---
    useEffect(() => {
        if (!itemId) {
            setError("No item ID provided.");
            setLoading(false);
            return;
        }

        const fetchItemData = async () => {
            try {
                setLoading(true);

                // 1. Fetch Item Data (including evDetail/batteryDetail and updatedBy)
                const itemData = await itemApi.getItemDetailByID(itemId);
                setItem(itemData);

                // 2. Fetch Seller Profile (using itemData.updatedBy)
                const sellerId = itemData.updatedBy;
                const userData = await userApi.getUserByID(sellerId);
                setSellerProfile(userData);

                // 3. Fetch Reviews
                const reviewResponse = await reviewApi.getReviewByItemID(itemId);
                
                // 4. Enrich Reviews with User Data
                const rawReviews = reviewResponse.exists || [];
                const enrichedReviews = await Promise.all(
                    rawReviews.map(async (review) => {
                        try {
                            // Assume review.userId contains the ID of the commenter
                            const reviewerData = await userApi.getUserByID(review.reviewerId);
                            return {
                                ...review,
                                // Merge user profile data into the review object
                                name: reviewerData.fullName,
                                picture: reviewerData.avatarProfile, 
                            };
                        } catch (e) {
                            console.warn(`Could not load profile for reviewer ${review.userId}:`, e);
                            return { ...review, name: "Anonymous User", picture: 'N/A' };
                        }
                    })
                );
                setReviews(enrichedReviews);

            } catch (err) {
                console.error("Error fetching EV details:", err);
                setError("Failed to load vehicle details. Please check the network and try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchItemData();
    }, [itemId]);

    // Loading & Error States (Unmodified)
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
    // Use evDetail or batteryDetail based on itemType
    const itemDetailSpec = item.evDetail || item.batteryDetail;
    const evDetail = item.evDetail; // Kept for components expecting evDetail
    const itemImages = item.itemImage || []; // Use the actual itemImage array
    
    const imageUrls = itemImages.map(img => img.imageUrl);
    const placeholderImage = 'https://placehold.co/1200x800/374151/d1d5db?text=Image+Unavailable';
    const displayImage = imageUrls[selectedImage] || placeholderImage;

    // Carousel Handlers
    const handlePrev = () => {
        setSelectedImage(prev => (prev - 1 + imageUrls.length) % imageUrls.length);
    };

    const handleNext = () => {
        setSelectedImage(prev => (prev + 1) % imageUrls.length);
    };

    // Key Specifications for easy mapping
    const keySpecs = [
        { label: 'Brand', value: itemDetailSpec?.brand },
        { label: 'Model', value: itemDetailSpec?.model },
        { label: 'Body Style', value: itemDetailSpec?.bodyStyle },
        { label: 'Color', value: itemDetailSpec?.color },
        { label: 'License Plate', value: itemDetailSpec?.licensePlate },
        { label: 'Mileage', value: evDetail?.mileage ? `${evDetail.mileage.toLocaleString()} km` : undefined },
        { label: 'Capacity', value: itemDetailSpec?.capacity ? `${itemDetailSpec.capacity} kWh` : undefined },
    ];
    
    // Currency formatting
    const formatPrice = (price) => {
        if (price === undefined || price === null) return 'N/A';
        return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }); 
    };


    return (
        <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">
                
                {/* Left Column (lg:col-span-3): Image Carousel, Specs, Description */}
                <div className="lg:col-span-3 flex flex-col gap-8">
                    
                    {/* Image Carousel */}
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
                                    <button
                                        onClick={handlePrev}
                                        className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 p-3 rounded-full text-white transition-all z-10"
                                        aria-label="Previous image"
                                    >
                                        <FaChevronLeft />
                                    </button>
                                    <button
                                        onClick={handleNext}
                                        className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 p-3 rounded-full text-white transition-all z-10"
                                        aria-label="Next image"
                                    >
                                        <FaChevronRight />
                                    </button>
                                </>
                            )}
                        </div>
                        {/* Thumbnails */}
                        <div className="flex gap-3 p-4 overflow-x-auto justify-start bg-gray-50 rounded-b-lg border-t">
                            {imageUrls.map((url, index) => (
                                <img 
                                    key={index} 
                                    src={url} 
                                    alt={`Thumbnail ${index+1}`}
                                    onClick={() => setSelectedImage(index)}
                                    className={`w-20 h-20 object-cover rounded-md cursor-pointer transition-shadow duration-200 ${selectedImage === index ? 'ring-4 ring-indigo-500 shadow-lg' : 'ring-2 ring-gray-200'}`}
                                />
                            ))}
                        </div>
                    </Card>

                    {/* Key Specifications */}
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

                    {/* Description */}
                    <Card className="shadow-md p-6">
                        <h2 className="text-2xl font-bold border-b pb-4 mb-4">Description</h2>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {item.description}
                        </p>
                    </Card>
                </div>

                {/* Right Column (lg:col-span-2): Main Info, Seller, Reviews */}
                <div className="lg:col-span-2 flex flex-col gap-8">
                    <Card className="bg-white rounded-lg shadow-md p-6 flex flex-col gap-4">
                        <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                            {item.title}
                        </h1>
                        
                        {itemDetailSpec && (
                            <div className="flex flex-wrap gap-x-4 gap-y-2 text-gray-600 items-center">
                                <div className="flex items-center gap-2"><FiCalendar /><span>{itemDetailSpec.year}</span></div>
                                {evDetail && <div className="flex items-center gap-2"><FiTrendingUp /><span>{evDetail.mileage.toLocaleString()} km</span></div>}
                                {evDetail && evDetail.location && <div className="flex items-center gap-2"><FiMapPin /><span>{evDetail.location}</span></div>}
                            </div>
                        )}
                        {evDetail?.hasAccessories && (
                            <div className="bg-teal-100 text-teal-800 text-sm font-semibold mr-2 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 self-start">
                                <GiGemChain /> Includes Accessories
                            </div>
                        )}

                        <div className="bg-gray-100 p-4 rounded-lg my-2">
                            <span className="text-4xl font-extrabold text-indigo-600">{formatPrice(item.price)}</span>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-3 mt-2">
                            <button className="flex-1 bg-blue-500 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors">
                                <FiMessageSquare /> Chat with Seller
                            </button>
                            <button
                                onClick={() => setIsPhoneVisible(!isPhoneVisible)}
                                className="flex-1 bg-green-500 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 hover:bg-green-600 transition-colors"
                            >
                                <FiPhone />
                                {isPhoneVisible ? (sellerProfile?.phone || 'N/A') : 'Show Phone'}
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
                                <p className="text-sm text-gray-500">Active recently</p>
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
                                    <div key={index} className="flex gap-4 border-b border-gray-100 pb-4 last:border-b-0">
                                        <img 
                                            src={review.picture || 'https://via.placeholder.com/48'} 
                                            alt={review.name} 
                                            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                                        />
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center">
                                                <p className="font-bold">{review.name}</p>
                                                <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <div className="my-1"><StarRating rating={review.rating} /></div>
                                            <p className="text-gray-800">{review.comment}</p>
                                            {review.imagefollow && review.imagefollow.length > 0 && (
                                                <div className="flex gap-2 mt-2">
                                                    {review.imagefollow.map((img, idx) => (
                                                        <img key={idx} src={img.imageUrl || img} className="w-20 h-20 object-cover rounded-md cursor-pointer hover:opacity-80 transition" alt="review"/>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-center py-4">No reviews for this vehicle yet.</p>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default EVDetails;