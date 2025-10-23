import { useEffect, useState } from "react";
import addressApi from "../api/useAddress"; 

export default function DropdownForm() {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");

  // Load provinces on mount
  useEffect(() => {
    addressApi.getProvinces().then((data) => {
      setProvinces(data.data || []);
    });
  }, []);

  // Load districts when province changes
  useEffect(() => {
    if (selectedProvince) {
      addressApi.getDistricts(selectedProvince).then((data) => {
        setDistricts(data.data || []);
        setWards([]); // reset wards
        setSelectedDistrict("");
        setSelectedWard("");
      });
    }
  }, [selectedProvince]);

  // Load wards when district changes
  useEffect(() => {
    if (selectedDistrict) {
      addressApi.getWards(selectedDistrict).then((data) => {
        setWards(data.data || []);
        setSelectedWard("");
      });
    }
  }, [selectedDistrict]);

  return (
    <div className="space-y-4 p-4 max-w-md mx-auto">
      {/* Province */}
      <div>
        <label className="block mb-1">Province</label>
        <select
          value={selectedProvince}
          onChange={(e) => setSelectedProvince(e.target.value)}
          className="w-full border rounded p-2"
        >
          <option value="">-- Select Province --</option>
          {provinces.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* District → only show if province selected */}
      {selectedProvince && (
        <div>
          <label className="block mb-1">District</label>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="w-full border rounded p-2"
          >
            <option value="">-- Select District --</option>
            {districts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Ward → only show if district selected */}
      {selectedDistrict && (
        <div>
          <label className="block mb-1">Ward</label>
          <select
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
            className="w-full border rounded p-2"
          >
            <option value="">-- Select Ward --</option>
            {wards.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}