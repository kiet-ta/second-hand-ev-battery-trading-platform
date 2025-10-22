import React from 'react';
import { Link } from 'react-router-dom';
import CardComponent from './Cards/Card';
import CardSkeleton from './Cards/CardSkeleton';
import { FiArrowRight } from 'react-icons/fi';

const ProductSection = ({
  items = [],
  loading = false,
  itemsToLoad = 4,
  userFavorites = [],
  onFavoriteChange,
  itemType, // New prop to determine the link destination
}) => {
  // Construct the search URL based on the itemType
  const viewAllUrl = `/search?itemType=${itemType}&query=&page=1&pageSize=20&sortBy=UpdatedAt&sortDir=desc`;

  return (
    <div className="w-full mb-16">
      <div className="flex justify-between items-center pb-2 mb-8">
        {/* The h2 is kept for alignment but the title is rendered in HomePage via SectionHeader */}
        <h2 className="text-left text-3xl font-serif font-bold text-[#2C2C2C]"></h2>
        <Link to={viewAllUrl} className="flex items-center text-[#B8860B] font-semibold hover:text-[#D4AF37] transition-colors">
          View All
          <FiArrowRight className="ml-2 w-4 h-4" />
        </Link>
      </div>

      <div className="Products grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-30 justify-items-center">
        {loading
          ? Array.from({ length: itemsToLoad }).map((_, index) => <CardSkeleton key={index} />)
          : items.map((item, index) => (
            <CardComponent
              key={item.itemId || index}
              id={item.itemId}
              title={item.title}
              type={item.itemType}
              price={item.price}
              sales={0}
              year={item.itemDetail?.year}
              mileage={item.itemDetail?.mileage}
              itemImages={item.imageUrls || item.images}
              isVerified={item.isVerified || item.moderation === 'approved_tag'}
              userFavorites={userFavorites}
              onFavoriteChange={onFavoriteChange}
            />
          ))
        }
      </div>
    </div>
  );
};

export default ProductSection;

