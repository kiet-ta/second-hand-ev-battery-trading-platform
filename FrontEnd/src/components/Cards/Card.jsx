import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import orderItemApi from '../../api/orderItemApi';
import { message } from 'antd'; // ✨ Import for user feedback
import favouriteApi from '../../api/favouriteApi';
import { FiHeart } from 'react-icons/fi';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
// --- SVG Icons ---

// ... (Existing FiZap, FiShoppingCart, FiArrowRight components remain here)

const FiZap = ({ className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
    </svg>
);

const FiShoppingCart = ({ className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <circle cx="9" cy="21" r="1"></circle>
        <circle cx="20" cy="21" r="1"></circle>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
    </svg>
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

// --- NEW VERIFIED CHECK SVG COMPONENT ---
const VerifiedCheck = ({ className = "" }) => (
    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 ${className}`}>
        <svg className="-ml-0.5 mr-1.5 h-3 w-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        Đã Duyệt
    </div>
);

function CardComponent({
    id,
    title,
    price = 0,
    itemImages,
    type,
    year,
    mileage = 0,
    isVerified = false, // ✨ NEW PROP
}) {
    const navigate = useNavigate();

    const carouselSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        arrows: false,
    };
    console.log(itemImages)
    const displayImages = (itemImages && itemImages.length > 0) 
        ? itemImages 
        : [{ imageUrl: "https://placehold.co/600x400/e2e8f0/e2e8f0?text=." }];
    
    // ... (Existing handleAddToCartClick, handleBuyNowClick, handleFavoriteClick functions remain here)
    const handleAddToCartClick = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const cartPayload = {
            "buyerId": localStorage.getItem("userId"),
            "itemId": id,
            "quantity": 1,
            "price": 10
        };
        try {
            await orderItemApi.postOrderItem(cartPayload);
            message.success(`'${title}' added to cart!`); // Added success message
        } catch (error) {
            console.error("Error adding item to cart", error);
            message.error("Could not add to cart. Please try again.");
        }

    };

    const handleBuyNowClick = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const cartPayload = {
            "buyerId": localStorage.getItem("userId"),
            "itemId": id,
            "quantity": 1,
            "price": 10
        };
        try {
            await orderItemApi.postOrderItem(cartPayload);
        } catch (error) {
            console.error("Error adding item to cart", error);
        }
        navigate('/cart', { state: { selectedItemId: id } }); 
        console.log(`'Buy Now' clicked for item ID: ${id}`);
    };

    const handleFavoriteClick = async (e) => {
        e.preventDefault();
        e.stopPropagation(); // Prevents navigating when clicking the button

        const userId = localStorage.getItem("userId");
        if (!userId) {
            message.error("You must be logged in to add favorites.");
            return;
        }

        const favoritePayload = {
            userId: parseInt(userId, 10),
            itemId: id,
            createdAt: new Date().toISOString(),
        };

        try {
            await favouriteApi.postFavourite(favoritePayload);
            message.success(`'${title}' has been added to your favorites!`);
        } catch (error) {
            console.error("Failed to add favorite:", error);
            message.error("Could not add to favorites. Please try again.");
        }
    };
    
    // Dynamically set the link based on the item type
    const detailPageUrl = type === 'ev' ? `/ev/${id}` : `/battery/${id}`;

    return (
        <Link to={detailPageUrl} state={id} className="block group">
            <div className="w-80 h-110 bg-white rounded-lg shadow-md border border-gray-200 transition-all duration-300 group-hover:shadow-xl group-hover:border-indigo-500 group-hover:-translate-y-1">

                {/* 1. IMAGE SECTION */}
                <div className="relative">
                    <Slider {...carouselSettings}>
                        {displayImages.map((img, index) => (
                            <div key={index} className="aspect-w-16 aspect-h-9">
                                <img
                                    className="w-full p-2 rounded-2xl h-60 object-cover"
                                    src={img.imageUrl}
                                    alt={`${title} - view ${index + 1}`}
                                />
                                {isVerified && (
                    <div className="absolute top-2 left-2 z-10"> {/* Adjust top/left for positioning */}
                        <VerifiedCheck />
                    </div>
                )}
                            </div>
                            
                        ))}
                    </Slider>
                    {/* ACTION BUTTONS - appear on hover */}
                    <div className="absolute top-3 right-3 z-10 flex flex-col items-end space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                            onClick={handleFavoriteClick}
                            title="Add to Favorites"
                            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm text-red-500 hover:bg-red-50 transition-all duration-300 shadow-lg"
                        >
                            <FiHeart className="w-5 h-5" />
                        </button>
                        {type == `battery` && ( 
                            <div className='flex flex-col space-y-2'>
                            <button
                                onClick={handleBuyNowClick}
                                className="flex items-center justify-center px-4 py-2 rounded-md font-semibold text-xs bg-maincolor text-white hover:bg-maincolor-darker transition-all duration-300 shadow-lg"
                            >
                                <FiZap className="mr-1.5" />
                                Buy Now
                            </button>
                            <button
                                onClick={handleAddToCartClick}
                                className="flex items-center justify-center px-4 py-2 rounded-md font-semibold text-xs bg-white/90 backdrop-blur-sm text-gray-900 hover:bg-gray-100 transition-all duration-300 shadow-lg"
                            >
                                <FiShoppingCart className="mr-1.5" />
                                Add to Cart
                            </button>
                        </div>
)}
                    </div>
                </div>

                {/* 2. CONTENT SECTION */}
                <div className="p-5">
                    <div className="flex items-center"> {/* ✨ WRAPPER FOR TITLE AND VERIFIED CHECK */}
                        <h3 className="text-xl font-bold text-gray-900 truncate" title={title}>
                            {title}
                        </h3>
                    </div>


                    {/* Key Specs for quick info */}
                    <div className="flex items-center text-sm text-gray-500 mt-2 space-x-4">
                        {year && <span>{year}</span>}
                        {!!mileage && <span className="hidden sm:inline">{mileage.toLocaleString()} km</span>}
                        <span className="capitalize">{type}</span>
                    </div>

                    {/* Price and View Details Link */}
                    <div className="flex justify-between items-end mt-4 pt-4 border-t border-gray-100">
                        <div>
                            <p className="text-xs text-gray-500">Price</p>
                            {/* Combined price and currency into a single block for better alignment */}
                            <div className="flex items-end leading-none">
                                <p className="text-2xl font-extrabold text-indigo-600">
                                    {price.toLocaleString('vi-VN')}
                                </p>
                                <p className="ml-1 text-base font-extrabold text-indigo-600">
                                    VND
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center text-indigo-600 font-semibold transition-transform group-hover:translate-x-1">
                            <span>View Details</span>
                            <FiArrowRight className="ml-2 w-4 h-4" />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default CardComponent;