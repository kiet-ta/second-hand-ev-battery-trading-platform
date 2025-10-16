import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import orderItemApi from '../../api/orderItemApi';

// --- SVG Icons ---
// Replaced react-icons with inline SVGs to remove external dependency.

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

function CardComponent({
    id,
    title,
    price = 0,
    image,
    type,
    year,
    mileage = 0,
}) {
    const navigate = useNavigate();
    // Prevents navigating when the "Add to Cart" button is clicked
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
        } catch (error) {
            console.error("Error adding item to cart", error);
        }

    };

    // Prevents navigating when the "Buy Now" button is clicked
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
        // You can add your logic for buying now here
    };

    // Dynamically set the link based on the item type
    const detailPageUrl = type === 'ev' ? `/ev/${id}` : `/battery/${id}`;

    return (
        <Link to={detailPageUrl} state={id} className="block w-full group">
            <div className="w-full bg-white rounded-lg shadow-md border border-gray-200 transition-all duration-300 group-hover:shadow-xl group-hover:border-indigo-500 group-hover:-translate-y-1">

                {/* 1. IMAGE SECTION */}
                <div className="relative">
                    {/* This container enforces a 16:9 widescreen aspect ratio.
                        This keeps the image wide but not too tall.
                    */}
                    <div className="aspect-w-16 aspect-h-9">
                        <img
                            className="w-full h-70 object-cover rounded-t-lg" // ✨ object-cover ensures the image fills the space without distortion
                            src={image || "https://placehold.co/600x400/e2e8f0/e2e8f0?text=."}
                            alt={title}
                        />
                    </div>

                    {/* ACTION BUTTONS - appear on hover */}
                    <div className="absolute top-3 right-3 z-10 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
                </div>

                {/* 2. CONTENT SECTION */}
                <div className="p-5">
                    <h3 className="text-xl font-bold text-gray-900 truncate" title={title}>
                        {title}
                    </h3>

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
                            <p className="text-2xl font-extrabold text-indigo-600">
                                {price.toLocaleString('vi-VN')}
                            </p>
                            <p className="text-2xl font-extrabold text-indigo-600">
                                VND
                            </p>
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

