import React from 'react'
import {Card } from 'antd'
import Title from 'antd/es/skeleton/Title'
import { FiShoppingCart } from "react-icons/fi";
import { Link } from 'react-router-dom';
const { Meta } = Card;
function CardComponent({title, price, sales, image}) {
  return (
    <>
    <Link to={`/product/1`}>
          <div class="border-gray-100 border-3 p-2 m-0 w-65 h-80 hover:border-maincolor hover:mt-1" >
        <div class="overflow-hidden h-45 w-45 mx-auto bg-gray-400">
          <img class="mx-auto rounded-lg bg-gray-50"
            src={image} 
            alt={title}
            />
        </div>
        <div class="flex justify-around content-center mt-3" >
          <div class="text-1xl w-32 h-12 text-left content-center flex-none font-semibold text-black overflow-hidden" style={{display: 'block', wordBreak: 'break-word'}}>{title}</div>
          <div class="w-1/4 flex justify-center items-center">
            <button type="button" class="bg-maincolor px-2 py-1 text-sm rounded-full flex items-center justify-center  text-white"><FiShoppingCart className="mr-1"/>Buy</button>
          </div>
        </div>
        {sales && sales > 0 && sales <=1 ?(
          <div class="flex content-center ml-3">
          <p class="text-red-500 text-left">{price*(1-sales)}$</p>
          <p class="ml-4 text-gray-500 line-through te">{price}$</p>
        </div>
        ):
          <div class="flex content-center ml-3">
          <p class="text-red-500 text-left">{price}$</p>
        </div>
      }

        <div class="flex content-center ml-3">
          <p class="text-gray-500 text-left">
            ⭐⭐⭐⭐⭐ (4.5)
          </p>
        </div>
      </div>
</Link>
    </>
  )
}

export default CardComponent