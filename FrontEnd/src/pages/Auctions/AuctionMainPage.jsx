import React, { useEffect, useState } from 'react';
import { Spin, Alert } from 'antd';
import { CarAuctionCard } from '../../components/Cards/CardBidding'; // Your existing card
import { AuctionCardSkeleton } from '../../components/AuctionCardSkeleton'; // The new skeleton
import auctionApi from '../../api/auctionApi';
import { FiFilter, FiTrendingUp } from 'react-icons/fi';

function AuctionMainPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        setLoading(true);
        const response = await auctionApi.getAuction();
        // Assuming the API response has a 'data' property containing the array
        setItems(response.data || []);
      } catch (err) {
        console.error("Error fetching auctions:", err);
        setError("Could not load auctions. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchAuctions();
  }, []);

  const renderContent = () => {
    if (loading) {
      // Show 6 skeleton cards while loading
      return Array.from({ length: 6 }).map((_, index) => (
        <AuctionCardSkeleton key={index} />
      ));
    }

    if (error) {
      // Show an error message if the API fails
      // Using col-span-full to make it take the full width of the grid
      return (
        <div className="col-span-full">
          <Alert message="Error" description={error} type="error" showIcon />
        </div>
      );
    }

    if (items.length === 0) {
      // Show a message if there are no active auctions
      return <div className="col-span-full text-center py-12 text-gray-500">
        <h2 className="text-2xl font-semibold">No Active Auctions</h2>
        <p>Please check back later for new listings.</p>
      </div>
    }

    // Render the actual auction cards
    return items.map((item) => (
      <CarAuctionCard
        key={item.auctionId}
        id={item.itemId}
        title={item.title}
        brand={item.brand}
        category={item.category}
        // Use a fallback image in case item.imageUrl is null
        imageUrls={[item.imageUrl , 'https://via.placeholder.com/400', "https://i.pinimg.com/736x/7e/25/87/7e25878ef1347c76ac7c91a7dbcd272e.jpg"]}
        endTime={new Date(item.endTime).getTime()}
        startTime={new Date(item.startTime).getTime()}
        status={item.status} // Pass the status (e.g., "UPCOMING")        currentBid={item.currentPrice} // Pass price as a number for better formatting inside the card
        isFeatured={false} // You can set this dynamically if your API supports it
      />
    ));
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-8">

        {/* Left Sidebar Image: Hidden on smaller screens */}
        <aside className="hidden lg:block lg:col-span-1 h-screen sticky top-0">
          <img src="https://images8.alphacoders.com/134/1347431.jpeg" className="h-full w-full object-cover" alt="Auction sidebar ad" />
        </aside>

        {/* Main Content Area */}
        <main className="col-span-1 lg:col-span-6 p-4 sm:p-6">
          <header className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 tracking-tight">Live Auctions</h1>
            <p className="mt-2 text-lg text-gray-500">Bid on exclusive EVs and high-performance batteries</p>
          </header>

          {/* Filter Bar */}
          <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm mb-6">
            <div className="flex gap-4">
              <button className="flex items-center gap-2 font-semibold text-gray-700 hover:text-indigo-600"><FiTrendingUp />Ending Soon</button>
              <button className="flex items-center gap-2 font-semibold text-gray-700 hover:text-indigo-600">Newly Listed</button>
            </div>
            <button className="flex items-center gap-2 font-semibold text-gray-700 border rounded-lg px-4 py-2 hover:bg-gray-50"><FiFilter />Filters</button>
          </div>

          {/* Responsive Grid for Auction Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {renderContent()}
          </div>
        </main>

        {/* Right Sidebar Image: Hidden on smaller screens */}
        <aside className="hidden lg:block lg:col-span-1 h-screen sticky top-0">
          <img src="https://images8.alphacoders.com/134/1347431.jpeg" className="h-full w-full object-cover" alt="Auction sidebar ad" />
        </aside>

      </div>
    </div>
  );
}

export default AuctionMainPage;