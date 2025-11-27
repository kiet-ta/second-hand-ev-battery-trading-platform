import React, { useEffect, useState } from "react";
import CarAuctionCard from "../../components/Cards/CardBidding";
import auctionApi from "../../api/auctionApi";
import PropTypes from "prop-types";


function AuctionMainPage() {
  const [items, setItems] = useState([]);

  const fetchItems = async () => {
    try {
      const response = await auctionApi.getAuction();
      console.log(response)
      const normalized = response.data.filter(i => i.status != "Ended").sort(a => a.createdAt).map((item) => {
        return {
          ...item,
          category: item.type === "Ev" ? "Xe điện" : "Pin xe điện",
          currentBid: item.currentPrice || 0,
        };
      });

      setItems(normalized);
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <div className="bg-[#FAF8F3] min-h-screen py-10 px-6">
      <h1 className="text-4xl font-extrabold text-center mb-8 font-roboto text-[#B8860B]">
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

      {/* Auction Cards */}
      <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {items.length > 0 ? (
          items.map((item) => (
            <CarAuctionCard
              key={item.auctionId}
              auctionID={item.auctionId}
              id={item.itemId}
              title={item.title}
              category={item.category}
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
CarAuctionCard.propTypes = {
  auctionID: PropTypes.number.isRequired,
  id: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  category: PropTypes.string.isRequired,
  currentBid: PropTypes.number,
  startingPrice: PropTypes.number,
  startTime: PropTypes.string,
  endTime: PropTypes.string,
  status: PropTypes.string,
  imageUrls: PropTypes.arrayOf(
    PropTypes.shape({
      imageUrl: PropTypes.string,
    })
  ),

  className: PropTypes.string,
};


export default AuctionMainPage;
