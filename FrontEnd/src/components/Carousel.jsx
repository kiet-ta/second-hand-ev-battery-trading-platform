import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Carousel({
  images,
  height = "h-64 sm:h-72 md:h-80 lg:h-96", // responsive height
  width = "w-full max-w-3xl",               // responsive width
}) {
  const [current, setCurrent] = useState(0);

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className={`${width} mx-auto`}>
      {/* Main image + arrows */}
      <div
        className={`flex items-center justify-between ${height} bg-black/5 rounded-xl shadow-lg`}
      >
        {/* Prev button */}
        <button
          onClick={prevSlide}
          className="bg-black/40 text-white p-2 rounded-full hover:bg-black/60 ml-2"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Main image */}
        <img
          src={images[current]}
          alt={`slide-${current}`}
          className="flex-1 h-full object-cover overflow-x-hidden mx-2 rounded-lg"
        />

        {/* Next button */}
        <button
          onClick={nextSlide}
          className="bg-black/40 text-white p-2 rounded-full hover:bg-black/60 mr-2"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Thumbnails */}
      <div className="flex justify-center gap-2 mt-4 overflow-x-auto">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`border-2 rounded-lg overflow-hidden ${
              current === idx ? "border-red-500" : "border-transparent"
            }`}
          >
            <img
              src={img}
              alt={`thumb-${idx}`}
              className="w-20 h-16 object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
