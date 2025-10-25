import React, { useEffect, useState } from "react";
import CarAuctionCard from "../../components/Cards/CardBidding";
import auctionApi from "../../api/auctionApi";

function AuctionMainPage() {
  const [items, setItems] = useState([]);

  const fetchItems = async () => {
    try {
      const response = await auctionApi.getAuction();
      setItems(response.data);
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <div className="bg-[#FAF8F3] min-h-screen py-10 px-6">
      <h1 className="text-4xl font-extrabold text-center mb-8 font-serif text-[#B8860B]">
        Phiên Đấu Giá Xe
      </h1>

      {/* Top Advertisement */}
      <div className="max-w-6xl mx-auto mb-10 overflow-hidden rounded-2xl shadow-md border border-[#E8E4DC]">
        <img
          src="https://res.cloudinary.com/cocmuaxe/image/upload/v1761249286/auction3_w2tbnj.png"
          alt="Advertisement"
          className="w-full h-48 object-cover scale-[0.9] hover:scale-100 transform origin-center transition-transform duration-700 ease-in-out"
        />
      </div>


      <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {items.length > 0 ? (
          items.map((item) => (
            <CarAuctionCard
              key={item.itemId}
              auctionID={item.auctionId}
              id={item.itemId}
              title={item.title}
              category={item.category}
              brand={item.brand}
              currentBid={item.currentBid}
              startingPrice={item.startingPrice}
              startTime={item.startTime}
              endTime={item.endTime}
              status={item.status}
              imageUrls={item.images}
            />
          ))
        ) : (
          <p className="col-span-full text-center text-gray-600">
            Hiện chưa có phiên đấu giá nào.
          </p>
        )}
      </div>


    </div>
  );
}

export default AuctionMainPage;
