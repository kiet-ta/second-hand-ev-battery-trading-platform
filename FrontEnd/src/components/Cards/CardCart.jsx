import { ChevronDownIcon, MinusIcon, PlusIcon } from "lucide-react";

function CardCart({
  id,
  image,
  title,
  price = 0,
  quantity,
  stock,
  variant,
  onQuantityChange,
  onRemove,
  isSelected,
  onSelect
}) {
  const increaseQuantity = () => {
    onQuantityChange(id, Math.min(quantity + 1, stock));
  };

  const decreaseQuantity = () => {
    onQuantityChange(id, Math.max(1, quantity - 1));
  };

  const totalPrice = (price * quantity).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
  const unitPrice = price.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between w-full bg-white p-4 border-b border-gray-200 last:border-b-0">
      <div className="flex items-center w-full sm:w-2/5 mb-4 sm:mb-0">
        <input
          type="checkbox"
          className="h-4 w-4 text-maincolor border-gray-300 rounded focus:ring-maincolor mr-4"
          checked={isSelected} 
          onChange={onSelect}

        />
        <img
          src={image}
          alt={title}
          className="w-20 h-20 object-cover rounded-md"
        />
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
            <button
              onClick={decreaseQuantity}
              className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded-l-md focus:outline-none"
            >
              <MinusIcon />
            </button>
            <input
              type="text"
              readOnly
              value={quantity}
              className="w-10 text-center border-l border-r border-gray-300 focus:outline-none"
            />
            <button
              onClick={increaseQuantity}
              className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded-r-md focus:outline-none"
            >
              <PlusIcon />
            </button>
          </div>
          {stock > 0 && <p className="text-xs text-gray-500 mt-1">{stock} remain</p>}
        </div>

        <div className="w-1/4 text-center text-maincolor font-semibold">
          {totalPrice}
        </div>

        <div className="w-1/4 flex flex-col items-center">
          <button
            onClick={onRemove}
            className="text-gray-600 hover:text-maincolor transition-colors"
          >
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
