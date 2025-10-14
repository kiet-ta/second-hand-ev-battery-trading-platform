import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL + "Address";

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
};

export default addressLocalApi;