// services/addressApi.js
import axios from "axios";

const ADDRESS_API_BASE = import.meta.env.VITE_API_BASE_URL;;

const addressApi = {
    // Lấy danh sách provinces từ GitHub
    getProvinces: async () => {
        try {
            const res = await axios.get(
                "https://raw.githubusercontent.com/madnh/hanhchinhvn/master/dist/tinh_tp.json"
            );
            // res.data là object, cần chuyển thành mảng
            return Object.values(res.data);
        } catch (err) {
            console.error("Lỗi load provinces:", err);
            return [];
        }
    },

    // Lấy districts theo provinceCode (lọc từ file chung)
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

    // Lấy wards theo districtCode (lọc từ file chung)
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

    // Lấy danh sách address của user
    getUserAddresses: async (userId) => {
        try {
            const res = await axios.get(`${ADDRESS_API_BASE}Address/user/${userId}`);
            return res.data;
        } catch (err) {
            console.error("Lỗi load user addresses:", err);
            return [];
        }
    },

    // Thêm mới địa chỉ
    addAddress: async (address) => {
        try {
            const res = await axios.post(`${ADDRESS_API_BASE}Address`, address);
            return res.data;
        } catch (err) {
            console.error("Lỗi thêm mới address:", err);
            throw err;
        }
    },

    // Update địa chỉ
    updateAddress: async (id, address) => {
        try {
            const res = await axios.put(`${ADDRESS_API_BASE}Address/${id}`, address);
            return res.data;
        } catch (err) {
            console.error("Lỗi update address:", err);
            throw err;
        }
    },

    // Xóa địa chỉ
    deleteAddress: async (id) => {
        try {
            const res = await axios.delete(`${ADDRESS_API_BASE}Address/${id}`);
            return res.data;
        } catch (err) {
            console.error("Lỗi xóa address:", err);
            throw err;
        }
    },
};

export default addressApi;
