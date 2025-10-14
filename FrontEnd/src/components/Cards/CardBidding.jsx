import React, { useState, useEffect } from 'react';
import {
    FaChevronLeft,
    FaChevronRight,
    FaRegClock
} from "react-icons/fa";
import { useNavigate } from 'react-router-dom';


// ✨ UPDATED HELPER FUNCTION
const formatCountdown = (status, startTime, endTime) => {
    const now = new Date().getTime();

    // Determine which time difference to calculate
    let distance;
    let label = "Ends In";

    if (status === 'UPCOMING') {
        distance = endTime - startTime; // Calculate the auction's total duration
        label = "Duration";
    } else {
        distance = endTime - now; // Calculate time remaining
    }

    if (distance < 0 || status === 'ENDED') {
        return { time: "ENDED", label: "Status", isFinished: true };
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

    const pad = (num) => String(num).padStart(2, '0');

    if (days > 0) {
        return { time: `${days}d ${pad(hours)}h`, label, isFinished: false };
    }
    return { time: `${pad(hours)}h ${pad(minutes)}m`, label, isFinished: false };
};


export const CarAuctionCard = ({
    id,
    title,
    brand,
    category,
    currentBid = 0,
    isFeatured = false,
    endTime,
    startTime, // ✨ Accept startTime
    status,      // ✨ Accept status
    imageUrls = [],
}) => {

    const navigate = useNavigate();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const placeholderImage = `https://placehold.co/600x400/374151/d1d5db?text=${encodeURIComponent(title)}`;

    const displayImage = imageUrls && imageUrls[0] ? imageUrls[0] : placeholderImage;

    // State now holds both the time string and the label
    const [countdown, setCountdown] = useState(formatCountdown(status, startTime, endTime));

    // --- Countdown Effect ---
    useEffect(() => {
        // Only run the interval if the auction is not already ended
        if (countdown.isFinished) return;

        const intervalId = setInterval(() => {
            setCountdown(formatCountdown(status, startTime, endTime));
        }, 1000);

        return () => clearInterval(intervalId);
    }, [status, startTime, endTime, countdown.isFinished]);

    const handleCardClick = () => {
        navigate(`/auction/${id}`);
    };

    // ... (Your other handlers like nextSlide, prevSlide remain the same)

    return (
        <div onClick={handleCardClick} className="flex flex-col w-full max-w-sm rounded-xl ...">
            {/* ... (Image Carousel section remains the same) ... */}
            <div className="relative h-60 overflow-hidden group">
                <img
                    // Use the safe 'displayImage' variable here
                    src={displayImage}
                    // Add an extra fallback in case the URL is broken
                    onError={(e) => { e.currentTarget.src = placeholderImage; }}
                    alt={`${title} image`}
                    className="w-full h-full object-cover"
                />
            </div>

            <div className="p-5 flex flex-col flex-grow">
                <div className="flex-grow">
                    <p className="text-sm text-gray-500 mb-1">{brand} - {category}</p>
                    <h2 className="text-lg font-bold text-gray-900 leading-snug truncate">
                        {title}
                    </h2>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                    <div>
                        <p className="text-xs text-gray-500">Current Bid</p>
                        <p className="text-xl font-extrabold text-indigo-600">
                            {currentBid.toLocaleString('vi-VN')} VND
                        </p>
                    </div>
                    {/* ✨ UPDATED COUNTDOWN DISPLAY */}
                    <div className={`text-right ${countdown.isFinished ? 'text-red-500' : 'text-gray-700'}`}>
                        <p className="text-xs text-gray-500">{countdown.label}</p>
                        <div className="flex items-center gap-1.5 font-bold">
                            <FaRegClock />
                            <span>{countdown.time}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};