import React, { useEffect, useState } from 'react';
import { Spin, Alert } from 'antd';
import itemApi from '../api/itemApi';
import ProductSection from '../components/ProductSection'; // Import the new component
import CardComponent from '../components/Cards/Card'; // Assuming this is your Card component
import GeminiChatWidget from "../components/GeminiChatWidget";

// Skeleton for the top "first-sale" section
const FirstSaleSkeleton = () => (
  <div className="w-full max-w-sm border border-gray-200 rounded-lg shadow-sm p-4 animate-pulse">
    <div className="bg-gray-300 h-48 rounded-md mb-4"></div>
    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
    <div className="h-6 bg-gray-300 rounded w-1/2"></div>
  </div>
);


function HomePage() {
  // Consolidated state for easier management
  const [data, setData] = useState({ firstSale: [], evList: [], batteryList: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    const fetchAllItems = async () => {
      try {
        setLoading(true);
        // Fetch all data in parallel for much better performance
        const [items, evs, batteries] = await Promise.all([
          itemApi.getItem(),
          itemApi.getItemByLatestEV(),
          itemApi.getItemByLatestBattery()
        ]);
        setData({
          firstSale: items.slice(0, 3), // Get first 3 items
          evList: evs,
          batteryList: batteries
        });
      } catch (err) {
        console.error("Error fetching items", err);
        setError("Could not load products. Please check your connection and try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchAllItems();
  }, []);

  if (error) {
    return (
      <div className="p-8">
        <Alert message="Error" description={error} type="error" showIcon />
      </div>
    );
  }

  return (
    <div className="HomePage w-full m-0 p-0 bg-gray-50 overflow-x-hidden">

      {/* --- Top Section with your specified width --- */}
      <div className="First-sale flex flex-wrap w-full bg-white gap-0 p-4 justify-around items-start">
        <div className="Advertisement w-1/6 hidden lg:grid grid-cols-2 gap-2">
          <div className="col-span-2"><img src="https://i.pinimg.com/736x/9f/2b/97/9f2b9783252352925b8bbc1c0f1f2145.jpg" className='w-full h-auto rounded-lg' alt="Ad 1" /></div>
          <div><img src="https://i.pinimg.com/1200x/e9/22/29/e9222949753e671a7e8f7c09725ebed0.jpg" className='w-full h-auto rounded-lg' alt="Ad 2" /></div>
          <div><img src="https://i.pinimg.com/1200x/73/9d/61/739d6130ed4b7c1abf45a429d1e83b0b.jpg" className='w-full h-auto rounded-lg' alt="Ad 3" /></div>
        </div>

        <div className="Products flex w-full lg:w-4/6 justify-center content-center self-center gap-5">
          {loading
            ? <>
              <FirstSaleSkeleton />
              <FirstSaleSkeleton />
              <FirstSaleSkeleton />
            </>
            : data.firstSale.map((item) => (
              <CardComponent
                key={item.itemId}
                id={item.itemId}
                title={item.title}
                type={item.itemType}
                price={item.price}
                sales={0}
                image={"https://i.pinimg.com/1200x/55/53/06/55530643312e136a9fa2a576d6fcfbd0.jpg"}
              />
            ))}
        </div>
      </div>
      <GeminiChatWidget />


      {/* --- Banner --- */}
      <div className="Banner mt-5 mx-auto px-4">
        <img src="https://images4.alphacoders.com/136/thumb-1920-1360814.png"
          className="h-40 w-full object-cover rounded-lg shadow-lg" alt="Promotional Banner" />
      </div>

      {/* --- Reusable Product Sections --- */}
      <div className=" mx-auto px-4">
        <ProductSection
          title="Latest Electric Vehicles"
          items={data.evList}
          loading={loading}
        />
        <ProductSection
          title="High-Performance Batteries"
          items={data.batteryList}
          loading={loading}
        />
      </div>

    </div>
  );
}

export default HomePage;