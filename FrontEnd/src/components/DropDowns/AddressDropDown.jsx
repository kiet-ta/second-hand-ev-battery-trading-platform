import { useEffect, useState } from "react";
import addressApi from "../api/useAddress";
import { Select } from "antd";
const { Option } = Select;

export default function DropdownForm() {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");

  // Load provinces
  useEffect(() => {
    addressApi.getProvinces().then((data) => {
      setProvinces(data.data || []);
    });
  }, []);

  // Load districts
  useEffect(() => {
    if (selectedProvince) {
      addressApi.getDistricts(selectedProvince).then((data) => {
        setDistricts(data.data || []);
        setWards([]);
        setSelectedDistrict("");
        setSelectedWard("");
      });
    }
  }, [selectedProvince]);

  // Load wards
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
        <label className="block mb-1">Tỉnh / Thành phố *</label>
        <Select
          showSearch
          placeholder="Chọn Tỉnh/Thành"
          value={selectedProvince}
          onChange={(value) => setSelectedProvince(value)}
          filterOption={(input, option) =>
            option.children.toLowerCase().includes(input.toLowerCase())
          }
          className="w-full"
        >
          {provinces.map((p) => (
            <Option key={p.id} value={p.id}>
              {p.name}
            </Option>
          ))}
        </Select>
      </div>

      {/* District */}
      {selectedProvince && (
        <div>
          <label className="block mb-1">Quận / Huyện *</label>
          <Select
            showSearch
            placeholder="Chọn Quận/Huyện"
            value={selectedDistrict}
            onChange={(value) => setSelectedDistrict(value)}
            disabled={!selectedProvince}
            filterOption={(input, option) =>
              option.children.toLowerCase().includes(input.toLowerCase())
            }
            className="w-full"
          >
            {districts.map((d) => (
              <Option key={d.id} value={d.id}>
                {d.name}
              </Option>
            ))}
          </Select>
        </div>
      )}

      {/* Ward */}
      {selectedDistrict && (
        <div>
          <label className="block mb-1">Phường / Xã *</label>
          <Select
            showSearch
            placeholder="Chọn Phường/Xã"
            value={selectedWard}
            onChange={(value) => setSelectedWard(value)}
            disabled={!selectedDistrict}
            filterOption={(input, option) =>
              option.children.toLowerCase().includes(input.toLowerCase())
            }
            className="w-full"
          >
            {wards.map((w) => (
              <Option key={w.id} value={w.id}>
                {w.name}
              </Option>
            ))}
          </Select>
        </div>
      )}
    </div>
  );
}
