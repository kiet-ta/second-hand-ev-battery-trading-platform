import { ChevronDownIcon, MinusIcon, PlusIcon } from 'lucide-react';
import {useState} from 'react'

function CardCart({ image, title, price = 0, initialQuantity = 1, stock, variant, onRemove }) {
  const [quantity, setQuantity] = useState(initialQuantity);
  // Function to handle increasing quantity
  const increaseQuantity = () => {
    setQuantity(prev => Math.min(prev + 1, stock)); // Do not exceed stock
  };

  // Function to handle decreasing quantity
  const decreaseQuantity = () => {
    setQuantity(prev => Math.max(1, prev - 1)); // Quantity cannot be less than 1
  };

  // Calculate the total price for the item
const totalPrice = (price * quantity).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  const unitPrice = price.toLocaleString('en-US', { style: 'currency', 'currency': 'USD' });


  return (
    <div className="flex flex-col sm:flex-row items-center justify-between w-full bg-white p-4 border-b border-gray-200 last:border-b-0">
      <div className="flex items-center w-full sm:w-2/5 mb-4 sm:mb-0">
        <input type="checkbox" className="h-4 w-4 text-maincolor border-gray-300 rounded focus:ring-maincolor mr-4" />
        <img src={image} alt={title} className="w-20 h-20 object-cover rounded-md" />
        <div className="ml-4 flex-grow">
          <p className="font-semibold text-gray-800 break-words">{title}</p>
          <div className="text-sm text-gray-500 mt-1 p-1 bg-gray-50 rounded-md border border-gray-200 inline-flex items-center cursor-pointer">
            <span>Category: {variant}</span>
            <ChevronDownIcon className="ml-1" />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between w-full sm:w-3/5">
        <div className="w-1/4 text-center">
          <span className="text-gray-700">{unitPrice}</span>
        </div>

        <div className="w-1/4 flex flex-col items-center">
            <div className="flex items-center border border-gray-300 rounded-md">
                <button onClick={decreaseQuantity} className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded-l-md focus:outline-none">
                    <MinusIcon />
                </button>
                <input
                    type="text"
                    readOnly
                    value={quantity}
                    className="w-10 text-center border-l border-r border-gray-300 focus:outline-none"
                />
                <button onClick={increaseQuantity} className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded-r-md focus:outline-none">
                    <PlusIcon />
                </button>
            </div>
            {stock > 0 && <p className="text-xs text-gray-500 mt-1">{stock} remain</p>}
        </div>


        <div className="w-1/4 text-center text-maincolor font-semibold">
          {totalPrice}
        </div>

        <div className="w-1/4 flex flex-col items-center">
            <button onClick={onRemove} className="text-gray-600 hover:text-maincolor transition-colors">
                Delete
            </button>
            <div className="text-sm text-maincolor mt-1 flex items-center cursor-pointer">
                <span>Similar products</span>
                <ChevronDownIcon className="ml-1" />
            </div>
        </div>
      </div>
    </div>
  );
}
export default CardCart;