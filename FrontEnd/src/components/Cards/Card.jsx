import React from 'react';
import { FiPlusSquare, FiCheckSquare, FiArrowRight } from "react-icons/fi";
import { Link } from 'react-router-dom';

function CardComponent({
    id,
    title,
    price,
    image,
    type,
    // Key specs for a more informative card
    year,
    mileage,
    // Props for the compare feature
    onCompare = () => {},
    isCompared = false
}) {
    // Prevents navigating when the "Compare" button is clicked
    const handleCompareClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onCompare(id);
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
                    
                    {/* COMPARE BUTTON - appears on hover */}
                    <button
                        onClick={handleCompareClick}
                        className={`absolute top-3 right-3 z-10 flex items-center px-3 py-1.5 rounded-md font-semibold text-xs transition-all duration-300
                                   bg-white/80 backdrop-blur-sm shadow-md
                                   opacity-0 group-hover:opacity-100 
                                   ${isCompared ? 'text-green-600' : 'text-indigo-600 hover:bg-indigo-100'}`}
                    >
                        {isCompared ? <FiCheckSquare className="mr-1.5" size={14} /> : <FiPlusSquare className="mr-1.5" size={14} />}
                        {isCompared ? 'Added' : 'Compare'}
                    </button>
                </div>

                {/* 2. CONTENT SECTION */}
                <div className="p-5">
                    <h3 className="text-xl font-bold text-gray-900 truncate" title={title}>
                        {title}
                    </h3>

                    {/* Key Specs for quick info */}
                    <div className="flex items-center text-sm text-gray-500 mt-2 space-x-4">
                        {year && <span>{year}</span>}
                        {mileage !== undefined && <span className="hidden sm:inline">{mileage.toLocaleString()} km</span>}
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
                            <FiArrowRight className="ml-2" />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default CardComponent;