import React, { useState } from 'react'
import Carousel from '../components/Carousel'
const images=[
    "https://i.pinimg.com/1200x/55/53/06/55530643312e136a9fa2a576d6fcfbd0.jpg",
    "https://i.pinimg.com/736x/b6/96/16/b6961611f87b3433707d937b3f4871b1.jpg",
    "https://i.pinimg.com/1200x/e9/22/29/e9222949753e671a7e8f7c09725ebed0.jpg",
    "https://i.pinimg.com/1200x/73/9d/61/739d6130ed4b7c1abf45a429d1e83b0b.jpg",
    "https://i.pinimg.com/736x/fe/e1/a3/fee1a362132647952f9c8db5923f344c.jpg",
    "https://i.pinimg.com/736x/3c/c2/9e/3cc29ee040980e48089cbc0ec2ef7c2f.jpg",
    "https://i.pinimg.com/736x/d7/97/c6/d797c643ecef1b670452bd52079f5ad3.jpg",
    "https://i.pinimg.com/736x/8d/78/fd/8d78fda3aef2a2db7d21a59909ebb1a9.jpg"
]
const phone = "0312345678";
const hiddenphone = "Show phone " + phone.slice(0, -4) + "****";
function EVDetails() {
  const [isPhoneVisible, setIsPhoneVisible] = useState(false);
  return (
    <div className="grid grid-cols-4 gap-4 p-4 m-4 mt-32">
        <div className="col-span-2 gap-4">
              <Carousel
        images={images}
        height="h-10 sm:h-20 md:h-100"
        width="w-full max-w-3xl"
      />
        </div>
        <div className="col-span-2 bg-white rounded-2xl  h-7/8 p-4">
            <div>

            </div>
        <div className="h-2/10 text-3xl  text-left content-center flex-none font-semibold text-black overflow-hidden whitespace-pre-wrap" style={{display: 'block', wordBreak: 'break-word'}}>
        Text Very Longggggggggggggggggggggggggggggggggggggggggggggggggg
        </div>
        <div className="flex h-1/10 text-left mt-2 text-1xl text-gray-500">
            <div>1910 |</div><div>| 20000 km</div>
        </div>
        <div className="flex h-1/10 text-left mt-2">
            <div className=' text-2xl font-bold text-red-500' >1000$</div>
            <div className="ml-4 text-2xl text-gray-300 line-through te">100000$</div>
        </div>
        <div className="flex gap-4 h-2/10 mt-4">
            <div className="bg-gray-200 w-1/4 rounded-2xl font-bold text-2xl content-center ">Chat</div>
            <div className="bg-gray-200 w-2/4 rounded-2xl font-bold text-2xl content-center">
              <button onClick={() => setIsPhoneVisible(!isPhoneVisible)}>
                <span>{isPhoneVisible ? phone : hiddenphone}</span>
              </button>
            </div>
        </div>
        <div className="seller-profile h-2/10 mt-4 flex justify-around ">
          <div className="left w-1/2 h-full object-fit flex ">
            <div className="w-1/4 rounded-full overflow-hidden">
            <img className="object-cover w-full h-full"src="https://i.pinimg.com/736x/b6/10/ae/b610ae5879e2916e1bb7c4c161754f4d.jpg"/>
            </div>
            <div className="seller-name w-2/4">
              <div className="text-1xl font-bold ml-4">Seller Name</div>
              <div className="text-1xl ml-4 text-gray-500">Active 5 minutes ago</div>
            </div>
          </div>
          <div className="right w-1/2 h-full flex">
            <div className="seller-rating w-2/4">
                          <div className="text-1xl font-bold ml-4">Seller Rating</div>
            <div className="text-1xl ml-4 text-gray-500">⭐⭐⭐⭐⭐ (4.5)</div>
            </div>
            <div className="seller-other-listing w-2/4">
                          <div className="text-1xl font-bold ml-4">Other Listings</div>
            <div className="text-1xl ml-4 text-gray-500">10 Listings</div>
            </div>
          </div>
          </div>
    </div>
    </div>
  )
}

export default EVDetails