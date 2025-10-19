import React, { useState, useEffect } from 'react';
import {
    FaChevronLeft,
    FaChevronRight,
    FaRegClock
} from "react-icons/fa";
import { useNavigate } from 'react-router-dom';

// ✨ UPDATED HELPER FUNCTION to handle countdown and duration logic
const formatCountdown = (status, startTimeStr, endTimeStr) => {
    const now = new Date().getTime();
    
    // Convert ISO strings to Date objects (milliseconds since epoch)
    const startTime = new Date(startTimeStr).getTime();
    const endTime = new Date(endTimeStr).getTime();

    let distance;
    let label = "Ends In";
    let isFinished = false;

    if (status === 'UPCOMING') {
        // For UPCOMING, calculate time UNTIL start
        distance = startTime - now;
        label = "Starts In";
        
        // If the start time is passed, but status is still UPCOMING, something is wrong,
        // but we'll prioritize showing time until start.
        if (distance < 0) {
            // A small grace period or transition state
            distance = 0; 
        }

    } else if (status === 'ONGOING') {
        // For ONGOING, calculate time remaining until end
        distance = endTime - now;
        label = "Ends In";

        if (distance < 0) {
            isFinished = true;
        }
    } else { // ENDED or any other status
        distance = 0;
        isFinished = true;
    }

    if (isFinished || status === 'ENDED') {
        return { time: status === 'ENDED' ? "ENDED" : "OVERDUE", label: "Status", isFinished: true };
    }
    
    // Time calculations for days, hours, minutes, and **seconds**
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000); // ✨ New Seconds calculation

    const pad = (num) => String(num).padStart(2, '0');
    
    // Display logic updated to include seconds
    if (days > 0) {
        return { time: `${days}d ${pad(hours)}h`, label, isFinished: false };
    }
    // Changed to display Hours, Minutes, and Seconds
    return { time: `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`, label, isFinished: false };
};


export const CarAuctionCard = ({
    id,
    title,
    brand, // Brand is not available in the provided data, but kept for general use
    category,
    currentBid = 0,
    isFeatured = false, // Not used in provided data, but kept
    endTime,
    startTime, 
    status, 
    imageUrls = [],
}) => {
    const navigate = useNavigate();
    const placeholderImage = `https://placehold.co/600x400/374151/d1d5db?text=${encodeURIComponent(title || 'No Image')}`;

    // --- Carousel State & Handlers ---
    const [currentSlide, setCurrentSlide] = useState(0);

    const nextSlide = (e) => {
        // Prevent card click from triggering
        e.stopPropagation(); 
        setCurrentSlide((prev) => (prev + 1) % imageUrls.length);
    };

    const prevSlide = (e) => {
        // Prevent card click from triggering
        e.stopPropagation();
        setCurrentSlide((prev) => (prev - 1 + imageUrls.length) % imageUrls.length);
    };

    // Safely get the current image URL or use placeholder
    const displayImage = imageUrls && imageUrls.length > 0
        ? imageUrls[currentSlide].imageUrl // Assume imageUrls is an array of { imageId, imageUrl } objects
        : placeholderImage;

    // --- Countdown State & Effect ---
    const [countdown, setCountdown] = useState(() => 
        formatCountdown(status, startTime, endTime)
    );

    useEffect(() => {
        // Only run the interval if the auction is not already ended
        if (countdown.isFinished) return;

        // Set interval to 1000ms (1 second) for second-by-second countdown
        const intervalId = setInterval(() => {
            setCountdown(formatCountdown(status, startTime, endTime));
        }, 1000); // ✨ Timer updates every second

        return () => clearInterval(intervalId);
    }, [status, startTime, endTime, countdown.isFinished]);

    const handleCardClick = () => {
        navigate(`/auction/${id}`);
    };

    // Helper to format currency (assuming input is VND)
    const formatCurrency = (amount) => {
        // Use currentPrice if available, otherwise use startingPrice
        const price = amount || 0;
        return price.toLocaleString('vi-VN') + ' VND';
    };

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

                {/* Carousel Controls */}
                {imageUrls.length > 1 && (
                    <>
                        <button
                            onClick={prevSlide}
                            className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black/50 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            aria-label="Previous image"
                        >
                            <FaChevronLeft />
                        </button>
                        <button
                            onClick={nextSlide}
                            className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black/50 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            aria-label="Next image"
                        >
                            <FaChevronRight />
                        </button>
                        {/* Dots Indicator */}
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

                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                    <div>
                        <p className="text-xs text-gray-500">
                            {/* Display 'Current Bid' or 'Starting Price' based on currentBid value */}
                            {currentBid > 0 ? "Current Bid" : "Starting Price"}
                        </p>
                        <p className="text-xl font-extrabold text-indigo-600">
                            {formatCurrency(currentBid)}
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