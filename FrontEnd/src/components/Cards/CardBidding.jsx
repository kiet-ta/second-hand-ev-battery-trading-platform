import React, { useState, useEffect } from 'react';
import {
    FaChevronLeft,
    FaChevronRight,
    FaRegStar,
    FaRegClock
} from "react-icons/fa";
import { Link } from 'react-router-dom';

const formatCountdown = (targetTimeMs) => {
    const now = new Date().getTime();
    const distance = targetTimeMs - now;

    if (distance < 0) {
        return "ENDED";
    }

    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    const pad = (num) => String(num).padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

export const CarAuctionCard = ({
    id,
    title,
    brand,
    category,
    currentBid,
    isFeatured = false,
    endTime,
    imageUrls = [],
}) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [countdownTime, setCountdownTime] = useState(formatCountdown(endTime));

    const totalImages = imageUrls.length;

    // --- Countdown Effect ---
    useEffect(() => {
        const intervalId = setInterval(() => {
            setCountdownTime(formatCountdown(endTime));
        }, 1000);

        // Cleanup interval on component unmount
        return () => clearInterval(intervalId);
    }, [endTime]);


    // --- Carousel Handlers ---
    const nextSlide = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % totalImages);
    };

    const prevSlide = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex - 1 + totalImages) % totalImages);
    };

    const getPlaceholderImage = (index) => {
        const text = title.split(' ')[0] + ' ' + (index + 1);
        return `https://placehold.co/600x400/1f2937/d1d5db?text=${encodeURIComponent(text)}`;
    }

    const displayedImageUrls = imageUrls.length > 0 ? imageUrls :
        [getPlaceholderImage(0), getPlaceholderImage(1)]; // Use mock images if none provided

    const isAuctionEnded = countdownTime === "ENDED";

    return (
        <div className="max-w-sm w-65 h-100 rounded-xl shadow-2xl overflow-hidden bg-white 
                        transition-all duration-300 hover:shadow-3xl transform hover:-translate-y-0.5 
                        border border-gray-100 ">
                <div className="relative h-60 overflow-hidden group">

                    <div
                        className="flex h-full transition-transform duration-500 ease-in-out"
                        style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
                    >
                        {displayedImageUrls.map((url, index) => (
                            <div key={index} className="flex-shrink-0 w-full h-full">
                                <img
                                    src={url}
                                    onError={(e) => { e.target.onerror = null; e.target.src = getPlaceholderImage(index); }} // Fallback
                                    alt={`${title} image ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ))}
                    </div>

                    {/* Carousel Controls */}
                    {totalImages > 1 && (
                        <>
                            <button
                                onClick={prevSlide}
                                className="absolute left-3 top-1/2 p-2 bg-black/50 text-white rounded-full 
                                       opacity-0 group-hover:opacity-100 transition duration-300 
                                       hover:bg-black/70 z-20 -translate-y-1/2"
                                aria-label="Previous image"
                            >
                                <FaChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={nextSlide}
                                className="absolute right-3 top-1/2 p-2 bg-black/50 text-white rounded-full 
                                       opacity-0 group-hover:opacity-100 transition duration-300 
                                       hover:bg-black/70 z-20 -translate-y-1/2"
                                aria-label="Next image"
                            >
                                <FaChevronRight className="w-5 h-5" />
                            </button>
                        </>
                    )}

                    {/* Top-Right: FEATURED Badge */}
                    {isFeatured && (
                        <div className="absolute top-3 right-3 px-3 py-1 text-xs font-bold uppercase 
                                    tracking-wider text-white bg-red-600 rounded-full shadow-lg z-10">
                            Featured
                        </div>
                    )}

                    {/* Bottom-Left: Countdown & Bid Overlay */}
                    <div className="absolute bottom-3 left-3 flex items-center space-x-2 bg-black/70 p-2 rounded-lg text-white shadow-xl z-10">

                        {/* Countdown Timer */}
                        <div className={`flex items-center space-x-1 ${isAuctionEnded ? 'text-red-400' : 'text-white'}`}>
                            <FaRegClock className="w-4 h-4" />
                            <span className="font-bold text-sm tracking-wide">
                                {countdownTime}
                            </span>
                        </div>

                        {/* Bid/Price Display */}
                        <span className="font-extrabold text-sm bg-maincolor px-2 py-0.5 rounded-md">
                            {currentBid}
                        </span>
                    </div>
                </div>
                                <Link to={`auctions/item/${id}`}>

                {/* 2. Details Section */}
                <div className="p-5">
                    <h2 className="text-1xl font-extrabold text-gray-900 leading-snug mb-1">
                        {title}
                    </h2>
                    <p className="text-sm text-gray-600 mb-3">
                        {brand} - {category}
                    </p>
                </div>

            </Link>
        </div>
    );
};
