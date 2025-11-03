import axios from "axios";
const baseURL = import.meta.env.VITE_API_BASE_URL + "item";
const linkBaseURL = import.meta.env.VITE_API_BASE_URL;
const itemApi = {
    getItem: async () => {
        const response = await axios.get(baseURL);
        return response.data;
    },
    getItemDetailByID: async (id) => {
        const response = await axios.get(baseURL + "/with-detail/" + id)
        return response.data;
    },
    getItemByLatestEV: async () => {
        const response = await axios.get(linkBaseURL + "ev-details" + "/latest-evs", 10)
        return response.data;
    },
    getItemByLatestBattery: async () => {
        const response = await axios.get(linkBaseURL + "battery-details" + "/latest-batteries", 10)
        return response.data;
    },
    getItemBySearch: async (itemType, title, minPrice, maxPrice, page, pageSize, sortBy, sortDir) => {
        const response = await axios.get(`${baseURL}/search`, { params: { itemType, title, minPrice, maxPrice, page, pageSize, sortBy, sortDir } })
        return response.data;
    },
    getItemById: async (id) => {
        const response = await axios.get(baseURL + "/" + id);
        return response.data;
    },
    getItemDetail: async () => {
        const response = await axios.get(baseURL + "/detail/all");
        return response.data;
    },
    postItemEV: async (data) => {
        const response = await axios.post(linkBaseURL + "ev-details" + "/detail/ev", data);
        return response.data;
    },
    postItemBattery: async (data) => {
        const response = await axios.post(linkBaseURL + "battery-details" + "/detail/battery", data);
        return response.data;
    },
    putItem: async (itemId, itemData) => {
        console.log(itemId, itemData)
        const response = await axios.put(baseURL + `/${itemId}`, itemData)
        return response.data
    },
    putItemDetailEV: async (itemId, evData) => {
        const response = await axios.put(linkBaseURL + "ev-details" + `/detail/ev/${itemId}`, evData)
        return response.data
    },
    putItemDetailBattery: async (itemId, batteryData) => {
        const response = await axios.put(baseURL + "battery-details" + `/detail/battery/${itemId}`, batteryData)
        return response.data
    },
    deleteItem: async (itemId) => {
        const response = await axios.delete(baseURL + `/${itemId}`);
        return response.data;
    },

};
export default itemApi;