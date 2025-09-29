import React from 'react'
import { Card } from 'antd'
import { FiShoppingCart } from "react-icons/fi";
import { Link } from 'react-router-dom';
const { Meta } = Card;

function CardComponent({ title, price, sales, image, type, id}) {
  return (
    <Link to={'/' + type + '/' + id} state={id}>
      <div className="border-gray-100 border-3 p-2 m-0 w-64 h-80 hover:border-maincolor hover:mt-1 bg-white rounded-lg shadow flex flex-col">
        <div className="overflow-hidden h-40 w-40 mx-auto bg-gray-400 flex items-center justify-center">
          <img
            className="mx-auto rounded-lg bg-gray-50 object-cover w-full h-full"
            src={image}
            alt={title}
          />
        </div>
        <div className="flex justify-between items-center mt-3">
          <div
            className="text-base w-32 h-12 ml-3 text-left font-semibold text-black overflow-hidden"
            style={{
              display: 'block',
              wordBreak: 'break-word',
              overflowY: 'auto',
              lineHeight: '1.2',
            }}
          >
            {title}
          </div>
          <div className="w-1/4 flex justify-center items-center">
            <button
              type="button"
              className="bg-maincolor px-2 py-1 text-xs rounded-full flex items-center justify-center text-white"
            >
              <FiShoppingCart className="mr-1" />
              Buy
            </button>
          </div>
        </div>
        {sales && sales > 0 && sales <= 1 ? (
          <div className="flex items-center ml-3 mt-1">
            <p className="text-maincolor">${price * (1 - sales)}</p>
            <p className="ml-4 text-gray-500 line-through">${price}</p>
          </div>
        ) : (
          <div className="flex items-center ml-3 mt-1">
            <p className="text-maincolor">${price}</p>
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