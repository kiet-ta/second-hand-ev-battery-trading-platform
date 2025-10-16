import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { InputNumber, Spin, Alert, message } from 'antd';
import { FiShoppingCart, FiCreditCard } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';
import Carousel from '../components/Carousel'
// API Hooks
import itemApi from "../api/itemApi";
import userApi from '../api/userApi';
import orderItemApi from '../api/orderItemApi';

// MOCK DATA: Using your provided mock review data as requested.
const commenter = [
  { name: "Nguyen Van A", picture: "https://i.pinimg.com/736x/5b/3f/09/5b3f09d67f448e39dab9e8d8f3cc3f94.jpg", comment: "Very good product, I love it so much", rating: 5, time: "2023-10-01 10:00", imagefollow: ["https://i.pinimg.com/1200x/55/53/06/55530643312e136a9fa2a576d6fcfbd0.jpg", "https://i.pinimg.com/736x/b6/96/16/b6961611f87b3433707d937b3f4871b1.jpg"] },
  { name: "Tran Thi B", picture: "https://i.pinimg.com/736x/b6/10/ae/b610ae5879e2916e1bb7c4c161754f4d.jpg", comment: "Not bad, but could be better", rating: 3, time: "2023-10-02 12:30", imagefollow: ["https://i.pinimg.com/1200x/e9/22/29/e9222949753e671a7e8f7c09725ebed0.jpg"] },
  { name: "Le Van C", picture: "https://i.pinimg.com/736x/ae/5d/4f/ae5d4f0a3f4e8b9c8e4e4e4e4e4e4e4e.jpg", comment: "I had some issues with the delivery", rating: 2, time: "2023-10-03 14:45", imagefollow: [] }
];


// Reusable component for star ratings
const StarRating = ({ rating }) => (
  <div className="flex items-center">
    {Array.from({ length: 5 }).map((_, i) => (
      <FaStar key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'} />
    ))}
  </div>
);

function BatteryDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const itemId = location.state;

  const [item, setItem] = useState(null);
  const [sellerProfile, setSellerProfile] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!itemId) {
      setError("No item ID provided.");
      setLoading(false);
      return;
    }

    const fetchItemData = async () => {
      try {
        setLoading(true);
        const itemData = await itemApi.getItemDetailByID(itemId);
        setItem(itemData);

        const userData = await userApi.getUserByID(itemData.updatedBy);
        setSellerProfile(userData);

      } catch (err) {
        console.error("Error fetching item details:", err);
        setError("Failed to load product details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchItemData();
  }, [itemId]);
      const handleBuyNowClick = async () => {
        const cartPayload = {
            "buyerId": localStorage.getItem("userId"),
            "itemId": itemId,
            "quantity": quantity,
            "price": 10
        };
        try {
            await orderItemApi.postOrderItem(cartPayload);
        } catch (error) {
            console.error("Error adding item to cart", error);
        }
        navigate('/cart', { state: { selectedItemId: itemId } }); 
        console.log(`'Buy Now' clicked for item ID: ${itemId}`);
        // You can add your logic for buying now here
    };


  const handleAddToCart = async () => {
    if (!item) return;
    const cartPayload = {
      "buyerId": localStorage.getItem("userId"),
      "itemId": itemId,
      "quantity": quantity,
      "price": item.price
    };

    try {
      await orderItemApi.postOrderItem(cartPayload);
      message.success(`${quantity} x ${item.title} added to cart!`);
    } catch (error) {
      console.error("Error adding item to cart", error);
      message.error("Could not add item to cart. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <Alert message="Error" description={error} type="error" showIcon />
      </div>
    );
  }

  if (!item) {
    return null; // Don't render anything if the item data is not available
  }

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Left Column: Images and Description */}
        <div className="lg:col-span-3 flex flex-col gap-8">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
             <Carousel images={item.imageUrls || []} />
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold border-b pb-4 mb-4">Description</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {item.description}
            </p>
          </div>
        </div>

        {/* Right Column: Product Info, Seller, Comments */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <div className="bg-white rounded-lg shadow-md p-6 flex flex-col gap-4">
            <h1 className="text-3xl font-bold text-gray-900 leading-tight">
              {item.title}
            </h1>
            <div className="text-md text-gray-500">
              {item.batteryDetail && (
                <span>
                  <strong>{item.batteryDetail.brand}</strong> | Capacity: {item.batteryDetail.capacity}Ah | Voltage: {item.batteryDetail.voltage}V
                </span>
              )}
            </div>
            <div className="bg-gray-100 p-4 rounded-lg">
              <span className="text-4xl font-extrabold text-indigo-600">${item.price.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-semibold text-gray-700">Quantity:</span>
              <InputNumber min={1} max={item.quantity} value={quantity} onChange={setQuantity} />
              <span className="text-sm text-gray-500">{item.quantity} available</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors"
              >
                <FiShoppingCart />
                Add to Cart
              </button>
              <button
                className="flex-1 bg-green-500 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 hover:bg-green-600 transition-colors"
                onClick={handleBuyNowClick}
              >
                <FiCreditCard />
                Buy Now
              </button>
            </div>
          </div>
          
          {sellerProfile && (
            <div className="bg-white rounded-lg shadow-md p-6 flex items-center gap-4">
              <img 
                className="w-16 h-16 rounded-full object-cover" 
                src={sellerProfile.avatar || 'https://i.pinimg.com/736x/b6/10/ae/b610ae5879e2916e1bb7c4c161754f4d.jpg'}
                alt={sellerProfile.fullName}
              />
              <div className="flex-1">
                <p className="font-bold text-lg">{sellerProfile.fullName}</p>
                <p className="text-sm text-green-600">Active recently</p>
              </div>
              <button className="border border-indigo-600 text-indigo-600 font-semibold py-2 px-4 rounded-lg hover:bg-indigo-50 transition-colors">
                View Profile
              </button>
            </div>
          )}

          {/* MOCK REVIEWS SECTION */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold border-b pb-4 mb-4">Reviews ({commenter.length})</h2>
            <div className="flex flex-col gap-6">
              {commenter.length > 0 ? (
                commenter.map((review, index) => (
                  <div key={index} className="flex gap-4 border-b border-gray-100 pb-4 last:border-b-0">
                    <img src={review.picture} alt={review.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0"/>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <p className="font-bold">{review.name}</p>
                        <p className="text-xs text-gray-500">{new Date(review.time).toLocaleDateString()}</p>
                      </div>
                      <div className="my-1">
                        <StarRating rating={review.rating} />
                      </div>
                      <p className="text-gray-800">{review.comment}</p>
                       {review.imagefollow && review.imagefollow.length > 0 && (
                        <div className="flex gap-2 mt-2">
                          {review.imagefollow.map((img, idx) => (
                            <img key={idx} src={img} className="w-20 h-20 object-cover rounded-md cursor-pointer hover:opacity-80 transition" alt="review"/>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No reviews for this product yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BatteryDetails;