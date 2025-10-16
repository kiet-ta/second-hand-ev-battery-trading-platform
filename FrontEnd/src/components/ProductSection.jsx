import React from 'react';
import CardComponent from './Cards/Card'; // Adjust path if needed

// A simple skeleton loader to show while cards are loading
const CardSkeleton = () => (
  <div className="w-full max-w-sm border border-gray-200 rounded-lg shadow-sm p-4 animate-pulse">
    <div className="bg-gray-300 h-48 rounded-md mb-4"></div>
    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
    <div className="h-6 bg-gray-300 rounded w-1/2"></div>
  </div>
);

const ProductSection = ({ title, items = [], loading = false, itemsToLoad = 4 }) => {
  return (
    <div className="bg-white mt-4 w-full rounded-lg shadow-sm">
      <h2 className="text-left text-2xl m-4 p-4 font-bold border-b border-gray-200">
        {title}
      </h2>
      <div className="Products grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
        {loading 
          ? Array.from({ length: itemsToLoad }).map((_, index) => <CardSkeleton key={index} />)
          : items.map((item) => (
              <CardComponent
                key={item.itemId}
                id={item.itemId}
                title={item.title}
                type={item.itemType}
                price={item.price}
                sales={0} // Replace with actual sales data if available
                image={item.image || "https://i.pinimg.com/1200x/555306/43312e136a9fa2a576d6fcfbd0.jpg"} // Use item's image with a fallback
              />
            ))
        }
      </div>
    </div>
  );
};

export default ProductSection;