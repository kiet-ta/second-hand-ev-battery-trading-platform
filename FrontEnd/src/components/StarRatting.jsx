import React, { useState } from "react";
import { Star } from "lucide-react";

export default function StarRating({ rating, setRating }) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center space-x-1">
      {[...Array(5)].map((_, index) => {
        const starValue = index + 1;
        return (
          <button
            type="button"
            key={starValue}
            className={`transition-colors duration-200 ${
              starValue <= (hover || rating) ? "text-yellow-400" : "text-gray-300"
            }`}
            onClick={() => setRating(starValue)}
            onMouseEnter={() => setHover(starValue)}
            onMouseLeave={() => setHover(0)}
          >
            <Star fill="currentColor" className="w-8 h-8" />
          </button>
        );
      })}
    </div>
  );
}