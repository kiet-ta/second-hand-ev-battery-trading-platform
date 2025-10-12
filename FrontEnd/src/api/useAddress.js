import axios from "axios";

const baseURL = "https://open.oapi.vn/location";

const addressApi = {
  getProvinces: async () => {
    const response = await axios.get(`${baseURL}/provinces`, {
      params: { page: 0, size: 99 },
    });
    return response.data;
  },
  getDistricts: async (provinceId) => {
    const response = await axios.get(`${baseURL}/districts/${provinceId}`, {
      params: { page: 0, size: 99 },
    });
    return response.data;
  },
  getWards: async (districtId) => {
    const response = await axios.get(`${baseURL}/wards/${districtId}`, {
      params: { page: 0, size: 99 },
    });
    return response.data;
  },
};

export default addressApi;
