import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import itemApi from '../api/itemApi';
import CardComponent from '../components/Cards/Card';
import CardSkeleton from '../components/Cards/CardSkeleton'; // Import Skeleton
import { Spin } from 'antd'; // Use Spin for loading indicator

const priceRanges = [
    { label: 'Mọi mức giá', value: '-' }, // Vietnamese
    { label: 'Dưới 100.000 đ', value: '0-100000' }, // Vietnamese
    { label: '100.000 - 200.000 đ', value: '100000-200000' }, // Vietnamese
    { label: '200.000 - 500.000 đ', value: '200000-500000' }, // Vietnamese
    { label: '500.000 - 1.000.000 đ', value: '500000-1000000' }, // Vietnamese
    { label: 'Trên 1.000.000 đ', value: '1000000-' }, // Vietnamese
];

function SearchPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [itemList, setItemList] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    const [filters, setFilters] = useState({
        itemType: searchParams.get("itemType") || '',
        title: searchParams.get("query") || '',
        minPrice: searchParams.get("minPrice") || '',
        maxPrice: searchParams.get("maxPrice") || '',
        sortBy: searchParams.get("sortBy") || 'UpdatedAt',
        sortDir: searchParams.get("sortDir") || 'desc',
        page: parseInt(searchParams.get("page") || '1'),
        pageSize: parseInt(searchParams.get("pageSize") || '12'), // Adjusted page size for grid
    });

    const fetchItems = useCallback(async () => {
        setIsLoading(true);
        try { // Added try...catch
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
        } catch (error) {
            console.error("Lỗi khi tải sản phẩm:", error);
            setItemList([]); // Clear items on error
            setTotalPages(1);
        } finally {
            setIsLoading(false);
        }
    }, [filters]); // Dependency array is correct

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    useEffect(() => {
        const newSearchParams = {
            // Only add params if they have a value
            ...(filters.itemType && { itemType: filters.itemType }),
            ...(filters.title && { query: filters.title }),
            ...(filters.minPrice && { minPrice: filters.minPrice }),
            ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
            page: filters.page.toString(),
            pageSize: filters.pageSize.toString(),
            sortBy: filters.sortBy,
            sortDir: filters.sortDir,
        };

        setSearchParams(newSearchParams, { replace: true });
    }, [filters, setSearchParams]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prevFilters => ({
            ...prevFilters,
            [name]: value,
            page: 1, // Reset page number on filter change
        }));
    };

    const handlePriceRangeChange = (e) => {
        const { value } = e.target;
        const [min, max] = value.split('-');
        setFilters(prevFilters => ({
            ...prevFilters,
            minPrice: min === '' ? '' : min, // Handle 'Any Price'
            maxPrice: max === undefined ? '' : max, // Handle 'Over X' and 'Any Price'
            page: 1,
        }));
    };

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

    // Calculate current value for price dropdown, handling empty min/max
    const currentPriceRangeValue = filters.minPrice === '' && filters.maxPrice === '' ? '-' : `${filters.minPrice}-${filters.maxPrice}`;

    // Theme colors
    const bgColor = 'bg-[#FAF8F3]';
    const textColor = 'text-[#2C2C2C]';
    const secondaryTextColor = 'text-gray-600';
    const accentColor = 'text-[#B8860B]';
    const accentHoverColor = 'hover:text-[#D4AF37]';
    const borderColor = 'border-[#C4B5A0]';
    const lightBorderColor = 'border-[#E8E4DC]';
    const buttonBgColor = 'bg-[#D4AF37]';
    const buttonHoverBgColor = 'hover:bg-[#B8860B]';
    const buttonDisabledBgColor = 'disabled:bg-[#E8E4DC]';
    const buttonDisabledTextColor = 'disabled:text-gray-500';
    const cardBgColor = 'bg-white'; // Use white for cards/filter for contrast

    return (
        <div className={`w-full flex mt-2 ${bgColor} p-4 min-h-screen`}>
            {/* Filter Sidebar */}
            <aside className={`w-1/4 xl:w-1/5 m-4 rounded-lg h-fit ${cardBgColor} p-6 shadow-lg ${lightBorderColor} border`}>
                <h2 className={`text-2xl font-bold font-serif pb-4 text-left ${borderColor} border-b ${accentColor}`}>Bộ Lọc</h2>

                <div className='pt-6'>
                    <label htmlFor="priceRange" className={`block text-left font-semibold mb-2 ${textColor}`}>Khoảng Giá</label>
                    <select
                        id="priceRange"
                        name="priceRange"
                        value={currentPriceRangeValue}
                        onChange={handlePriceRangeChange}
                        className={`w-full p-3 ${lightBorderColor} border rounded-md ${cardBgColor} focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] ${textColor}`}
                    >
                        {priceRanges.map(range => (
                            <option key={range.value} value={range.value}>
                                {range.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={`pt-6 mt-6 ${borderColor} border-t`}>
                    <label htmlFor="sortBy" className={`block text-left font-semibold mb-2 ${textColor}`}>Sắp Xếp Theo</label>
                    <select
                        id="sortBy"
                        name="sortBy"
                        value={filters.sortBy}
                        onChange={handleFilterChange}
                        className={`w-full p-3 ${lightBorderColor} border rounded-md mb-3 ${cardBgColor} focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] ${textColor}`}
                    >
                        <option value="UpdatedAt">Mới nhất</option> {/* Vietnamese */}
                        <option value="Price">Giá</option>           {/* Vietnamese */}
                        <option value="Title">Tên</option>           {/* Vietnamese */}
                    </select>
                    <label htmlFor="sortDir" className="sr-only">Thứ tự sắp xếp</label>
                    <select
                        id="sortDir"
                        name="sortDir"
                        value={filters.sortDir}
                        onChange={handleFilterChange}
                        className={`w-full p-3 ${lightBorderColor} border rounded-md ${cardBgColor} focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] ${textColor}`}
                    >
                        <option value="desc">Giảm dần</option> {/* Vietnamese */}
                        <option value="asc">Tăng dần</option>  {/* Vietnamese */}
                    </select>
                </div>
            </aside>

            {/* Search Results */}
            <section className='w-3/4 xl:w-4/5 ml-4'>
                <h1 className={`text-2xl font-semibold ${textColor} mb-4`}>Kết quả tìm kiếm cho "{filters.title}"</h1>
                <div className={` ${cardBgColor} rounded-lg shadow-lg p-6 border ${lightBorderColor}`}>
                    {isLoading ? (
                        <div className="w-full flex justify-center items-center h-96">
                            <Spin size="large" />
                        </div>
                    ) : itemList.length > 0 ? (
                        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 justify-items-center'>
                            {itemList.map((item) => (
                                <CardComponent
                                    key={item.itemId}
                                    id={item.itemId}
                                    title={item.title}
                                    type={item.itemType}
                                    price={item.price}
                                    itemImages={item.images}
                                    year={item.itemDetail?.year} // Pass year and mileage if available
                                    mileage={item.itemDetail?.mileage}
                                    isVerified={item.moderation === 'approved_tag'} // Pass verification status
                                // Add userFavorites and onFavoriteChange if needed here
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="w-full text-center py-20 text-gray-500">
                            Không tìm thấy sản phẩm nào phù hợp. {/* Vietnamese */}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {itemList.length > 0 && totalPages > 1 && (
                    <div className="flex justify-center items-center mt-8 gap-4">
                        <button
                            onClick={goToPrevPage}
                            disabled={filters.page <= 1 || isLoading}
                            className={`px-5 py-2 ${buttonBgColor} ${textColor} font-semibold rounded-md ${buttonDisabledBgColor} ${buttonDisabledTextColor} disabled:cursor-not-allowed ${buttonHoverBgColor} transition-colors`}
                        >
                            Trước {/* Vietnamese */}
                        </button>
                        <span className={`font-semibold ${secondaryTextColor}`}>
                            Trang {filters.page} / {totalPages} {/* Vietnamese */}
                        </span>
                        <button
                            onClick={goToNextPage}
                            disabled={filters.page >= totalPages || isLoading}
                            className={`px-5 py-2 ${buttonBgColor} ${textColor} font-semibold rounded-md ${buttonDisabledBgColor} ${buttonDisabledTextColor} disabled:cursor-not-allowed ${buttonHoverBgColor} transition-colors`}
                        >
                            Sau {/* Vietnamese */}
                        </button>
                    </div>
                )}
            </section>
        </div>
    )
}
export default SearchPage;