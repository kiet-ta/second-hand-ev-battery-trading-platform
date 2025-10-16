import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FaRegHeart } from "react-icons/fa";

export default function Carousel({ images }) {
  const [current, setCurrent] = useState(0);
  const [color,setColor] = useState("black")
  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Main Image */}
      <div className="relative">
        <img
          src={images[current]}
          alt={`slide-${current}`}
          className="w-full h-96 object-contain rounded-xl shadow-lg"
        />
        <div className="absolute top-5 right-5">
            <FaRegHeart size="2rem" color={color} onMouseOver={() => setColor("Red")} onMouseLeave={() => setColor("Black")}/>
        </div>
        {/* Prev button */}
        <button
          onClick={prevSlide}
          className="absolute top-1/2 left-3 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Next button */}
        <button
          onClick={nextSlide}
          className="absolute top-1/2 right-3 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60"
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
