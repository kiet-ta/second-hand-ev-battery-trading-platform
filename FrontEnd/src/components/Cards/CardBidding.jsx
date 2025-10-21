import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// FIX: Keeping notificationApi mock to resolve module errors and maintain notification logic.

// Mock implementation of notificationApi
const notificationApi = {
    createNotification: async (payload) => {
        console.log("Mock Notification Sent:", payload);
        return Promise.resolve({ status: 'sent' });
    }
};

// --- SVG Components to replace react-icons/fa imports (Unchanged) ---
const ChevronLeft = (props) => (
    <svg className={props.className} fill="currentColor" viewBox="0 0 256 512" xmlns="http://www.w3.org/2000/svg"><path d="M192 480c-7.3 0-14.7-2.9-20-8.2L12.3 268.3c-10.4-10.4-10.4-27.3 0-37.7L172 8.2c10.4-10.4 27.3-10.4 37.7 0s10.4 27.3 0 37.7L50.1 250l159.6 159.6c10.4 10.4 10.4 27.3 0 37.7-5.2 5.3-12.5 8.3-20 8.3z"/></svg>
);
const ChevronRight = (props) => (
    <svg className={props.className} fill="currentColor" viewBox="0 0 256 512" xmlns="http://www.w3.org/2000/svg"><path d="M64 480c-7.3 0-14.7-2.9-20-8.2-10.4-10.4-10.4-27.3 0-37.7L205.9 250 44 90.3c-10.4-10.4-10.4-27.3 0-37.7s27.3-10.4 37.7 0L243.7 230.3c10.4 10.4 10.4 27.3 0 37.7L82 471.8c-5.3 5.3-12.6 8.2-20 8.2z"/></svg>
);
const RegClock = (props) => (
    <svg className={props.className} fill="currentColor" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm24 288h-48V120c0-13.3 10.7-24 24-24s24 10.7 24 24v160c0 4.4-3.6 8-8 8z"/></svg>
);
const ArrowRight = (props) => (
    <svg className={props.className} fill="currentColor" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg"><path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.7 224H32c-17.7 0-32 14.3-32 32s14.3 32 32 32h306.7L233.3 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"/></svg>
);
// --- END SVG Components ---

// --- Messaging Placeholder (Using console for feedback) ---
const message = {
    success: (text) => console.log(`[SUCCESS] ${text}`),
    error: (text) => console.error(`[ERROR] ${text}`),
};
// --- END Messaging Placeholder ---


