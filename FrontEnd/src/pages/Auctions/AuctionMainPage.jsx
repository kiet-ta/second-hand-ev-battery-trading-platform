import React, { useEffect, useState } from 'react'
import { CarAuctionCard } from '../../components/Cards/CardBidding'
import auctionApi from '../../api/auctionApi';

function AuctionMainPage() {
  const tenHoursFromNow = new Date().getTime() + (10 * 60 * 60 * 1000);
  const [items, setItems] = useState(null);
  const fetchItem = async () => {
    try{
      const api = await auctionApi.getAuction();
      setItems(api.data)
    } catch (error) {
      console.error("Error fetching items", error);
    }
  }
  useEffect(() => {
    fetchItem()
  },[])
  const cadillacData = {
    id: 1,
    title: '2025 Cadillac CT5-V Blackwing',
    specs: '6-Speed Manual, 668-hp Supercharged V8, Carbon Fiber 1 and Parking Packages',
    currentBid: '$95,000',
    isFeatured: true,
    endTime: tenHoursFromNow,
    imageUrls: [
      "https://i.pinimg.com/736x/7e/25/87/7e25878ef1347c76ac7c91a7dbcd272e.jpg",
      "https://i.pinimg.com/736x/2d/3b/59/2d3b5906fa1a842a9a202ca55552f772.jpg",
      "https://i.pinimg.com/474x/03/02/67/030267ef4dfff52f79940b3ff316614c.jpg"
    ]
  };
  return (
    <div className="grid grid-cols-8 gap-4 bg-white">
        <div className="col-span-1">
          <img src="https://images8.alphacoders.com/134/1347431.jpeg" className="h-full w-full object-cover object-center"></img>
        </div>
        <div className="col-span-6 flex gap-4 flex-wrap justify-evenly mt-5">
          {items && items.length > 0 && items.map((item) => (
            <div>
            <CarAuctionCard isFeatured={false} key={item.auctionId} id={item.itemId} title={item.title} brand={item.brand} category={item.category} imageUrls={[item.imageUrl,"https://i.pinimg.com/736x/7e/25/87/7e25878ef1347c76ac7c91a7dbcd272e.jpg"]} endTime={new Date(item.endTime).getTime()} currentBid={`${item.currentPrice}VND`}/>
            </div>
          ))}
        </div>
        <div className="col-span-1">
          <img src="https://images8.alphacoders.com/134/1347431.jpeg" className="h-full w-full object-cover object-center"></img>
        </div>
    </div>
  )
}

export default AuctionMainPage