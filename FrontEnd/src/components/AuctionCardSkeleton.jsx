import React from 'react';

// This component mimics the shape of your CarAuctionCard while loading
export const AuctionCardSkeleton = () => (
  <div className="border border-gray-200 rounded-lg shadow-sm p-4 animate-pulse w-full max-w-md mx-auto">
    {/* Image placeholder */}
    <div className="bg-gray-300 h-56 rounded-md mb-4"></div>
    {/* Title placeholder */}
    <div className="h-5 bg-gray-300 rounded w-3/4 mb-3"></div>
    {/* Specs placeholder */}
    <div className="h-4 bg-gray-300 rounded w-full mb-4"></div>
    {/* Bid and Time placeholders */}
    <div className="flex justify-between items-center">
      <div className="h-8 bg-gray-300 rounded w-1/3"></div>
      <div className="h-6 bg-gray-300 rounded w-1/4"></div>
    </div>
  </div>
);