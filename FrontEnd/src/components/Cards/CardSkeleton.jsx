import React from 'react';

const CardSkeleton = () => (
    <div className="w-80 h-110 bg-gray-100 rounded-lg shadow-xl border border-gray-200 p-5 animate-pulse">
        <div className="h-60 bg-gray-200 rounded-lg mb-4"></div> 
        <div className="h-6 bg-gray-200 rounded w-5/6 mb-3"></div> 
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div> 
        <div className="flex justify-between items-end mt-4 pt-4 border-t border-gray-300">
            <div>
                <div className="h-4 bg-gray-200 rounded w-12 mb-2"></div> 
                <div className="h-8 bg-gray-200 rounded w-24"></div> 
            </div>
            <div className="h-4 bg-gray-200 rounded w-20"></div> 
        </div>
    </div>
);

export default CardSkeleton;