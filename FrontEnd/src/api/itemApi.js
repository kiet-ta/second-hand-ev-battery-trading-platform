import axios from "axios";
const baseURL = import.meta.env.VITE_API_BASE_URL + "Item";
const itemApi = {
    getItem: async () => {
        const response = await axios.get(baseURL);
        return response.data;
    },
    getItemByLatestEV: async () => {
        const response = await axios.get(baseURL + "/latest-evs")
        return response.data;
    },
    getItemByLatestBattery: async () => {
        const response = await axios.get(baseURL + "/latest-batterys")
        return response.data;
    },

    getItemById: async (id) => {
        const response = await axios.get(baseURL + "/" + id);
        return response.data;
    },
    postItem: async (data) => {
        const response = await axios.post(baseURL, data);
        return response.data;
    }
};
export default itemApi;