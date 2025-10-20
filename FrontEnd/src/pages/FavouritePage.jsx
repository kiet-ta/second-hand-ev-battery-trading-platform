// src/pages/FavouritePage.js

import React, { useEffect, useState } from 'react';
import { Spin, message } from 'antd';
import favouriteApi from '../api/favouriteApi'; // Adjust path if needed
import CardComponent from '../components/Cards/Card'; // Adjust path if needed

function FavouritePage() {
    const [favorites, setFavorites] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchFavorites = async () => {
            setIsLoading(true);
            try {
                const userId = localStorage.getItem("userId");
                if (!userId) {
                    message.error("User not found. Please log in.");
                    setIsLoading(false);
                    return;
                }
                const response = await favouriteApi.getFavouriteByUserID(userId);
                setFavorites(response || []); // Ensure it's an array even if API returns null/undefined
            } catch (error) {
                console.error("Failed to fetch favorites:", error);
                message.error("Could not load your favorites. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchFavorites();
    }, []);

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen"><Spin size="large" /></div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-4">
                    My Favorites ❤️
                </h1>

                {favorites.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {favorites.map((fav) => (
                            <CardComponent
                                key={fav.favId}
                                id={fav.itemId}
                                title={fav.title}
                                price={fav.price}
                                image={fav.imageUrls && fav.imageUrls.length > 0 ? fav.imageUrls[0] : null}
                                type={fav.itemType}
                                year={fav.itemDetail?.year}
                                mileage={fav.itemDetail?.mileage}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center p-10 bg-white rounded-lg shadow-sm">
                        <h2 className="text-xl font-medium text-gray-800">No Favorites Yet</h2>
                        <p className="text-gray-500 mt-2">
                            Click the heart icon on any product to save it here.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default FavouritePage;