// EXISTING HELPER FUNCTION (Unchanged)
const formatCountdown = (status, startTimeStr, endTimeStr) => {
    const now = new Date().getTime();

    const startTime = new Date(startTimeStr).getTime();
    const endTime = new Date(endTimeStr).getTime();

    let distance;
    let label = "Ends In";
    let isFinished = false;

    if (status === 'UPCOMING') {
        distance = startTime - now;
        label = "Starts In";
        if (distance < 0) {
            distance = 0;
        }
    } else if (status === 'ONGOING') {
        distance = endTime - now;
        label = "Ends In";
        if (distance < 0) {
            isFinished = true;
        }
    } else {
        distance = 0;
        isFinished = true;
    }

    if (isFinished || status === 'ENDED' || distance <= 0) {
        if (distance <= 0) {
             return { time: "ENDED", label: "Status", isFinished: true };
        }
        return { time: status === 'ENDED' ? "ENDED" : "OVERDUE", label: "Status", isFinished: true };
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    const pad = (num) => String(num).padStart(2, '0');

    if (days > 0) {
        return { time: `${days}d ${pad(hours)}h`, label, isFinished: false };
    }
    return { time: `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`, label, isFinished: false };
};


export const CarAuctionCard = ({
    id,
    title,
    brand,
    category,
    currentBid = 0,
    startingPrice = 0,
    endTime,
    startTime,
    status, // ONGOING, UPCOMING, ENDED
    imageUrls = [], // Assumed array of objects: [{imageUrl: 'url'}, ...]
}) => {
    const navigate = useNavigate();
    const LOGGED_IN_USER_ID = 1; // Mocked User ID for notification payload (kept for notification logic)

    const placeholderImage = `https://placehold.co/600x400/374151/d1d5db?text=${encodeURIComponent(title || 'No Image')}`;
    
    // REMOVED: latestBid, bidAmount, isBidding states.

    // State for image carousel
    const [currentSlide, setCurrentSlide] = useState(0);

    // Track the countdown state
    const [countdown, setCountdown] = useState(() => formatCountdown(status, startTime, endTime));
    const [notificationSent, setNotificationSent] = useState(false);

    // --- Carousel Handlers ---
    const nextSlide = useCallback((e) => {
        e.stopPropagation();
        setCurrentSlide((prev) => (prev + 1) % imageUrls.length);
    }, [imageUrls.length]);

    const prevSlide = useCallback((e) => {
        e.stopPropagation();
        setCurrentSlide((prev) => (prev - 1 + imageUrls.length) % imageUrls.length);
    }, [imageUrls.length]);
    // --- End Carousel Handlers ---


    // --- Countdown and Notification Effect (Unchanged logic, uses notificationApi mock) ---
    useEffect(() => {
        const initialCountdown = formatCountdown(status, startTime, endTime);
        setCountdown(initialCountdown);
        
        if (initialCountdown.isFinished) {
            setNotificationSent(true);
            return;
        }

        const intervalId = setInterval(() => {
            const newCountdown = formatCountdown(status, startTime, endTime);
            setCountdown(newCountdown);

            if (newCountdown.isFinished && !notificationSent) {
                
                const sendNotification = async () => {
                    const apiPayload = {
                        notiType: "activities",
                        senderId: 1, 
                        senderRole: "manager",
                        title: `Đấu giá kết thúc`,
                        message: `Sản phẩm bạn đấu giá ${title} đã kết thúc. Mời bạn xem kết quả`,
                        targetUserId: LOGGED_IN_USER_ID.toString() 
                    };
                    try {
                        await notificationApi.createNotification(apiPayload);
                        setNotificationSent(true); 
                        clearInterval(intervalId);
                    } catch (e) {
                        console.error("Failed to send auction end notification:", e);
                    }
                };
                sendNotification();
            }

        }, 1000); 

        return () => clearInterval(intervalId);

    }, [status, startTime, endTime, title, notificationSent, id]); 


    const handleCardClick = () => {
        navigate(`/auction/${id}`);
    };

    // Helper to format currency
    const formatCurrency = (amount) => {
        const price = amount || 0;
        return price.toLocaleString('vi-VN') + ' VND';
    };

    // REMOVED: handlePlaceBid function

    // Determine the price to display (uses props directly now)
    const displayPrice = currentBid > 0 ? currentBid : startingPrice;
    
    // Safely get the image URL from the array of objects
    const displayImage = (imageUrls && imageUrls.length > 0 && imageUrls[currentSlide]?.imageUrl) 
        ? imageUrls[currentSlide].imageUrl 
        : placeholderImage;

    // Determine the state for conditional rendering
    const isUpcoming = countdown.label === 'Starts In' && !countdown.isFinished;
    const isEnded = countdown.isFinished;

    return (
        <div
            onClick={handleCardClick}
            className="flex flex-col w-full max-w-sm rounded-xl overflow-hidden shadow-lg 
            hover:shadow-2xl transition-shadow duration-300 cursor-pointer bg-white"
        >
            {/* -------------------- Image Carousel -------------------- */}
            <div className="relative h-60 overflow-hidden group">
                <img
                    src={displayImage}
                    onError={(e) => { e.currentTarget.src = placeholderImage; }}
                    alt={`${title} image ${currentSlide + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 ease-in-out transform hover:scale-105"
                />
                {/* Carousel Controls & Indicators */}
                {imageUrls.length > 1 && (
                    <>
                        <button
                            onClick={prevSlide}
                            className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black/50 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            aria-label="Previous image"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={nextSlide}
                            className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black/50 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            aria-label="Next image"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-1.5 z-10">
                            {imageUrls.map((_, index) => (
                                <span
                                    key={index}
                                    className={`block w-2.5 h-2.5 rounded-full ${index === currentSlide ? 'bg-white' : 'bg-white/50'}`}
                                ></span>
                            ))}
                        </div>
                    </>
                )}
            </div>
            {/* ------------------ Card Content ------------------ */}
            <div className="p-5 flex flex-col flex-grow">
                <div className="flex-grow">
                    <p className="text-sm text-gray-500 mb-1">{category}</p>
                    <h2 className="text-lg font-bold text-gray-900 leading-snug line-clamp-2">
                        {title}
                    </h2>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-3">
                    {/* Price and Countdown */}
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-xs text-gray-500">
                                {currentBid > 0 ? "Current Bid" : "Starting Price"}
                            </p>
                            <p className="text-xl font-extrabold text-indigo-600">
                                {formatCurrency(displayPrice)}
                            </p>
                        </div>
                        {/* Countdown Display */}
                        <div className={`text-right ${countdown.isFinished ? 'text-red-500' : 'text-gray-700'}`}>
                            <p className="text-xs text-gray-500">{countdown.label}</p>
                            <div className="flex items-center gap-1.5 font-bold">
                                <RegClock className="w-3 h-3" />
                                <span>{countdown.time}</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Section: Always a single View Details button */}
                    <button
                        onClick={handleCardClick}
                        className={`w-full font-semibold py-2 px-3 rounded-lg transition-colors text-sm flex justify-center items-center shadow-md 
                            ${isUpcoming ? 'bg-orange-500 text-white hover:bg-orange-600' : isEnded ? 'bg-gray-700 text-white hover:bg-gray-800' : 'bg-indigo-600 text-white hover:bg-indigo-700'}
                        `}
                    >
                        {isUpcoming ? 'View Auction' : isEnded ? 'View Results' : 'View Details'}
                        <ArrowRight className="ml-2 w-3 h-3" />
                    </button>
                </div>
            </div>
        </div>
    );
};
