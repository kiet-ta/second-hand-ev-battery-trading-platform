import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Spin, Alert, InputNumber, Button, message, List, Avatar, Card, Tag, Space } from 'antd';
import { FiClock, FiUser, FiTrendingUp, FiTag, FiCheckCircle, FiMessageSquare, FiPhone, FiMapPin } from 'react-icons/fi';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { GiGemChain } from "react-icons/gi";

// ACTUAL API IMPORTS (Assuming these paths are correct in your project)
import auctionApi from '../../api/auctionApi';
import itemApi from '../../api/itemApi';
import userApi from '../../api/userApi';
import walletApi from '../../api/walletApi';

// --- CONFIG CONSTANTS ---
const PRICE_STEP = 100000;
const LOGGED_IN_USER_ID = localStorage.getItem("userId") || 1; 
const DEFAULT_BID_HISTORY = []; 

// --- COUNTDOWN HOOK (UNMODIFIED) ---
const useCountdown = (endTimeStr) => {
    const calculateTimeRemaining = useCallback(() => {
        if (!endTimeStr) return { time: "N/A", isFinished: true };

        const now = new Date().getTime();
        const endTime = new Date(endTimeStr).getTime();
        const distance = endTime - now;

        if (distance < 0) {
            return { time: "00h 00m 00s", isFinished: true };
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        const pad = (num) => String(num).padStart(2, '0');

        if (days > 0) {
            return { time: `${days}d ${pad(hours)}h ${pad(minutes)}m`, isFinished: false };
        }
        return { time: `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`, isFinished: false };
    }, [endTimeStr]);

    const [countdown, setCountdown] = useState(calculateTimeRemaining);

    useEffect(() => {
        if (!endTimeStr) return;
        const currentCountdown = calculateTimeRemaining();
        setCountdown(currentCountdown);

        if (currentCountdown.isFinished) return;

        const intervalId = setInterval(() => {
            setCountdown(calculateTimeRemaining());
        }, 1000);

        return () => clearInterval(intervalId);
    }, [calculateTimeRemaining, endTimeStr]);

    return countdown;
};


function AuctionDetailPage() {
    const { id } = useParams();

    const [auction, setAuction] = useState(null);
    const [itemDetails, setItemDetails] = useState(null);
    const [sellerProfile, setSellerProfile] = useState(null);
    const [currentUserProfile, setCurrentUserProfile] = useState(null); 
    // ✨ CHANGE 1: New state for bid history, separate from the main auction object
    const [bidHistory, setBidHistory] = useState(DEFAULT_BID_HISTORY); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedImage, setSelectedImage] = useState(0);
    const [bidAmount, setBidAmount] = useState(null); 
    const [isBidding, setIsBidding] = useState(false);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false); // New loading state for history
    const [isPhoneVisible, setIsPhoneVisible] = useState(false);
    const [walletBalance, setWalletBalance] = useState(0);

    const countdown = useCountdown(auction?.endTime);

    const getMinBid = useCallback(() => {
        const basePrice = auction?.currentPrice || auction?.startingPrice || 0;
        return basePrice + PRICE_STEP;
    }, [auction]);

    // ✨ HELPER FUNCTION: To normalize the bid history data
    const normalizeBidHistory = (history) => {
        if (!history || !Array.isArray(history)) return DEFAULT_BID_HISTORY;
        // Map the API response format { fullName, bidAmount, bidTime } 
        // to the list format { bidder, bidAmount, timestamp }
        return history.map(bid => ({
            bidder: bid.fullName || 'Unknown User', 
            bidAmount: bid.bidAmount,
            timestamp: bid.bidTime 
        })).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Sort by newest first
    }

    // ✨ NEW FUNCTION: Dedicated function to fetch and set bid history
    const fetchBiddingHistory = useCallback(async (auctionId) => {
        if (!auctionId) return;
        setIsHistoryLoading(true);
        try {
            const historyData = await auctionApi.getBiddingHistory(auctionId);
            setBidHistory(normalizeBidHistory(historyData));
        } catch (err) {
            console.error("Failed to fetch bidding history:", err);
            // Optionally, show a message. For now, we'll fail silently or use the previous history.
        } finally {
            setIsHistoryLoading(false);
        }
    }, []);


    // --- Primary Data Fetch Effect: Auction, Item, User, Wallet ---
    useEffect(() => {
        if (!id) return;

        const fetchInitialData = async () => {
            try {
                setLoading(true);
                setError(null);

                // 1. Fetch Auction Data (by Item ID)
                const auctionData = await auctionApi.getAuctionByItemId(id);
                const auctionId = auctionData.auctionId; // Get auctionId for history fetch

                // 2. Fetch Item Details
                const itemData = await itemApi.getItemDetailByID(auctionData.itemId);

                // 3. Fetch Seller Profile
                const sellerId = itemData.updatedBy;
                const userData = await userApi.getUserByID(sellerId);
                
                // 4. Fetch Current User Profile 
                const userProfile = await userApi.getUserByID(LOGGED_IN_USER_ID); 
                setCurrentUserProfile(userProfile);

                // 5. Fetch Wallet Balance
                const walletResponse = await walletApi.getWalletByUser(LOGGED_IN_USER_ID);

                // 6. Set initial state
                setAuction(auctionData);
                setItemDetails(itemData);
                setSellerProfile(userData);
                setWalletBalance(walletResponse.balance || 0);

                // 7. Set initial bid amount
                const basePrice = auctionData.currentPrice || auctionData.startingPrice;
                const minBid = basePrice + PRICE_STEP; 
                setBidAmount(minBid); 
                
                // 8. Trigger Bid History Fetch
                if (auctionId) {
                    await fetchBiddingHistory(auctionId);
                }

            } catch (err) {
                console.error("API Fetch Error:", err);
                setError(err.response?.data?.message || `Failed to load details for item ID ${id}.`);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [id, fetchBiddingHistory]); // Include fetchBiddingHistory in dependency array

    // --- API Bid Handler ---
    const handlePlaceBid = async () => {
        if (!auction || !auction.auctionId || bidAmount === null) {
            message.error("Auction details not fully loaded or bid amount is invalid.");
            return;
        }

        const minBid = getMinBid();
        if (bidAmount < minBid) {
            message.error(`Bid must be at least ${minBid.toLocaleString('vi-VN')} VND.`);
            return;
        }
        
        // Wallet Check
        if (bidAmount > walletBalance) {
            message.error(`Insufficient funds! Your current wallet balance is ${walletBalance.toLocaleString('vi-VN')} VND.`);
            return;
        }
        
        setIsBidding(true);
        try {
            const userId = LOGGED_IN_USER_ID; 
            const payload = { userId, bidAmount };
            const auctionId = auction.auctionId;
            console.log(auctionId)
            const response = await auctionApi.bidAuction(auctionId, payload);
            
            if (response && response.message === "Bid placed successfully.") {
                message.success(response.message || `Bid of ${bidAmount.toLocaleString('vi-VN')} VND placed successfully!`);

                // 1. Re-fetch minimal auction data to get the new currentPrice and totalBids
                const updatedAuctionData = await auctionApi.getAuctionByItemId(id); 
                setAuction(prev => ({
                    ...prev,
                    currentPrice: updatedAuctionData.currentPrice,
                    totalBids: updatedAuctionData.totalBids,
                }));
                
                // 2. Refresh Wallet Balance
                const newWalletResponse = await walletApi.getWalletByUser(LOGGED_IN_USER_ID);
                setWalletBalance(newWalletResponse.balance || 0);
                message.info(`Wallet updated: New balance is ${newWalletResponse.balance.toLocaleString('vi-VN')} VND.`);

                // 3. ✨ NEW: Refresh the dedicated Bid History
                await fetchBiddingHistory(auctionId);

                // 4. Set the input value to the new next minimum bid
                setBidAmount(updatedAuctionData.currentPrice + PRICE_STEP); 

            } else {
                message.error(response.message || "Failed to place bid. Server response invalid.");
            }
        } catch (error) {
            console.error("Bid submission error:", error);
            message.error(error.response?.data?.message || "An error occurred while submitting your bid.");
        } finally {
            setIsBidding(false);
        }
    };

    // --------------------------------------------------------------------------------------------------

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-screen">
                <Spin size="large" />
                <p className="mt-4 text-lg font-semibold">Loading Auction...</p>
            </div>
        );
    }

    if (error || !auction || !itemDetails) {
        return <div className="p-8"><Alert message="Error" description={error || "Auction data is unavailable. Please check the URL."} type="error" showIcon /></div>;
    }

    const isOngoing = !countdown.isFinished;
    const bidDisabled = !isOngoing || isBidding; 
    
    // Data extraction and defaults
    const itemDetailSpec = itemDetails.evDetail || itemDetails.batteryDetail; 
    const imageUrls = auction.images?.map(img => img.imageUrl) || itemDetails.itemImage?.map(img => img.imageUrl) || [];
    const placeholderImage = `https://placehold.co/600x400/374151/d1d5db?text=${encodeURIComponent(auction.title || 'No Image')}`;
    const displayImage = imageUrls[selectedImage] || placeholderImage;
    const keySpecs = [
        { label: 'Type', value: itemDetails?.itemType?.toUpperCase() },
        { label: 'Brand', value: itemDetailSpec?.brand },
        { label: 'Model', value: itemDetailSpec?.model || itemDetailSpec?.capacity ? `${itemDetailSpec.capacity}kWh` : undefined },
        { label: 'Year', value: itemDetailSpec?.year },
        { label: 'Body Style', value: itemDetailSpec?.bodyStyle },
        { label: 'Color', value: itemDetailSpec?.color },
        { label: 'License Plate', value: itemDetailSpec?.licensePlate },
        { label: 'Mileage', value: itemDetailSpec?.mileage !== null && itemDetailSpec?.mileage !== undefined ? `${itemDetailSpec.mileage.toLocaleString('vi-VN')} km` : undefined },
        { label: 'Capacity', value: itemDetailSpec?.capacity ? `${itemDetailSpec.capacity} kWh` : undefined },
        { label: 'Voltage', value: itemDetailSpec?.voltage ? `${itemDetailSpec.voltage} V` : undefined },
    ];

    const displayPrice = auction.currentPrice || auction.startingPrice || 0;

    return (
        <div className="bg-gray-50 min-h-screen p-4 sm:p-8">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">
                
                {/* Left Column (lg:col-span-3): Image, Specs, Description (Unmodified for brevity) */}
                <div className="lg:col-span-3 flex flex-col gap-8">
                    {/* ... Image, Specs, Description Cards (same as before) ... */}
                    <Card className="shadow-lg p-0">
                        <div className="relative">
                            <img 
                                src={displayImage} 
                                alt={`${auction.title} image`} 
                                onError={(e) => { e.currentTarget.src = placeholderImage; }}
                                className="w-full object-cover rounded-t-lg aspect-[3/2]" 
                            />
                            {imageUrls.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setSelectedImage(prev => (prev - 1 + imageUrls.length) % imageUrls.length)}
                                        className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 p-3 rounded-full text-white transition-all z-10"
                                        aria-label="Previous image"
                                    >
                                        <FaChevronLeft />
                                    </button>
                                    <button
                                        onClick={() => setSelectedImage(prev => (prev + 1) % imageUrls.length)}
                                        className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 p-3 rounded-full text-white transition-all z-10"
                                        aria-label="Next image"
                                    >
                                        <FaChevronRight />
                                    </button>
                                </>
                            )}
                        </div>
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

                    <Card className="shadow-md p-6">
                        <h2 className="text-2xl font-bold border-b pb-4 mb-4 text-gray-800">Key Specifications</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                            {keySpecs.filter(spec => spec.value).map(spec => (
                                <div key={spec.label}>
                                    <p className="text-sm text-gray-500">{spec.label}</p>
                                    <p className="font-semibold text-gray-800">{spec.value}</p>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card className="shadow-md p-6">
                        <h2 className="text-2xl font-bold border-b pb-4 mb-4 text-gray-800">Detailed Description</h2>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {itemDetails.description || 'No detailed description provided for this item.'}
                        </p>
                    </Card>
                </div>

                {/* --- Right Column (lg:col-span-2): Bidding and Seller --- */}
                <div className="lg:col-span-2 flex flex-col gap-6 sticky top-8 h-fit">
                    
                    {/* Main Info Card (Price, Countdown, Bid Input) (Unmodified for brevity) */}
                    <Card className="shadow-lg p-6">
                        <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-1">{auction.title}</h1>
                        <p className="text-md text-gray-500 mb-6">{itemDetailSpec?.brand || 'Item'} ({itemDetailSpec?.year || 'N/A'})</p>
                            <div className={`p-3 text-center rounded-lg shadow-inner ${countdown.isFinished ? 'bg-red-100 border border-red-400' : 'bg-indigo-100 border border-indigo-400'}`}>
                            <p className="text-sm font-medium text-gray-600">Time Remaining</p>
                            <div className="flex items-center justify-center gap-2 mt-1">
                                <FiClock className={`text-xl ${countdown.isFinished ? 'text-red-600' : 'text-indigo-600'}`} />
                                <span className={`text-2xl font-extrabold ${countdown.isFinished ? 'text-red-600' : 'text-indigo-600'}`}>
                                    {countdown.isFinished ? 'ENDED' : countdown.time}
                                </span>
                            </div>
                        </div>

                        {/* Current Bid Details */}
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-sm text-gray-600">Current Bid</p>
                                    <p className="text-3xl font-extrabold text-indigo-700">
                                        {displayPrice.toLocaleString('vi-VN')} VND
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-500">{auction.totalBids || 0} Bids</p>
                                    <Tag color="blue" className="mt-1">
                                        Step: {PRICE_STEP.toLocaleString('vi-VN')} VND
                                    </Tag>
                                </div>
                            </div>
                        </div>

                        {/* --- Bidding Input & Button (same as before) --- */}
                        <div className="mt-6">
                            <p className="font-semibold mb-2 flex justify-between items-center">
                                Your Bid 
                                <span className="text-xs text-gray-500 font-normal">Min: {getMinBid().toLocaleString('vi-VN')} VND</span>
                            </p>
                            <p className="mt-2 text-sm text-gray-700 font-medium">
                                Your Wallet Balance: 
                                <span className="font-bold text-indigo-600 ml-1">
                                    {walletBalance.toLocaleString('vi-VN')} VND
                                </span>
                            </p>
                            <Space.Compact style={{ width: '100%' }}>
                                <InputNumber
                                    size="large"
                                    value={bidAmount} 
                                    onChange={setBidAmount}
                                    min={getMinBid()}
                                    step={PRICE_STEP}
                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={(value) => value ? parseInt(value.replace(/\D/g, '')) : 0}
                                    addonAfter="VND"
                                    disabled={bidDisabled}
                                    style={{ width: '100%' }}
                                />
                                <Button 
                                    type="primary" 
                                    size="large" 
                                    className="bg-indigo-600 hover:bg-indigo-700" 
                                    style={{ width: '120px', flexShrink: 0 }}
                                    onClick={handlePlaceBid}
                                    loading={isBidding}
                                    disabled={bidDisabled}
                                >
                                    {isOngoing ? "Place Bid" : "Ended"}
                                </Button>
                            </Space.Compact>
                            <p className="text-xs text-gray-500 mt-2">
                                Next minimum bid: {getMinBid().toLocaleString('vi-VN')} VND
                            </p>
                        </div>
                    </Card>

                    {/* Seller Profile (Unmodified for brevity) */}
                    {sellerProfile && (
                        <Card className="shadow-md p-6">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800"><FiUser /> Seller Information</h2>
                            <div className="flex items-center gap-4">
                                <img 
                                    className="w-16 h-16 rounded-full object-cover ring-2 ring-indigo-500 p-0.5" 
                                    src={sellerProfile.avatar || 'https://i.pinimg.com/736x/b6/10/ae/b610ae5879e2916e1bb7c4c161754f4d.jpg'}
                                    alt={sellerProfile.fullName}
                                />
                                <div className="flex-1">
                                    <p className="font-bold text-lg">{sellerProfile.fullName}</p>
                                    <p className="text-sm text-gray-500 flex items-center gap-1"><FiCheckCircle className='text-green-500'/> Verified Seller</p>
                                </div>
                                <button className="border border-indigo-600 text-indigo-600 font-semibold py-2 px-4 rounded-lg hover:bg-indigo-50 transition-colors flex-shrink-0">
                                    View Profile
                                </button>
                            </div>
                            <div className="flex flex-row gap-3 mt-4 pt-4 border-t border-gray-100">
                                <button className="flex-1 bg-blue-500 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors text-sm">
                                    <FiMessageSquare /> Chat
                                </button>
                                <button
                                    onClick={() => setIsPhoneVisible(!isPhoneVisible)}
                                    className="flex-1 bg-green-500 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-green-600 transition-colors text-sm"
                                >
                                    <FiPhone />
                                    {isPhoneVisible ? (sellerProfile?.phone || 'N/A') : 'Show Phone'}
                                </button>
                            </div>
                        </Card>
                    )}

                    {/* Bid History (Now using dedicated state and loading) */}
                    <Card className="shadow-lg">
                        <h3 className="text-xl font-bold border-b pb-2 mb-4 flex items-center gap-2 text-gray-800"><FiTrendingUp /> Bid History {isHistoryLoading && <Spin size="small" />}</h3>
                        <List
                            itemLayout="horizontal"
                            size="small"
                            dataSource={bidHistory} // ✨ CHANGE 2: Use the dedicated bidHistory state
                            locale={{ emptyText: "No bids placed yet." }}
                            renderItem={(bid, index) => (
                                <List.Item>
                                    <List.Item.Meta
                                        avatar={<Avatar icon={<FiUser />} className="bg-gray-200 text-gray-600"/>}
                                        title={<span className="font-semibold">{bid.bidder || 'Unknown User'}</span>} 
                                        description={<span className="text-xs text-gray-500">{new Date(bid.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>}
                                    />
                                    <div className="text-right">
                                        <span className={`font-bold text-lg ${index === 0 ? 'text-indigo-600' : 'text-gray-800'}`}>
                                            {bid.bidAmount.toLocaleString('vi-VN')} VND
                                        </span>
                                    </div>
                                </List.Item>
                            )}
                        />
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default AuctionDetailPage;