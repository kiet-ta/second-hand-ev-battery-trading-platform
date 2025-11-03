import { useState } from "react";
import { ChevronDown } from "lucide-react";

const DropdownFilter = () => {
  const [selected, setSelected] = useState("Tất cả");
  const [open, setOpen] = useState(false);
  const options = ["Tất cả", "Xe", "Pin", "Phụ kiện"];

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white font-medium px-4 py-2 rounded-full transition-all shadow-sm"
      >
        {selected}
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          className="absolute left-0 mt-2 w-40 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-20"
        >
          {options.map((option) => (
            <button
              key={option}
              onClick={() => {
                setSelected(option);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-gray-700 hover:bg-yellow-100 hover:text-yellow-700 transition-all ${
                selected === option ? "bg-yellow-50 font-semibold text-yellow-700" : ""
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropdownFilter;
