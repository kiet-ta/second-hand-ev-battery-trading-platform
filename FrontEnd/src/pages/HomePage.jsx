import React, { useState, useEffect } from 'react';
import { Spin, Alert } from 'antd';
import itemApi from '../api/itemApi';
import ProductSection from '../components/ProductSection'; // Import the new component
import CardComponent from '../components/Cards/Card'; // Assuming this is your Card component
import GeminiChatWidget from "../components/GeminiChatWidget";

// Skeleton for the top "first-sale" section (Unchanged)
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
    console.log(items)
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

 // --- Helper function to check for verified status ---
 const isItemVerified = (item) => item.moderation === 'approved_tag';


 return (
  <div className="HomePage w-full m-0 p-0 bg-gray-50 overflow-x-hidden">

   {/* --- Top Section with your specified width --- */}
   <div className="First-sale flex flex-wrap w-full bg-white gap-0 p-4 justify-around items-start">
    <div className="Advertisement w-1/6 hidden lg:grid grid-cols-2 gap-2">
     <div className="col-span-2"><img src="https://res.cloudinary.com/tucore/image/upload/v1760941757/EV_BATTERY_TRADING/Item/kvoawoe0vnah8zjzzipz.jpg" className='w-full h-auto rounded-lg' alt="Ad 1" /></div>
     <div><img src="https://res.cloudinary.com/tucore/image/upload/v1760941494/EV_BATTERY_TRADING/Item/bvzqv7hi2og6axtd2t3i.jpg" className='w-full h-auto rounded-lg' alt="Ad 2" /></div>
     <div><img src="https://res.cloudinary.com/tucore/image/upload/v1760941531/EV_BATTERY_TRADING/Item/f2xmqrttvqwgllqztcdp.jpg" className='w-full h-auto rounded-lg' alt="Ad 3" /></div>
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
        itemImages={item.images}
                // ✨ ADDED VERIFICATION CHECK HERE
        isVerified={isItemVerified(item)}
       />
      ))}
    </div>
   </div>
   <GeminiChatWidget />


   {/* --- Banner --- */}
   <div className="Banner mt-5 mx-auto px-4">
    <img src="https://thegioixechaydien.com.vn/uploads/files/bai-viet/nguoi-dung/tin-hay/2016/thang-09/baner-xe-dap-dien/baner-xe-dap-dien-13.jpg"
     className="h-40 w-full object-cover rounded-lg shadow-lg" alt="Promotional Banner" />
   </div>

   {/* --- Reusable Product Sections --- */}
   <div className=" mx-auto px-4">
        {/*
            ✨ NOTE: ProductSection already handles mapping and passes item data, 
            but it doesn't currently apply the isVerified flag during its internal mapping 
            based on the code snippet you provided for ProductSection earlier. 
            
            Option A (Best Practice for React): Modify ProductSection to map data internally 
            and apply the isVerified flag, or ensure the data passed here (data.evList/data.batteryList) 
            already has a clean `isVerified` boolean field attached.

            Option B (Simple Fix for this context): Transform the data here before passing it.
        */}
        
        {/* Transforming EV List */}
    <ProductSection
     title="Latest Electric Vehicles"
     items={data.evList.map(item => ({
                ...item,
                isVerified: isItemVerified(item)
            }))}
     loading={loading}
    />

        {/* Transforming Battery List */}
    <ProductSection
     title="High-Performance Batteries"
     items={data.batteryList.map(item => ({
                ...item,
                isVerified: isItemVerified(item)
            }))}
     loading={loading}
    />
   </div>

  </div>
 );
}

export default HomePage;