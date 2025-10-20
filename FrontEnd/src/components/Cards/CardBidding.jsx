import React, { useState, useEffect } from 'react';
import {
  FaChevronLeft,
  FaChevronRight,
  FaRegClock,
    FaArrowRight, // Use FaArrowRight for the view details icon
} from "react-icons/fa"; // Added FaArrowRight for consistency
import { useNavigate } from 'react-router-dom';

// Placeholder for external messaging/feedback system (like 'message' from Ant Design)
const mockMessage = {
    success: (text) => console.log(`SUCCESS: ${text}`),
    error: (text) => console.error(`ERROR: ${text}`),
};

// Placeholder for the auction API (replace with your actual implementation)
const mockAuctionApi = {
    placeBid: async (auctionId, bidAmount) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (bidAmount > 0) {
                    resolve({ success: true, newBid: bidAmount, message: "Bid placed successfully!" });
                } else {
                    throw new Error("Invalid bid amount.");
                }
            }, 500);
        });
    }
};


// ✨ EXISTING HELPER FUNCTION (Unchanged)
const formatCountdown = (status, startTimeStr, endTimeStr) => {
    const now = new Date().getTime();
    
    // Convert ISO strings to Date objects (milliseconds since epoch)
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

    if (isFinished || status === 'ENDED') {
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
    startingPrice = 0, // Assuming starting price is available
  endTime,
  startTime, 
  status, 
  imageUrls = [],
}) => {
  const navigate = useNavigate();
  const placeholderImage = `https://placehold.co/600x400/374151/d1d5db?text=${encodeURIComponent(title || 'No Image')}`;
    const [bidAmount, setBidAmount] = useState(currentBid + 100000); // Initialize bid input slightly higher than current bid
    const [latestBid, setLatestBid] = useState(currentBid); // State to track the latest bid shown on the card
    const [currentSlide, setCurrentSlide] = useState(0);

    // --- Carousel Handlers (Unchanged) ---
    const nextSlide = (e) => {
    e.stopPropagation(); 
    setCurrentSlide((prev) => (prev + 1) % imageUrls.length);
  };

  const prevSlide = (e) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev - 1 + imageUrls.length) % imageUrls.length);
  };
    // --- End Carousel Handlers ---

  const displayImage = imageUrls && imageUrls.length > 0
    ? imageUrls[currentSlide].imageUrl 
    : placeholderImage;

  // --- Countdown State & Effect (Unchanged) ---
  const [countdown, setCountdown] = useState(() => 
    formatCountdown(status, startTime, endTime)
  );

  useEffect(() => {
    if (countdown.isFinished) return;

    const intervalId = setInterval(() => {
      setCountdown(formatCountdown(status, startTime, endTime));
    }, 1000); 

    return () => clearInterval(intervalId);
  }, [status, startTime, endTime, countdown.isFinished]);

  const handleCardClick = () => {
    navigate(`/auction/${id}`);
  };

  // Helper to format currency
  const formatCurrency = (amount) => {
    const price = amount || 0;
    return price.toLocaleString('vi-VN') + ' VND';
  };

    // ✨ NEW: Place Bid Handler
    const handlePlaceBid = async (e) => {
        e.stopPropagation();
        e.preventDefault();

        // 1. Validation
        if (status !== 'ONGOING') {
            mockMessage.error("Auction is not currently ongoing.");
            return;
        }
        if (bidAmount <= latestBid) {
            mockMessage.error(`Your bid must be higher than the current price of ${formatCurrency(latestBid)}.`);
            return;
        }

        try {
            // Replace with your actual API call: await auctionApi.placeBid(id, bidAmount);
            await mockAuctionApi.placeBid(id, bidAmount);
            
            // 2. Optimistic UI Update (or re-fetch if necessary)
            setLatestBid(bidAmount);
            setBidAmount(bidAmount + 100000); // Increase suggested next bid
            mockMessage.success(`Successfully placed bid: ${formatCurrency(bidAmount)}`);
        } catch (error) {
            mockMessage.error(`Failed to place bid: ${error.message}`);
        }
    };
    
    // Determine the base price to display (Current Bid or Starting Price)
    const displayPrice = latestBid > 0 ? latestBid : startingPrice;


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
                {/* Carousel Controls & Indicators (Unchanged) */}
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
                {/* Display 'Current Bid' or 'Starting Price' based on the result */}
                {latestBid > 0 ? "Current Bid" : "Starting Price"}
              </p>
              <p className="text-xl font-extrabold text-indigo-600">
                {formatCurrency(displayPrice)}
              </p>
            </div>
            {/* Countdown Display */}
            <div className={`text-right ${countdown.isFinished ? 'text-red-500' : 'text-gray-700'}`}>
              <p className="text-xs text-gray-500">{countdown.label}</p>
              <div className="flex items-center gap-1.5 font-bold">
                <FaRegClock />
                <span>{countdown.time}</span>
              </div>
            </div>
          </div>

                    {/* ✨ NEW: Bidding Action Section */}
                    {status === 'ONGOING' && !countdown.isFinished ? (
                        <div className="flex gap-2">
                            <input
                                type="number"
                                value={bidAmount}
                                onChange={(e) => setBidAmount(Number(e.target.value))}
                                onClick={(e) => e.stopPropagation()} // Prevent card click
                                min={latestBid + 1}
                                step="100000" // Example minimum bid increment
                                className="w-2/3 p-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                aria-label="Enter your bid amount"
                            />
                            <button
                                onClick={handlePlaceBid}
                                className="w-1/3 bg-indigo-600 text-white font-semibold py-2 px-3 rounded-lg hover:bg-indigo-700 transition-colors text-sm shadow-md"
                            >
                                Place Bid
                            </button>
                        </div>
                    ) : (
                        // Fallback for UPCOMING or ENDED status: simple button to view details
                        <button
                            onClick={handleCardClick}
                            className="w-full bg-gray-100 text-gray-700 font-semibold py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors text-sm flex justify-center items-center"
                        >
                            View Details
                            <FaArrowRight className="ml-2 w-3 h-3" />
                        </button>
                    )}
        </div>
      </div>
    </div>
  );
};
