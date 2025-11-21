import React from 'react';
import { Link } from 'react-router-dom';
import { MinusIcon, PlusIcon, Trash2 } from 'lucide-react';
import PropTypes from "prop-types";


function CardCart({
  id,
  images,
  itemType,
  title,
  price = 0,
  quantity,
  stock,
  onQuantityChange,
  onRemove,
  isSelected,
  onSelect,
  formatVND,
}) {
  const firstImageUrl =
    images?.[0]?.imageUrl || 'https://placehold.co/100x100/e2e8f0/374151?text=?';
  const totalPrice = formatVND(price * quantity);
  const unitPrice = formatVND(price);
  const detailPageUrl = itemType === 'ev' ? `/ev/${id}` : `/battery/${id}`;

  const increaseQuantity = (e) => {
    e.stopPropagation();
    onQuantityChange(id, Math.min(quantity + 1, stock));
  };

  const decreaseQuantity = (e) => {
    e.stopPropagation();
    onQuantityChange(id, Math.max(1, quantity - 1));
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between w-full bg-transparent p-4 border-b border-[#E8E4DC] last:border-b-0 hover:bg-yellow-50/50 transition-colors">
      <div className="flex items-center w-full sm:w-2/5 mb-4 sm:mb-0">
        {/* Checkbox */}
        <input
          type="checkbox"
          className="h-5 w-5 accent-[#D4AF37] border-gray-300 rounded focus:ring-[#D4AF37] mr-4 cursor-pointer"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            onSelect();
          }}
        />

        {/* Clickable area for navigating */}
        <Link
          to={detailPageUrl}
          state={id}
          className="flex items-center w-full hover:opacity-90 transition"
        >
          <img
            src={firstImageUrl}
            alt={title}
            className="w-20 h-20 object-cover rounded-md border border-[#E8E4DC]"
          />
          <div className="ml-4 flex-grow">
            <p className="font-semibold text-[#2C2C2C] break-words line-clamp-2">
              {title}
            </p>
          </div>
        </Link>
      </div>

      <div className="flex items-center justify-between w-full sm:w-[55%]">
        {/* Price */}
        <div className="w-1/4 text-center">
          <span className="text-gray-700">{unitPrice}</span>
        </div>

        {/* Quantity */}
        <div className="w-1/4 flex flex-col items-center">
          <div className="flex items-center border border-[#C4B5A0] rounded-md overflow-hidden">
            <button
              onClick={decreaseQuantity}
              className="px-2 py-1 text-gray-600 hover:bg-[#E8E4DC] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={quantity <= 1}
            >
              <MinusIcon size={16} />
            </button>
            <input
              type="text"
              readOnly
              value={quantity}
              className="w-10 text-center border-l border-r border-[#C4B5A0] focus:outline-none bg-white text-[#2C2C2C]"
            />
            <button
              onClick={increaseQuantity}
              className="px-2 py-1 text-gray-600 hover:bg-[#E8E4DC] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={quantity >= stock}
            >
              <PlusIcon size={16} />
            </button>
          </div>
          {stock > 0 && (
            <p className="text-xs text-gray-500 mt-1">Còn {stock}</p>
          )}
        </div>

        {/* Subtotal */}
        <div className="w-1/4 text-center text-[#B8860B] font-semibold">
          {totalPrice}
        </div>

        {/* Action */}
        <div className="w-1/4 flex justify-center items-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="text-gray-500 hover:text-red-600 transition-colors p-1"
            title="Xóa sản phẩm"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

CardCart.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  images: PropTypes.arrayOf(
    PropTypes.shape({
      imageUrl: PropTypes.string,
    })
  ),
  itemType: PropTypes.oneOf(["ev", "battery"]).isRequired,
  title: PropTypes.string.isRequired,
  price: PropTypes.number,
  quantity: PropTypes.number.isRequired,
  stock: PropTypes.number.isRequired,

  onQuantityChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
  isSelected: PropTypes.bool.isRequired,

  formatVND: PropTypes.func.isRequired,
};


export default CardCart;
