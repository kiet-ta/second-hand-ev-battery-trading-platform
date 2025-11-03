import axios from "axios";

const GHN_TOKEN = import.meta.env.VITE_GHN_TOKEN;

const addressApi = {
  getProvinces: async () => {
    const res = await axios.get("/ghn/shiip/public-api/master-data/province", {
      headers: { Token: GHN_TOKEN },
    });
    return res.data.data;
  },
  getDistricts: async (provinceId) => {
    const res = await axios.post("/ghn/shiip/public-api/master-data/district",
      { province_id: provinceId },
      { headers: { Token: GHN_TOKEN } }
    );
    return res.data.data;
  },
  getWards: async (districtId) => {
    const res = await axios.post("/ghn/shiip/public-api/master-data/ward",
      { district_id: districtId },
      { headers: { Token: GHN_TOKEN } }
    );
    return res.data.data;
  },
};

export default addressApi;
