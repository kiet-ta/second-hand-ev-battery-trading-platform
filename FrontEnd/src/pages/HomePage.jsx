import React, { useEffect, useState } from 'react'
import CardComponent from '../components/Cards/Card';
import '../styles/HomePage.css'
import itemApi from '../api/itemApi';
function HomePage() {
  const [itemList, setItemList] = useState([]);
  const [evList, setEVList] = useState([]);
  const [batteryList, setBatteryList] = useState([]);
  const fetchItems = async () => {
    try {
      const items = await itemApi.getItem();
      const evs = await itemApi.getItemByLatestEV();
      const batterys = await itemApi.getItemByLatestBattery();
      setItemList(items);
      setEVList(evs);
      setBatteryList(batterys);
    } catch (error) {
      console.error("Error fetching items", error);
    }
  };
  useEffect(() => {
    fetchItems();
  }, []);

  const first_sale = itemList.slice(0, 3);
  return (
    <>
      <div className="HomePage w-full m-0 p-0 bg-amber-100y overflow-x-hidden">
        <div className="First-sale flex flex-wrap w-full bg-white  gap-0 p-0 justify-around ">
          <div className="Advertisement grid grid-cols-2 w-1/6 items-center">
            <div className="col-span-2"><img src="https://i.pinimg.com/736x/9f/2b/97/9f2b9783252352925b8bbc1c0f1f2145.jpg" className='w-full h-auto' /></div>
            <div className=""><img src="https://i.pinimg.com/1200x/e9/22/29/e9222949753e671a7e8f7c09725ebed0.jpg" className='w-full h-auto' /></div>
            <div className=""><img src="https://i.pinimg.com/1200x/73/9d/61/739d6130ed4b7c1abf45a429d1e83b0b.jpg" className='w-full h-auto' /></div>
          </div>
          <div className="Products flex w-4/6 justify-center content-center self-center gap-5 p-4 m-0 ">
            {first_sale && first_sale.length > 0 && first_sale.map((item) => (
              <CardComponent
                key={item.itemId}
                title={item.title}
                type={item.itemType}
                price={item.price}
                sales={0}
                image={"https://i.pinimg.com/1200x/55/53/06/55530643312e136a9fa2a576d6fcfbd0.jpg"}
                id={item.itemId}
              />
            ))}
          </div>
        </div>
        <div className="Banner mt-5">
          <img src="https://images4.alphacoders.com/136/thumb-1920-1360814.png"
            className="h-40 w-full object-cover object-[40%_25%]" />
        </div>
        <div className="Car bg-white mt-2 w-full">
          <div className="text-left text-2xl m-4 p-4 font-bold border-b-1">
            Electric Vehicle
          </div>
          <div className="Products flex justify-center content-center self-center gap-4 p-4 m-0 ">
            {evList && evList.length > 0 && evList.map((item) => (
              <CardComponent
                key={item.itemId}
                title={item.title}
                type={item.itemType}
                price={item.price}
                sales={0}
                image={"https://i.pinimg.com/1200x/55/53/06/55530643312e136a9fa2a576d6fcfbd0.jpg"}
                id={item.itemId}
              />
            ))}
          </div>
        </div>
        <div className="Car bg-white mt-2 w-full">
          <div className="text-left text-2xl m-4 p-4 font-bold border-b-1">
            Battery
          </div>
          <div className="Products flex justify-center content-center self-center gap-4 p-4 m-0 ">
            {batteryList && batteryList.length > 0 && batteryList.map((item) => (
              <CardComponent
                key={item.itemId}
                title={item.title}
                type={item.itemType}
                price={item.price}
                sales={0}
                image={"https://i.pinimg.com/1200x/55/53/06/55530643312e136a9fa2a576d6fcfbd0.jpg"}
                id={item.itemId}
              />
            ))}
          </div>
        </div>


      </div>

    </>


  )
}

export default HomePage