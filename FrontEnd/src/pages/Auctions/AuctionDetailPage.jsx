import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
// Step 1: Import 'Input' from Ant Design
import { Spin, Alert, Input, InputNumber, Button, message } from 'antd';
import { FiClock, FiTag, FiUser, FiTrendingUp } from 'react-icons/fi';

// --- MOCK DATA BASED ON YOUR JSON ---
const getMockAuctionDetails = (auctionId) => {
  console.log(`Fetching mock data for auction ID: ${auctionId}`);
  return {
    auctionId: parseInt(auctionId),
    itemId: 9,
    title: 'High-Capacity Battery 60kWh',
    startingPrice: 200000000,
    currentPrice: 215000000,
    priceStep: 5000000,
    totalBids: 3,
    endTime: '2025-11-09T10:00:00',
    status: 'ACTIVE',
    imageUrls: [
      "https://res.cloudinary.com/tucore/image/upload/v1759547479/EV_BATTERY_TRADING/Electric_Verhicle/oo6awv6ctkis3ummkarx.png",
      "https://i.pinimg.com/originals/c8/e2/c3/c8e2c3a50dce39c40212f716bce39ce3.jpg",
      "https://i.pinimg.com/originals/5a/a2/87/5aa2875f1b25914629910f22b724af54.jpg",
    ],
    itemDetail: {
      brand: "Generic EV Parts",
      model: "Lithium-Ion Pack",
      year: 2024,
      color: "N/A",
      mileage: 0,
      description: "A brand new, high-capacity 60kWh battery pack suitable for custom EV projects or as a replacement for compatible vehicles. Provides excellent range and performance with a long lifecycle. Includes all necessary connectors for a standard installation.",
      hasAccessories: false,
    },
    bidHistory: [
        { bidder: 'User***123', bidAmount: 215000000, timestamp: new Date(Date.now() - 2 * 60000).toISOString() },
        { bidder: 'User***456', bidAmount: 210000000, timestamp: new Date(Date.now() - 5 * 60000).toISOString() },
        { bidder: 'User***789', bidAmount: 205000000, timestamp: new Date(Date.now() - 10 * 60000).toISOString() },
    ]
  };
};

function AuctionDetailPage() {
  const { auctionId } = useParams();
  const location = useLocation();

  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [bidAmount, setBidAmount] = useState(0);

  useEffect(() => {
    const fetchDetails = () => {
      try {
        setLoading(true);
        setTimeout(() => {
          const data = getMockAuctionDetails(auctionId);
          setAuction(data);
          setBidAmount(data.currentPrice + data.priceStep);
          setLoading(false);
        }, 1000);
      } catch (error) {
        setError("Failed to load auction details.",error);
        setLoading(false);
      }
    };
    fetchDetails();
  }, [auctionId]);
  
  const handlePlaceBid = () => {
    if (bidAmount <= auction.currentPrice) {
      message.error(`Your bid must be higher than the current bid!`);
      return;
    }
    console.log(`Submitting bid for auction ${auctionId} with amount ${bidAmount}`);
    message.success(`Bid of ${bidAmount.toLocaleString('vi-VN')} VND placed successfully!`);
  };

  if (loading) {
    return (
        <div className="flex flex-col justify-center items-center h-screen">
            <Spin size="large" />
            <p className="mt-4 text-lg font-semibold">{location.state?.title || "Loading Auction..."}</p>
        </div>
    );
  }

  if (error) {
    return <div className="p-8"><Alert message="Error" description={error} type="error" showIcon /></div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Side: Images and Description */}
        <div className="flex flex-col gap-8">
          <div className="bg-white rounded-lg shadow-md p-4">
              <img src={auction.imageUrls[selectedImage]} alt={auction.title} className="w-full h-auto object-cover rounded-lg aspect-video"/>
              <div className="flex gap-2 mt-3 overflow-x-auto">
                  {auction.imageUrls.map((url, index) => (
                      <img 
                        key={index} 
                        src={url} 
                        alt={`Thumbnail ${index+1}`}
                        onClick={() => setSelectedImage(index)}
                        className={`w-24 h-24 object-cover rounded-md cursor-pointer border-2 ${selectedImage === index ? 'border-indigo-500' : 'border-transparent'}`}
                      />
                  ))}
              </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold border-b pb-4 mb-4">Description</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{auction.itemDetail.description}</p>
          </div>
        </div>

        {/* Right Side: Bidding and History */}
        <div className="bg-white rounded-lg shadow-md p-6 h-fit sticky top-8">
            <h1 className="text-3xl font-bold text-gray-900 leading-tight">{auction.title}</h1>
            <p className="text-md text-gray-500">{auction.itemDetail.brand} {auction.itemDetail.model} ({auction.itemDetail.year})</p>
            
            <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                <p className="text-sm text-gray-600">Current Bid</p>
                <p className="text-4xl font-extrabold text-indigo-700">{auction.currentPrice.toLocaleString('vi-VN')} VND</p>
                <p className="text-sm mt-1 text-gray-500">{auction.totalBids} bids so far</p>
            </div>

            {/* --- MODIFIED BID INPUT SECTION --- */}
            <div className="mt-6">
                <p className="font-semibold mb-2">Place your bid</p>
                {/* Step 2: Wrap the input and button in an Input.Group */}
                <Input.Group compact>
                    {/* Step 3: The InputNumber now takes up the remaining space */}
                    <InputNumber
                        style={{ width: 'calc(100% - 130px)' }}
                        size="large"
                        value={bidAmount}
                        onChange={setBidAmount}
                        min={auction.currentPrice + auction.priceStep}
                        step={auction.priceStep}
                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={(value) => value.replace(/\D/g, '')}
                        addonAfter="VND"
                    />
                    {/* Step 4: The Button sits right next to it with a fixed width */}
                    <Button 
                        type="primary" 
                        size="large" 
                        className="bg-indigo-600" 
                        style={{ width: '130px' }}
                        onClick={handlePlaceBid}
                    >
                        Place Bid
                    </Button>
                </Input.Group>
                <div className="mt-4 text-center text-red-600 font-semibold flex items-center justify-center gap-2">
                    <FiClock /> Auction ends on {new Date(auction.endTime).toLocaleDateString('vi-VN')}
                </div>
            </div>

             <div className="mt-8">
             <h3 className="text-xl font-bold border-b pb-2 mb-4 flex items-center gap-2"><FiTrendingUp /> Bid History</h3>
             <ul className="space-y-3 max-h-48 overflow-y-auto">
                 {auction.bidHistory.map((bid, index) => (
                    <li key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
                        <div className="flex items-center gap-3">
                           <FiUser className="text-gray-400"/>
                           <p className="font-semibold">{bid.bidder}</p>
                        </div>
                        <p className="font-bold text-gray-800">{bid.bidAmount.toLocaleString('vi-VN')} VND</p>
                    </li>
                 ))}
             </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuctionDetailPage;