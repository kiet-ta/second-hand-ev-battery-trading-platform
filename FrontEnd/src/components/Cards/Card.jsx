import React from 'react'
import { Card } from 'antd'
import { FiShoppingCart } from "react-icons/fi";
import { Link } from 'react-router-dom';
const { Meta } = Card;

function CardComponent({ title, price, sales, image, type, id}) {
  return (
    <Link to={'/' + type + '/' + id} state={id}>
      <div className="border-gray-100 border-3 p-2 m-5 w-80 h-100 hover:border-maincolor hover:w-81 hover:h-101 hover:mt-2 bg-white rounded-lg shadow flex flex-col">
        <div className="overflow-hidden h-4/6 w-full mx-auto bg-gray-400 flex items-center justify-center">
          <img
            className="mx-auto rounded-lg bg-gray-50 object-cover w-full h-full"
            src={image}
            alt={title}
          />
        </div>
        <div className="flex justify-between items-center mt-3 h-1/6">
          <div className="text-lg ml-3 h-full text-left font-bold text-black overflow-hidden w-2/5 ">
            {title}
          </div>
          <div className="w-2/5 text-2xl flex justify-center items-center border-maincolor border-2">
            <button type="button" className=" px-2 py-1 text-1xl flex items-center justify-center text-maincolor">
              <FiShoppingCart className="mr-1" />
              Buy
            </button>
          </div>
        </div>
        {sales && sales > 0 && sales <= 1 ? (
          <div className="flex items-center ml-3 mt-1">
            <p className="text-maincolor text-2xl">${price * (1 - sales)}</p>
            <p className="ml-4 text-gray-500 line-through text-2xl">${price}</p>
          </div>
        ) : (
          <div className="flex items-center ml-3 mt-1">
            <p className="text-maincolor text-2xl">${price}</p>
          </div>
        )}
        <div className="flex items-center ml-3 mt-1">
          <p className="text-gray-500">
            ⭐⭐⭐⭐⭐ (4.5)
          </p>
        </div>
      </div>
    </Link>
  )
}

export default CardComponent