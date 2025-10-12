import { useEffect, useState } from 'react'
import Carousel from '../components/Carousel'
import { useLocation } from 'react-router-dom';
import itemApi from '../api/itemApi';
import { GiGemChain } from "react-icons/gi";


const images = [
  "https://i.pinimg.com/1200x/55/53/06/55530643312e136a9fa2a576d6fcfbd0.jpg",
  "https://i.pinimg.com/736x/b6/96/16/b6961611f87b3433707d937b3f4871b1.jpg",
  "https://i.pinimg.com/1200x/e9/22/29/e9222949753e671a7e8f7c09725ebed0.jpg",
  "https://i.pinimg.com/1200x/73/9d/61/739d6130ed4b7c1abf45a429d1e83b0b.jpg",
  "https://i.pinimg.com/736x/fe/e1/a3/fee1a362132647952f9c8db5923f344c.jpg",
  "https://i.pinimg.com/736x/3c/c2/9e/3cc29ee040980e48089cbc0ec2ef7c2f.jpg",
  "https://i.pinimg.com/736x/d7/97/c6/d797c643ecef1b670452bd52079f5ad3.jpg",
  "https://i.pinimg.com/736x/8d/78/fd/8d78fda3aef2a2db7d21a59909ebb1a9.jpg"
]

