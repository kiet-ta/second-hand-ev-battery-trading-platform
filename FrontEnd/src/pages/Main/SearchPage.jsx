import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import itemApi from '../../api/itemApi';
import CardComponent from '../../components/Cards/Card';
import { Spin } from 'antd';

const electricCarPriceRanges = [
  { label: 'Dưới 50.000.000 đ', value: '0-50000000' },
  { label: '50.000.000 - 500.000.000 đ', value: '50000000-500000000' },
  { label: '500.000.000 - 2.000.000.000 đ', value: '500000000-2000000000' },
  { label: 'Trên 2.000.000.000 đ', value: '2000000000-' },
];

const batteryPriceRanges = [
  { label: 'Dưới 1.000.000 đ', value: '0-1000000' },
  { label: '1.000.000 - 10.000.000 đ', value: '1000000-10000000' },
  { label: '10.000.000 - 50.000.000 đ', value: '10000000-50000000' },
  { label: 'Trên 50.000.000 đ', value: '50000000-' },
];

function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [itemList, setItemList] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [filters, setFilters] = useState({
    itemType: searchParams.get("itemType") || '', // '' means all
    title: searchParams.get("query") || '',
    minPrice: searchParams.get("minPrice") || '',
    maxPrice: searchParams.get("maxPrice") || '',
    sortBy: searchParams.get("sortBy") || 'UpdatedAt',
    sortDir: searchParams.get("sortDir") || 'desc',
    page: parseInt(searchParams.get("page") || '1'),
    pageSize: parseInt(searchParams.get("pageSize") || '12'),
    approvedOnly: searchParams.get("approvedOnly") === 'true', // checkbox
    sellerName: searchParams.get("sellerName") || '',
  });

  // Combine price ranges if itemType is all
  const priceOptions = filters.itemType === 'EV'
    ? electricCarPriceRanges
    : filters.itemType === 'Battery'
      ? batteryPriceRanges
      : [
          ...electricCarPriceRanges,
          ...batteryPriceRanges
        ].reduce((acc, range) => {
          // Avoid duplicate labels
          if (!acc.find(r => r.label === range.label)) acc.push(range);
          return acc;
        }, []);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await itemApi.getItemBySearch(
        filters.itemType === '' ? null : filters.itemType,
        filters.title,
        filters.minPrice,
        filters.maxPrice,
        filters.page,
        filters.pageSize,
        filters.sortBy,
        filters.sortDir
      );

      // Filter client-side for approvedOnly & sellerName
      const filteredItems = (data.items || []).filter(item => {
        const moderationMatch = filters.approvedOnly ? item.moderation === 'approved_tag' : true;
        const sellerMatch = filters.sellerName
          ? item.sellerName.toLowerCase().includes(filters.sellerName.toLowerCase())
          : true;
        return moderationMatch && sellerMatch;
      });

      setItemList(filteredItems);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error("Lỗi khi tải sản phẩm:", error);
      setItemList([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  useEffect(() => {
    const newSearchParams = {
      ...(filters.itemType && { itemType: filters.itemType }),
      ...(filters.title && { query: filters.title }),
      ...(filters.minPrice && { minPrice: filters.minPrice }),
      ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
      ...(filters.approvedOnly && { approvedOnly: 'true' }),
      ...(filters.sellerName && { sellerName: filters.sellerName }),
      page: filters.page.toString(),
      pageSize: filters.pageSize.toString(),
      sortBy: filters.sortBy,
      sortDir: filters.sortDir,
    };
    setSearchParams(newSearchParams, { replace: true });
  }, [filters, setSearchParams]);

  const handleFilterChange = e => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const handlePriceRangeChange = e => {
    const [min, max] = e.target.value.split('-');
    setFilters(prev => ({
      ...prev,
      minPrice: min === '' ? '' : min,
      maxPrice: max === undefined ? '' : max,
      page: 1,
    }));
  };

  const handleApprovedCheckbox = e => {
    setFilters(prev => ({ ...prev, approvedOnly: e.target.checked, page: 1 }));
  };

  const goToNextPage = () => { if (filters.page < totalPages) setFilters(prev => ({ ...prev, page: prev.page + 1 })); };
  const goToPrevPage = () => { if (filters.page > 1) setFilters(prev => ({ ...prev, page: prev.page - 1 })); };

  const currentPriceRangeValue = filters.minPrice === '' && filters.maxPrice === '' ? '-' : `${filters.minPrice}-${filters.maxPrice}`;

  return (
    <div className='w-full flex mt-2 bg-[#FAF8F3] p-4 min-h-screen'>
      {/* Sidebar */}
      <aside className='w-1/4 xl:w-1/5 m-4 rounded-lg bg-white p-6 shadow-lg border border-[#E8E4DC]'>
        <h2 className='text-2xl font-bold font-serif pb-4 border-b text-[#B8860B]'>Bộ Lọc</h2>

        {/* Price */}
        <div className='pt-6'>
          <label className='block font-semibold mb-2'>Khoảng Giá</label>
          <select
            name="priceRange"
            value={currentPriceRangeValue}
            onChange={handlePriceRangeChange}
            className='w-full p-3 border rounded-md focus:ring-2 focus:ring-[#D4AF37]'
          >
            <option value='-'>Mọi mức giá</option>
            {priceOptions.map(range => (
              <option key={range.value} value={range.value}>{range.label}</option>
            ))}
          </select>
        </div>

        {/* Moderation checkbox */}
        <div className='pt-6'>
          <label className='inline-flex items-center'>
            <input
              type='checkbox'
              checked={filters.approvedOnly}
              onChange={handleApprovedCheckbox}
              className='mr-2'
            />
            Sản phẩm đã duyệt
          </label>
        </div>

        {/* Seller Name */}
        <div className='pt-6'>
          <label className='block font-semibold mb-2'>Người bán</label>
          <input
            type="text"
            name="sellerName"
            value={filters.sellerName}
            onChange={handleFilterChange}
            placeholder="Tìm theo tên người bán"
            className='w-full p-3 border rounded-md focus:ring-2 focus:ring-[#D4AF37]'
          />
        </div>

        {/* Sorting */}
        <div className='pt-6 mt-6 border-t border-[#C4B5A0]'>
          <label className='block font-semibold mb-2'>Sắp Xếp Theo</label>
          <select
            name="sortBy"
            value={filters.sortBy}
            onChange={handleFilterChange}
            className='w-full p-3 border rounded-md mb-3 focus:ring-2 focus:ring-[#D4AF37]'
          >
            <option value="UpdatedAt">Mới nhất</option>
            <option value="Price">Giá</option>
            <option value="Title">Tên</option>
          </select>
          <select
            name="sortDir"
            value={filters.sortDir}
            onChange={handleFilterChange}
            className='w-full p-3 border rounded-md focus:ring-2 focus:ring-[#D4AF37]'
          >
            <option value="desc">Giảm dần</option>
            <option value="asc">Tăng dần</option>
          </select>
        </div>
      </aside>

      {/* Search Results */}
      <section className='w-3/4 xl:w-4/5 ml-4'>
        <h1 className='text-2xl font-semibold text-[#2C2C2C] mb-4'>Kết quả tìm kiếm cho "{filters.title}"</h1>
        <div className='bg-white rounded-lg shadow-lg p-6 border border-[#E8E4DC]'>
          {isLoading ? (
            <div className="w-full flex justify-center items-center h-96"><Spin size="large" /></div>
          ) : itemList.length > 0 ? (
            <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 justify-items-center'>
              {itemList.filter(i => i.status == "active").map(item => (
                <CardComponent
                  key={item.itemId}
                  id={item.itemId}
                  title={item.title}
                  type={item.itemType}
                  price={item.price}
                  itemImages={item.images}
                  year={item.itemDetail?.year}
                  mileage={item.itemDetail?.mileage}
                  isVerified={item.moderation === 'approved_tag'}
                />
              ))}
            </div>
          ) : (
            <div className="w-full text-center py-20 text-gray-500">Không tìm thấy sản phẩm nào phù hợp.</div>
          )}
        </div>

        {/* Pagination */}
        {itemList.length > 0 && totalPages > 1 && (
          <div className="flex justify-center items-center mt-8 gap-4">
            <button
              onClick={() => filters.page > 1 && setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={filters.page <= 1 || isLoading}
              className='px-5 py-2 bg-[#D4AF37] text-[#2C2C2C] font-semibold rounded-md disabled:bg-[#E8E4DC] disabled:text-gray-500 hover:bg-[#B8860B]'
            >
              Trước
            </button>
            <span className='font-semibold text-gray-600'>Trang {filters.page} / {totalPages}</span>
            <button
              onClick={() => filters.page < totalPages && setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={filters.page >= totalPages || isLoading}
              className='px-5 py-2 bg-[#D4AF37] text-[#2C2C2C] font-semibold rounded-md disabled:bg-[#E8E4DC] disabled:text-gray-500 hover:bg-[#B8860B]'
            >
              Sau
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

export default SearchPage;
