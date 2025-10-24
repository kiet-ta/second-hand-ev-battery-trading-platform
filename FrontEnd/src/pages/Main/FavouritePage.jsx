import React, { useEffect, useState, useCallback } from 'react';
import { Spin } from 'antd';
import { FiHeart } from 'react-icons/fi';
import favouriteApi from '../../api/favouriteApi';
import FavoriteItemCard from '../../components/Cards/FavoriteItemCard';

function FavouritePage() {
    const [favorites, setFavorites] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const userId = localStorage.getItem("userId");

    // --- Fetch favorites ---
    const fetchFavorites = useCallback(async () => {
        if (!userId) {
            setFavorites([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const response = await favouriteApi.getFavouriteByUserID(userId);
            const sorted = (response || []).sort((a, b) =>
                a.itemType.localeCompare(b.itemType)
            );
            setFavorites(sorted);
        } catch (err) {
            console.error("❌ Failed to fetch favorites:", err);
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchFavorites();
    }, [fetchFavorites]);

    // --- Optimistic remove ---
    const handleRemoveFavorite = async (favId) => {
        // Prevent double deletion
        if (!favId) return;

        // Optimistic UI update
        setFavorites((prev) => prev.filter((item) => item.favId !== favId));

        try {
            await favouriteApi.deleteFavourite(favId);
            console.log(`✅ Favourite ${favId} deleted successfully`);
        } catch (err) {
            console.error("❌ Failed to remove favorite:", err);
            // Rollback UI if API fails
            await fetchFavorites();
        }
    };

    // --- Header ---
    const renderHeader = () => (
        <div className="flex items-center space-x-3 mb-10 pt-4 border-b-2 border-yellow-600/50 pb-3">
            <FiHeart className="w-8 h-8 text-yellow-600" />
            <h1 className="text-3xl sm:text-4xl font-serif font-semibold text-gray-800 tracking-wide">
                My Treasury of Selections
            </h1>
        </div>
    );

    // --- Loading ---
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-[#faf8f5]">
                <Spin size="large" style={{ color: '#d4af37' }} />
            </div>
        );
    }

    // --- Main ---
    return (
        <div className="min-h-screen bg-[#faf8f5] text-gray-800">
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-10">
                {renderHeader()}

                {!userId ? (
                    <div className="text-center p-12 bg-white rounded-xl shadow-md border border-yellow-500/30">
                        <h2 className="text-2xl font-serif font-semibold text-yellow-700 mb-2">
                            Access Restricted
                        </h2>
                        <p className="text-gray-600">
                            Please sign in to view your saved favorites.
                        </p>
                    </div>
                ) : favorites.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {favorites.map((fav) => (
                            <FavoriteItemCard
                                key={fav.favId}
                                favId={fav.favId}
                                id={fav.itemId}
                                title={fav.title}
                                price={fav.price}
                                itemImages={fav.imageUrls}
                                type={fav.itemType}
                                year={fav.itemDetail?.year}
                                mileage={fav.itemDetail?.mileage}
                                isVerified={fav.moderation === 'approved_tag'}
                                onRemoveSuccess={() => handleRemoveFavorite(fav.favId)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center p-12 bg-white rounded-xl shadow-md border border-yellow-500/20">
                        <h2 className="text-2xl font-serif font-semibold text-gray-700 mb-2">
                            Awaiting Your Selections...
                        </h2>
                        <p className="text-gray-600">
                            Your favorites list is empty. Browse our collection and tap the heart icon to add treasures here.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default FavouritePage;
