import React, { useState, memo } from 'react';
import { Link } from 'react-router-dom';
import favouriteApi from '../../api/favouriteApi';
import { FiHeart } from 'react-icons/fi';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import PropTypes from "prop-types";


// Simple verified badge
const VerifiedCheck = ({ className = "" }) => (
  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 ${className}`}>
    <svg className="-ml-0.5 mr-1.5 h-3 w-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
    Đã Duyệt
  </div>
);

const FiArrowRight = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

FiArrowRight.propTypes = {
  className: PropTypes.string,
};


function FavoriteItemCard({
  favId,
  id,
  title,
  price = 0,
  itemImages,
  type,
  year,
  mileage = 0,
  isVerified = false,
  onRemoveSuccess,
}) {
  const [isRemoving, setIsRemoving] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const displayImages = (itemImages && itemImages.length > 0)
    ? itemImages
    : ["https://placehold.co/600x400/e2e8f0/e2e8f0?text=."];

  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    arrows: false,
  };

  const handleRemoveFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Prevent double click or retry if already deleted
    if (isRemoving || deleted) return;
    if (!favId) {
      console.warn("Favorite ID missing, skipping delete.");
      return;
    }

    setIsRemoving(true);
    try {
      await favouriteApi.deleteFavourite(favId);
      setDeleted(true);

      // Call parent refresh AFTER local delete state
      if (onRemoveSuccess) onRemoveSuccess();

    } catch (error) {
      console.error("Failed to remove favorite:", error);
    } finally {
      setIsRemoving(false);
    }
  };

  const detailPageUrl = type === 'ev' ? `/ev/${id}` : `/battery/${id}`;

  if (deleted) return null; // prevent flicker

  return (
    <Link to={detailPageUrl} state={id} className="block group">
      <div className="w-full bg-white rounded-lg shadow-md border border-gray-300 transition-all duration-300 group-hover:shadow-lg group-hover:border-yellow-500 group-hover:-translate-y-1">

        {/* Image Section */}
        <div className="relative">
          <Slider {...carouselSettings}>
            {displayImages.map((url, index) => (
              <div key={index} className="aspect-w-16 aspect-h-9">
                <img
                  className="w-full p-2 rounded-2xl h-60 object-cover"
                  src={url}
                  alt={`${title} - ${index}`}
                  loading="lazy"
                />
              </div>
            ))}
          </Slider>

          {isVerified && (
            <div className="absolute top-2 left-2 z-10">
              <VerifiedCheck />
            </div>
          )}

          {/* Remove button */}
          <div className="absolute top-3 right-3 z-10 flex flex-col items-end">
            <button
              onClick={handleRemoveFavoriteClick}
              disabled={isRemoving}
              title="Remove from favorites"
              className={`flex items-center justify-center w-10 h-10 rounded-full 
                ${isRemoving ? "bg-gray-300 cursor-not-allowed" : "bg-red-400 hover:bg-red-500"} 
                text-white transition-all duration-300 shadow-md`}
            >
              <FiHeart className="w-5 h-5 fill-white" />
            </button>
          </div>
        </div>

        {/* Info Section */}
        <div className="p-5">
          <div className="flex items-start">
            <h3 className="text-lg font-semibold text-gray-900 truncate">{title}</h3>
          </div>

          <div className="flex items-center text-sm text-gray-500 mt-2 space-x-4">
            {year && <span>{year}</span>}
            {!!mileage && <span>{mileage.toLocaleString()} km</span>}
            <span className="capitalize">{type}</span>
          </div>

          <div className="flex justify-between items-end mt-4 pt-4 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-500">Price</p>
              <p className="text-xl font-bold text-indigo-600">
                {price.toLocaleString('vi-VN')} <span className="text-sm">VND</span>
              </p>
            </div>
            <div className="flex items-center text-indigo-600 font-semibold">
              <span>Chi tiết</span>
              <FiArrowRight className="ml-1 w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default memo(FavoriteItemCard);
