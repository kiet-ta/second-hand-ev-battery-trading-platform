import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL + "address";

const addressLocalApi = {
    getAddress: async () => {
        const response = await axios.get(`${baseURL}`, {
            params: { page: 0, size: 30 },
        });
        return response.data;
    },
    getAddressById: async (id) => {
        const response = await axios.get(`${baseURL}/${id}`);
        return response.data;
    },
    getAddressByUserId: async (userId) => {
        const response = await axios.get(`${baseURL}/user/${userId}`);
        return response.data;
    },
    

    addAddress: async (address) => {
        try {
            const res = await axios.post(`${baseURL}`, address,
                {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("token")}`,
                'Content-Type': 'application/json'
            }
                }
            );
            return res.data;
        } catch (err) {
            console.error("Lỗi thêm mới address:", err);
            throw err;
        }
    },

    updateAddress: async (id, address) => {
        try {
            const res = await axios.put(`${baseURL}/${id}`, address);
            return res.data;
        } catch (err) {
            console.error("Lỗi update address:", err);
            throw err;
        }
    },

    deleteAddress: async (id) => {
        try {
            const res = await axios.delete(`${baseURL}/${id}`);
            return res.data;
        } catch (err) {
            console.error("Lỗi xóa address:", err);
            throw err;
        }
    },
};

export default addressLocalApi;