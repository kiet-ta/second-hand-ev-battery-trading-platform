import React, { useState, useEffect, useMemo } from 'react';
import itemApi from '../api/itemApi';
// Assuming Tailwind CSS is configured
// Assuming Ant Design is available for message component (if used in API logic)

// ====================================================================
// 1. DetailModal Component (Unchanged)
// ====================================================================
const DetailModal = ({ item, isOpen, onClose }) => {
    if (!isOpen || !item) return null;

    const renderDetails = (details) => {
        if (!details) return <p className="text-gray-500 italic">No specific details available.</p>;
        return Object.entries(details).map(([key, value]) => {
            if (key === 'itemId' || value === null || value === undefined) return null;
            return (
                <p key={key} className="text-sm my-1">
                    <strong className="font-semibold text-gray-700 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                    </strong>
                    <span className="ml-2 text-gray-600">{String(value)}</span>
                </p>
            );
        }).filter(Boolean);
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 transition-opacity duration-300"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-lg p-6 w-11/12 max-w-3xl relative shadow-2xl transform transition-all duration-300 scale-100"
                onClick={e => e.stopPropagation()}
            >
                <button
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl"
                    onClick={onClose}
                >
                    &times;
                </button>
                <h2 className="text-2xl font-bold mb-4 border-b pb-2 text-gray-800">{item.title}</h2>

                <div className="flex flex-col md:flex-row gap-6">
                    {/* Image Gallery (Left Side) */}
                    <div className="flex flex-col gap-3 p-3 bg-gray-50 rounded-lg max-h-[400px] overflow-y-auto w-full md:w-1/3 border">
                        <h4 className="text-lg font-semibold text-gray-700">Images</h4>
                        {item.itemImage?.map(img => (
                            <img
                                key={img.imageId}
                                src={img.imageUrl}
                                alt={item.title}
                                className="w-full h-24 object-cover rounded-md border border-gray-200"
                            />
                        ))}
                    </div>

                    {/* Details Section (Right Side) */}
                    <div className="flex-1">
                        <div className="mb-4 pb-2 border-b">
                            <p className="text-base">
                                <strong className="text-gray-700">Type:</strong> {item.itemType.toUpperCase()}
                            </p>
                            <p className="text-base">
                                <strong className="text-gray-700">Price:</strong> {item.price.toLocaleString()} VND
                            </p>
                            <p className="text-base">
                                <strong className="text-gray-700">Status:</strong>
                                <span className={`ml-2 px-3 py-1 rounded-full text-xs font-semibold ${item.moderation === 'approved_tag' ? 'bg-green-100 text-green-700' :
                                        item.moderation === 'reject_tag' ? 'bg-red-100 text-red-700' :
                                            'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {item.moderation ? item.moderation.replace('_tag', '').toUpperCase() : 'PENDING'}
                                </span>
                            </p>
                        </div>

                        <h4 className="text-lg font-semibold text-blue-600 mb-2">
                            {item.itemType === 'ev' ? 'Electric Vehicle Details' : 'Battery Details'}
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                            {item.itemType === 'ev' ? renderDetails(item.evDetail) : renderDetails(item.batteryDetail)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


// ====================================================================
// 2. Main Component: ProductModeration
// ====================================================================
const ProductModeration = () => {
    const [allItems, setAllItems] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [moderationFilter, setModerationFilter] = useState('all');
    const [itemTypeFilter, setItemTypeFilter] = useState('all');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // --- State to hold unique items after filtering duplicates ---
    const [uniqueItems, setUniqueItems] = useState([]);


    // Initial Data Fetch & Duplicate Filtering
    useEffect(() => {
        const fetchItems = async () => {
            setLoading(true);
            try {
                const data = await itemApi.getItemDetail();

                // 1. Filter out duplicates based on itemId
                const uniqueMap = new Map();
                data.forEach(item => {
                    // Use a composite key (itemId + itemType) if necessary, or just itemId if IDs should be globally unique
                    const key = `${item.itemId}-${item.itemType}`;
                    if (!uniqueMap.has(key)) {
                        uniqueMap.set(key, item);
                    }
                });
                const cleanData = Array.from(uniqueMap.values());

                setAllItems(data); // Keep raw data if needed for comparison/debugging
                setUniqueItems(cleanData); // Use cleanData for the table rendering

            } catch (err) {
                setError('Failed to fetch items.');
                console.error("Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchItems();
    }, []);

    // --- Filtering Logic (Memoized) ---
    const filteredItems = useMemo(() => {
        // Use the cleaned, unique data set for filtering
        let filtered = uniqueItems;

        // 1. Item Type Filter
        if (itemTypeFilter !== 'all') {
            filtered = filtered.filter(item => item.itemType === itemTypeFilter);
        }

        // 2. Moderation Filter
        if (moderationFilter !== 'all') {
            filtered = filtered.filter(item => {
                const status = item.moderation === null ? 'pending' : item.moderation;
                return moderationFilter === 'pending' ? item.moderation === null : status === moderationFilter;
            });
        }

        // 3. Search Filter
        if (searchText) {
            const lowerSearchText = searchText.toLowerCase();
            filtered = filtered.filter(item =>
                item.title?.toLowerCase().includes(lowerSearchText) ||
                item.description?.toLowerCase().includes(lowerSearchText) ||
                item.evDetail?.brand?.toLowerCase().includes(lowerSearchText) ||
                item.batteryDetail?.brand?.toLowerCase().includes(lowerSearchText)
            );
        }

        return filtered;
    }, [uniqueItems, itemTypeFilter, moderationFilter, searchText]);


    // --- API & Update Handler (Retaining the robust PUT logic) ---
    const handleUpdateModeration = async (itemId, newModeration) => {
        setLoading(true);
        setError(null);

        try {
            // 1. Fetch the full, current item details using its ID
            // NOTE: Using the raw API call ensures we get all fields regardless of local filtering
            const currentItem = await itemApi.getItemDetailByID(itemId);

            // 2. CONSTRUCT THE COMPLETE PAYLOAD 
            const fullPayload = {
                ...currentItem, // Spread all existing fields
                updatedAt: new Date().toISOString(),
                moderation: newModeration, // OVERWRITE moderation

                // Reformat itemImage to images as per your payload structure
                images: currentItem.itemImage?.map(img => ({
                    imageId: img.imageId,
                    imageUrl: img.imageUrl
                })) || [],
                // Ensure EV and Battery details are nullified if they don't exist to prevent PUT errors
                evDetail: currentItem.evDetail || null,
                batteryDetail: currentItem.batteryDetail || null
            };

            // 3. Call the API
            await itemApi.putItem(itemId, fullPayload);

            // 4. Update local state (both uniqueItems and allItems)
            const updateState = (prevItems) => prevItems.map(item =>
                item.itemId === itemId ? { ...item, moderation: newModeration } : item
            );

            setAllItems(updateState);
            setUniqueItems(updateState);

        } catch (err) {
            setError(`Error updating item ${itemId}.`);
            console.error("Update Error:", err.response ? err.response.data : err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetail = (item) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    // --- Render Row Function (Fix: uses unique item ID + list index as fallback key) ---
    const renderItemRow = (item, index) => {
        const isPending = item.moderation === null;
        const isApproved = item.moderation === 'approved_tag';
        const brand = item.evDetail?.brand || item.batteryDetail?.brand || 'N/A';
        const typeLabel = item.itemType === 'ev' ? 'EV' : 'Battery';

        // Use the first image or a placeholder
        const firstImage = item.itemImage?.[0]?.imageUrl || 'https://via.placeholder.com/50?text=No+Img';

        const statusText = item.moderation ? item.moderation.replace('_tag', '').toUpperCase() : 'PENDING';

        const statusClasses =
            isApproved ? 'bg-green-100 text-green-700' :
                item.moderation === 'reject_tag' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700';

        const rowBorderColor =
            isApproved ? 'border-l-green-500' :
                item.moderation === 'reject_tag' ? 'border-l-red-500' :
                    'border-l-yellow-500';

        const handleUpdate = (status) => {
            if (window.confirm(`Set moderation for "${item.title}" to "${status}"?`)) {
                handleUpdateModeration(item.itemId, status);
            }
        };

        // KEY FIX: Using the index (which is guaranteed unique within the filtered list)
        return (
            <tr key={index} className={`bg-white border-b hover:bg-gray-50 transition-colors border-l-4 ${rowBorderColor}`}>
                <td className="p-3 text-sm text-gray-700">{item.itemId}</td>
                <td className="p-3">
                    <img src={firstImage} alt={item.title} className="w-12 h-12 object-cover rounded-md shadow-sm" />
                </td>
                <td className="p-3">
                    <strong className="text-blue-600 hover:text-blue-800 cursor-pointer text-sm" onClick={() => handleViewDetail(item)}>{item.title}</strong>
                    <div className="text-xs text-gray-500 mt-0.5">{typeLabel}</div>
                </td>
                <td className="p-3 text-sm text-gray-600 font-medium">{brand}</td>
                <td className="p-3 text-sm text-gray-600">{item.price.toLocaleString()} VND</td>
                <td className="p-3">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusClasses}`}>
                        {statusText}
                    </span>
                </td>
                <td className="p-3 whitespace-nowrap space-x-2">
                    <button
                        className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-1 px-3 rounded"
                        onClick={() => handleViewDetail(item)}
                    >
                        View Detail
                    </button>
                    {isPending || isApproved ? (
                        <button
                            className={`text-sm font-medium py-1 px-3 rounded ${isApproved
                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                : 'bg-green-500 hover:bg-green-600 text-white'}`}
                            onClick={() => handleUpdate(isApproved ? 'reject_tag' : 'approved_tag')}
                        >
                            Change to {isApproved ? 'Reject' : 'Approve'}
                        </button>
                    ) : (
                        // If already rejected, offer option to approve it
                        <button
                            className={`text-sm font-medium py-1 px-3 rounded bg-green-500 hover:bg-green-600 text-white`}
                            onClick={() => handleUpdate('approved_tag')}
                        >
                            Change to Approve
                        </button>
                    )}
                </td>
            </tr>
        );
    };

    // --- Render ---
    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-extrabold mb-6 text-gray-900 border-b pb-3">
                Item Moderation Dashboard ({filteredItems.length} Total)
            </h1>

            {/* Filter and Search Controls (Grouped) */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-white rounded-lg shadow-md">
                <input
                    type="text"
                    placeholder="Search by title, brand, description..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />

                {/* Item Type Filter */}
                <select
                    value={itemTypeFilter}
                    onChange={(e) => setItemTypeFilter(e.target.value)}
                    className="p-2 border border-gray-300 rounded-md bg-white focus:ring-blue-500 focus:border-blue-500 transition-colors sm:w-40"
                >
                    <option value="all">All Types</option>
                    <option value="ev">EV</option>
                    <option value="battery">Battery</option>
                </select>

                {/* Moderation Status Filter */}
                <select
                    value={moderationFilter}
                    onChange={(e) => setModerationFilter(e.target.value)}
                    className="p-2 border border-gray-300 rounded-md bg-white focus:ring-blue-500 focus:border-blue-500 transition-colors sm:w-56"
                >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending (Review)</option>
                    <option value="approved_tag">Approved</option>
                    <option value="reject_tag">Rejected</option>
                </select>
            </div>

            {/* Status and Loading Indicators */}
            {(loading || error) && (
                <div className="my-4 p-4 rounded-lg bg-white shadow-sm">
                    {loading && <p className="text-blue-500">Loading or updating...</p>}
                    {error && <p className="text-red-500 font-medium">Error: {error}</p>}
                </div>
            )}

            {/* Single Combined Item Table */}
            <div className="bg-white shadow-xl rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="p-3 text-xs font-semibold tracking-wider text-gray-600 uppercase">ID</th>
                            <th className="p-3 text-xs font-semibold tracking-wider text-gray-600 uppercase">Image</th>
                            <th className="p-3 text-xs font-semibold tracking-wider text-gray-600 uppercase">Title / Type</th>
                            <th className="p-3 text-xs font-semibold tracking-wider text-gray-600 uppercase">Brand</th>
                            <th className="p-3 text-xs font-semibold tracking-wider text-gray-600 uppercase">Price (VND)</th>
                            <th className="p-3 text-xs font-semibold tracking-wider text-gray-600 uppercase">Status</th>
                            <th className="p-3 text-xs font-semibold tracking-wider text-gray-600 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredItems.length === 0 ? (
                            <tr><td colSpan="7" className="p-4 text-center text-gray-500 italic">No items found matching the current filters.</td></tr>
                        ) : (
                            // PASS INDEX HERE to ensure unique React keys
                            filteredItems.map(renderItemRow)
                        )}
                    </tbody>
                </table>
            </div>

            {/* Detail Modal */}
            <DetailModal
                item={selectedItem}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
};

export default ProductModeration;