const commenter = [
  { name: "Nguyen Van A", picture: "https://i.pinimg.com/736x/5b/3f/09/5b3f09d67f448e39dab9e8d8f3cc3f94.jpg", comment: "Very good product, I love it so much", rating: 5, time: "2023-10-01 10:00", imagefollow: ["https://i.pinimg.com/1200x/55/53/06/55530643312e136a9fa2a576d6fcfbd0.jpg", "https://i.pinimg.com/736x/b6/96/16/b6961611f87b3433707d937b3f4871b1.jpg"] },
  { name: "Tran Thi B", picture: "https://i.pinimg.com/736x/b6/10/ae/b610ae5879e2916e1bb7c4c161754f4d.jpg", comment: "Not bad, but could be better", rating: 3, time: "2023-10-02 12:30", imagefollow: ["https://i.pinimg.com/1200x/e9/22/29/e9222949753e671a7e8f7c09725ebed0.jpg"] },
  { name: "Le Van C", picture: "https://i.pinimg.com/736x/ae/5d/4f/ae5d4f0a3f4e8b9c8e4e4e4e4e4e4e4e.jpg", comment: "I had some issues with the delivery", rating: 2, time: "2023-10-03 14:45", imagefollow: [] }
]
const phone = "0312345678";
const hiddenphone = "Show phone " + phone.slice(0, -4) + "****";
function EVDetails() {
  const [isPhoneVisible, setIsPhoneVisible] = useState(false);
  const location = useLocation();
  const itemId = location.state;
  const [itemSummary, setItemSummary] = useState([])
  const [itemDetails, setItemDetails] = useState([])
  const fetchItems = async () => {
    try {
      const data = await itemApi.getItemDetailByID(itemId);
      setItemSummary(data)
      setItemDetails(data.evDetail);
    } catch (error) {
      console.error("Error fetching items", error);
    }
  };
  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <div className="w-full">
      <div className="grid grid-cols-4 gap-4 p-4 mt-2 w-full">
        <div className="col-span-2 gap-4 ">
          <div className="product bg-white rounded-2xl p-4 flex justify-center">
            <Carousel
              images={images}
              height="h-10 sm:h-20 md:h-100"
              width="w-full max-w-3xl"
            /></div>
          {itemDetails ? (
            <div className="more-info grid gird-flow-col grid-rows-3 gap-2 grid-cols-4 bg-white mt-5 h-4/10 rounded-2xl p-4 m-4">
              <div className='text-gray-400 text-1xl text-left'>Brand :</div>
              <div className='font-bold text-left text-1xl'>{itemDetails.brand}</div>
              <div className='text-gray-400 text-1xl text-left'>Model :</div>
              <div className='font-bold text-left text-1xl'>{itemDetails.model}</div>
              <div className='text-gray-400 text-1xl text-left'>Body Style :</div>
              <div className='font-bold text-left text-1xl'>{itemDetails.bodyStyle}</div>
              <div className='text-gray-400 text-1xl text-left'>Color :</div>
              <div className='font-bold text-left text-1xl'>{itemDetails.color}</div>
              <div className='text-gray-400 text-1xl text-left'>Location :</div>
              <div className='font-bold text-left text-1xl row-span-2'>{itemDetails.licensePlate}</div>
            </div>
          ) : (<div> </div>)}
          <div className="description bg-white rounded-2xl p-4 h-2/5 m-4">
            <div className="header text-left font-bold">Description</div>
            <div className="content p-4 m-4 text-left">
              {itemSummary.description}
            </div>
          </div>
        </div>
        <div className="col-span-2">
          <div className="product-info bg-white rounded-2xl p-4 h-2/3">
            <div className="title h-1/8 text-3xl  text-left content-center flex-none font-semibold text-black overflow-hidden whitespace-pre-wrap" style={{ display: 'block', wordBreak: 'break-word' }}>
              {itemSummary.title}
            </div>
            {itemDetails ? (
              <div className="product-general-info flex h-1/10 text-left gap-4 mt-2 text-2xl text-gray-500 justify-start items-center ">
                <div>{itemDetails.year}</div><div>|</div><div className="">{itemDetails.mileage}km</div>
                {itemDetails.hasAccessories == true ? (<div className="bg-maincolor-darker rounded-2xl flex content-center text-center text-2xl font-bold text-white justify-center items-center p-5"><GiGemChain/> Has Accessory</div>): (<div></div>)}
              </div>
            ) : (
              <div> loading... </div>
            )}
            <div className="price-tag flex h-1/10 text-left mt-2 bg-gray-50">
              <div className='ml-4 text-2xl font-bold text-red-500 content-center' >${itemSummary.price}</div>
              <div className="ml-5 text-2xl text-gray-300 line-through content-center"></div>
            </div>
            <div className="phone-number flex gap-4 h-1/10 mt-4">
              <div className="bg-gray-200 w-1/4 rounded-2xl font-bold text-1xl content-center text-center ">Chat</div>
              <div className="bg-gray-200 w-2/4 rounded-2xl font-bold text-1xl content-center text-center">
                <button onClick={() => setIsPhoneVisible(!isPhoneVisible)}>
                  <span>{isPhoneVisible ? phone : hiddenphone}</span>
                </button>
              </div>
            </div>
            <div className="seller-profile h-3/10 mt-10 flex justify-around content-center items-center border-t-2 border-gray-200 pt-4 ">
              <div className="left w-1/2 h-full object-fit flex items-center">
                <div className="w-2/8 h-2/4 rounded-full overflow-hidden">
                  <img className="object-cover w-full h-full" src="https://i.pinimg.com/736x/b6/10/ae/b610ae5879e2916e1bb7c4c161754f4d.jpg" />
                </div>
                <div className="seller-name w-2/4">
                  <div className="text-1xl font-bold ml-4">Seller Name</div>
                  <div className="text-1xl ml-4 text-gray-500">Active 5 minutes ago</div>
                </div>
              </div>
              <div className="right w-1/2 h-full flex items-center">
                <div className="seller-rating w-2/4">
                  <div className="text-1xl font-bold ml-4">Seller Rating</div>
                  <div className="text-1xl ml-4 text-gray-500">⭐⭐⭐⭐⭐ (4.5)</div>
                </div>
                <div className="seller-other-listing w-2/4 items-center">
                  <div className="text-1xl font-bold ml-4">Other Listings</div>
                  <div className="text-1xl ml-4 text-gray-500">10 Listings</div>
                </div>
              </div>
            </div>
          </div>
          <div className="comment bg-white rounded-2xl p-4 h-2.5/4 mt-5">
            <div className="header text-left font-bold">Comment</div>
            <div>
              {commenter && commenter.length > 0 ? (
                commenter.map((item, index) => (
                  <div key={index} className="comment-item mt-4 border-b-2 pb-4 border-gray-200">
                    <div className='flex items-center mb-2 w-3/4 h-10'>
                      <div className="left w-full h-full object-fit flex ">
                        <div className="w-1/12 rounded-full overflow-hidden">
                          <img className="object-cover w-full h-full" src="https://i.pinimg.com/736x/b6/10/ae/b610ae5879e2916e1bb7c4c161754f4d.jpg" />
                        </div>
                        <div className="seller-name w-5/6">
                          <div className="text-1xl text-left font-bold ml-4 flex">
                            <div className="text-1xl">{item.name}</div>
                            <div className="text-1xl ml-2 text-left text-gray-500">{item.time}</div>
                          </div>
                          <div className="text-1xl ml-4 text-left text-gray-500">
                            {
                              item.rating && item.rating > 0 ? (
                                Array.from({ length: item.rating }).map((_, i) => (
                                  <span key={i}>⭐</span>
                                ))
                              ) : (
                                <span>No rating</span>
                              )
                            }

                          </div>
                        </div>
                      </div>

                    </div>
                    <div className='text-left'>{item.comment}</div>
                    <div className='flex w-20'>{
                      item.imagefollow && item.imagefollow.length > 0 ? (
                        item.imagefollow.map((img, idx) => (
                          <img key={idx} src={img} className="w-full h-full object-contain mr-4 bg-white " />
                        ))) : (<div></div>)
                    }</div>
                  </div>
                ))
              ) : (
                <div>No comments available.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EVDetails