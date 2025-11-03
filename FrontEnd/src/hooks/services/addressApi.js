import axios from "axios";

const ADDRESS_API_BASE = import.meta.env.VITE_API_BASE_URL;;

const addressApi = {
    getProvinces: async () => {
        try {
            const res = await axios.get(
                "https://raw.githubusercontent.com/madnh/hanhchinhvn/master/dist/tinh_tp.json"
            );
            return Object.values(res.data);
        } catch (err) {
            console.error("Lỗi load provinces:", err);
            return [];
        }
    },

    getDistricts: async (provinceCode) => {
        try {
            const res = await axios.get(
                "https://raw.githubusercontent.com/madnh/hanhchinhvn/master/dist/quan_huyen.json"
            );
            return Object.values(res.data).filter(
                (d) => String(d.parent_code) === String(provinceCode)
            );
        } catch (err) {
            console.error(`Lỗi load districts cho province ${provinceCode}:`, err);
            return [];
        }
    },

    getWards: async (districtCode) => {
        try {
            const res = await axios.get(
                "https://raw.githubusercontent.com/madnh/hanhchinhvn/master/dist/xa_phuong.json"
            );
            return Object.values(res.data).filter(
                (w) => String(w.parent_code) === String(districtCode)
            );
        } catch (err) {
            console.error(`Lỗi load wards cho district ${districtCode}:`, err);
            return [];
        }
    },

};

export default addressApi;
