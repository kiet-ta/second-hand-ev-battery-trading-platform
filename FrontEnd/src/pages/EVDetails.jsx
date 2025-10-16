import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Spin, Alert, message } from 'antd'; // Using Ant Design for feedback
import { FiMessageSquare, FiPhone, FiMapPin, FiCalendar, FiTrendingUp } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';
import { GiGemChain } from "react-icons/gi";

// API Hooks
import itemApi from '../api/itemApi';
import userApi from '../api/userApi';

// Reusable component for star ratings
const StarRating = ({ rating }) => (
  <div className="flex items-center">
    {Array.from({ length: 5 }).map((_, i) => (
      <FaStar key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'} />
    ))}
  </div>
);

// MOCK DATA: Using your provided mock review data as requested.
const commenter = [
    { name: "Nguyen Van A", picture: "https://i.pinimg.com/736x/5b/3f/09/5b3f09d67f448e39dab9e8d8f3cc3f94.jpg", comment: "The car was in excellent condition, exactly as described!", rating: 5, time: "2023-10-01 10:00", imagefollow: ["https://i.pinimg.com/1200x/55/53/06/55530643312e136a9fa2a576d6fcfbd0.jpg"] },
    { name: "Tran Thi B", picture: "https://i.pinimg.com/736x/b6/10/ae/b610ae5879e2916e1bb7c4c161754f4d.jpg", comment: "Good communication with the seller, smooth transaction.", rating: 4, time: "2023-10-02 12:30", imagefollow: [] },
    { name: "Le Van C", picture: "https://i.pinimg.com/736x/ae/5d/4f/ae5d4f0a3f4e8b9c8e4e4e4e4e4e4e4e.jpg", comment: "A few minor scratches that weren't mentioned, but overall happy.", rating: 3, time: "2023-10-03 14:45", imagefollow: [] }
];

function EVDetails() {
  const location = useLocation();
  const itemId = location.state;

  // State Management: Consolidated state with loading and error handling
  const [item, setItem] = useState(null);
  const [sellerProfile, setSellerProfile] = useState(null);
  const [isPhoneVisible, setIsPhoneVisible] = useState(false);
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
        console.error("Error fetching EV details:", err);
        setError("Failed to load vehicle details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchItemData();
  }, [itemId]);

  // Loading State
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Spin size="large" />
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="p-8">
        <Alert message="Error" description={error} type="error" showIcon />
      </div>
    );
  }

  // No Data State
  if (!item) {
    return null;
  }
  
  const { evDetail } = item;

  // Key Specifications for easy mapping
  const keySpecs = [
      { label: 'Brand', value: evDetail?.brand },
      { label: 'Model', value: evDetail?.model },
      { label: 'Body Style', value: evDetail?.bodyStyle },
      { label: 'Color', value: evDetail?.color },
      { label: 'License Plate', value: evDetail?.licensePlate }
  ];

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Left Column: Image, Specs, Description */}
        <div className="lg:col-span-3 flex flex-col gap-8">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
             {/* Assuming you have an images array in your item object */}
             <img src="https://i.pinimg.com/1200x/55/53/06/55530643312e136a9fa2a576d6fcfbd0.jpg" alt={item.title} className="w-full h-auto object-cover" />
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold border-b pb-4 mb-4">Key Specifications</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              {keySpecs.map(spec => (
                spec.value && <div key={spec.label}>
                  <p className="text-sm text-gray-500">{spec.label}</p>
                  <p className="font-semibold">{spec.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold border-b pb-4 mb-4">Description</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {item.description}
            </p>
          </div>
        </div>

        {/* Right Column: Main Info, Seller, Reviews */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <div className="bg-white rounded-lg shadow-md p-6 flex flex-col gap-4">
            <h1 className="text-3xl font-bold text-gray-900 leading-tight">
              {item.title}
            </h1>
            
            {evDetail && (
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-gray-600 items-center">
                <div className="flex items-center gap-2"><FiCalendar /><span>{evDetail.year}</span></div>
                <div className="flex items-center gap-2"><FiTrendingUp /><span>{evDetail.mileage.toLocaleString()} km</span></div>
                <div className="flex items-center gap-2"><FiMapPin /><span>{evDetail.location}</span></div>
              </div>
            )}
             {evDetail?.hasAccessories && (
                <div className="bg-teal-100 text-teal-800 text-sm font-semibold mr-2 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 self-start">
                    <GiGemChain /> Includes Accessories
                </div>
            )}

            <div className="bg-gray-100 p-4 rounded-lg my-2">
              <span className="text-4xl font-extrabold text-indigo-600">${item.price.toLocaleString()}</span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <button className="flex-1 bg-blue-500 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors">
                <FiMessageSquare /> Chat with Seller
              </button>
              <button
                onClick={() => setIsPhoneVisible(!isPhoneVisible)}
                className="flex-1 bg-green-500 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 hover:bg-green-600 transition-colors"
              >
                <FiPhone />
                {isPhoneVisible ? (sellerProfile?.phone || 'N/A') : 'Show Phone'}
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
                <p className="text-sm text-gray-500">Active recently</p>
              </div>
              <button className="border border-indigo-600 text-indigo-600 font-semibold py-2 px-4 rounded-lg hover:bg-indigo-50 transition-colors">
                View Profile
              </button>
            </div>
          )}

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
                      <div className="my-1"><StarRating rating={review.rating} /></div>
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
                <p className="text-gray-500 text-center py-4">No reviews for this vehicle yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EVDetails;