import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, BrowserRouter as Router } from 'react-router-dom';
import itemApi from '../api/itemApi';
import CardComponent from '../components/Cards/Card'

const priceRanges = [
    { label: 'Any Price', value: '--' },
    { label: 'Under 100,000 VND', value: '0-100000' },
    { label: '100,000 - 200,000 VND', value: '100000-200000' },
    { label: '200,000 - 500,000 VND', value: '200000-500000' },
    { label: '500,000 - 1,000,000 VND', value: '500000-1000000' },
    { label: 'Over 1,000,000 VND', value: '1000000-' },
];
function SearchPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [itemList, setItemList] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    // State object to hold all search and filter parameters
    const [filters, setFilters] = useState({
        itemType: searchParams.get("itemType") || '',
        title: searchParams.get("query") || '',
        minPrice: searchParams.get("minPrice") || '',
        maxPrice: searchParams.get("maxPrice") || '',
        sortBy: searchParams.get("sortBy") || 'UpdatedAt',
        sortDir: searchParams.get("sortDir") || 'desc',
        page: parseInt(searchParams.get("page") || '1'),
        pageSize: parseInt(searchParams.get("pageSize") || '20'),
    });

    // Fetches items from the API based on the current filters state
    const fetchItems = useCallback(async () => {
        setIsLoading(true);
        const data = await itemApi.getItemBySearch(
            filters.itemType,
            filters.title,
            filters.minPrice,
            filters.maxPrice,
            filters.page,
            filters.pageSize,
            filters.sortBy,
            filters.sortDir
        );
        setItemList(data.items || []);
        setTotalPages(data.totalPages || 1);
        setIsLoading(false);
    }, [filters]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    // Effect to update the URL whenever filters change
    useEffect(() => {
        const newSearchParams = {
            itemType: filters.itemType,
            query: filters.title,
            page: filters.page.toString(),
            pageSize: filters.pageSize.toString(),
            sortBy: filters.sortBy,
            sortDir: filters.sortDir,
        };
        if (filters.minPrice) newSearchParams.minPrice = filters.minPrice;
        if (filters.maxPrice) newSearchParams.maxPrice = filters.maxPrice;

        setSearchParams(newSearchParams, { replace: true });
    }, [filters, setSearchParams]);

    // Generic handler for sort dropdowns
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prevFilters => ({
            ...prevFilters,
            [name]: value,
            page: 1,
        }));
    };

    // Specific handler for the price range dropdown
    const handlePriceRangeChange = (e) => {
        const { value } = e.target;
        const [min, max] = value.split('-');
        setFilters(prevFilters => ({
            ...prevFilters,
            minPrice: min,
            maxPrice: max || '', // Handle the "Over X" case where max is undefined
            page: 1,
        }));
    };
    
    // Pagination handlers
    const goToNextPage = () => {
        if (filters.page < totalPages) {
            setFilters(prev => ({ ...prev, page: prev.page + 1 }));
        }
    };
    
    const goToPrevPage = () => {
        if (filters.page > 1) {
            setFilters(prev => ({ ...prev, page: prev.page - 1 }));
        }
    };

    // Determine the current value for the price dropdown
    const currentPriceRangeValue = `${filters.minPrice}-${filters.maxPrice || ''}`;

    return (
        <div className='w-full flex mt-2 bg-gray-100 p-4'>
            {/* Filter Sidebar */}
            <div className='w-1/4 xl:w-1/5 m-4 rounded-2xl h-fit bg-white p-4 shadow-md'>
                <div className='text-2xl font-bold p-4 text-left border-b'>Filter</div>
                
                <div className='pt-4 mt-2'>
                    <div className='text-left font-semibold mb-2'>Price Range</div>
                    <select
                        name="priceRange"
                        value={currentPriceRangeValue}
                        onChange={handlePriceRangeChange}
                        className="w-full p-2 border rounded-md bg-white focus:ring-2 focus:ring-blue-500"
                    >
                        {priceRanges.map(range => (
                            <option key={range.label} value={range.value}>
                                {range.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className='pt-4 mt-4 border-t'>
                     <div className='text-left font-semibold mb-2'>Sort By</div>
                     <select 
                        name="sortBy" 
                        value={filters.sortBy} 
                        onChange={handleFilterChange}
                        className="w-full p-2 border rounded-md mb-2 bg-white focus:ring-2 focus:ring-blue-500"
                     >
                        <option value="UpdatedAt">Last Updated</option>
                        <option value="Price">Price</option>
                        <option value="Title">Title</option>
                     </select>
                     <select 
                        name="sortDir" 
                        value={filters.sortDir} 
                        onChange={handleFilterChange}
                        className="w-full p-2 border rounded-md bg-white focus:ring-2 focus:ring-blue-500"
                     >
                        <option value="desc">Descending</option>
                        <option value="asc">Ascending</option>
                     </select>
                </div>
            </div>

            {/* Search Results */}
            <div className='w-3/4 xl:w-4/5 ml-4'>
                <div className='text-2xl font-semibold text-gray-800'>Search result for "{filters.title}"</div>
                <div className='bg-white rounded-2xl mt-2 p-4 gap-4 flex flex-wrap justify-start shadow-md min-h-[400px]'>
                    {isLoading ? (
                        <div className="w-full flex justify-evenly items-center font-semibold text-gray-500">Loading...</div>
                    ) : itemList.length > 0 ? (
                        itemList.map((item) => (
                            <CardComponent 
                                key={item.itemId}
                                id={item.itemId}
                                title={item.title}
                                type={item.itemType}
                                price={item.price}
                                sales={0}
                                image={`https://placehold.co/600x400/EEE/31343C?text=${item.title.replace(/\s/g,'+')}`}
                            />
                        ))
                    ) : (
                        <div className="w-full text-center py-10 text-gray-500">There are no items matching your search.</div>
                    )}
                </div>

                <div className="flex justify-center items-center mt-6 gap-4">
                    <button 
                        onClick={goToPrevPage} 
                        disabled={filters.page <= 1 || isLoading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
                    >
                        Previous
                    </button>
                    <span className="font-semibold text-gray-700">
                        Page {filters.page} of {totalPages}
                    </span>
                    <button 
                        onClick={goToNextPage} 
                        disabled={filters.page >= totalPages || isLoading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    )
}
export default SearchPage
