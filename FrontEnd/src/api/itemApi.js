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
        const response = await axios.get(linkBaseURL + "ev-details" + "/latest-evs?count=4")
        return response.data;
    },
    getItemByLatestBattery: async () => {
        const response = await axios.get(linkBaseURL + "battery-details" + "/latest-batteries?count=4")
        return response.data;
    },
    getItemBySearch: async (itemType, title, minPrice, maxPrice, page, pageSize, sortBy, sortDir) => {
        const response = await axios.get(`${baseURL}/search`, { params: { itemType, title, minPrice, maxPrice, page, pageSize, sortBy, sortDir } })
        return response.data;
    },
    getBatteryDetailBySearch: async (brand, capacity, voltage, chargeCycle) => {
        const response = await axios.get(`${linkBaseURL}battery-details/search`,{ params: {
            brand, capacity, voltage, chargeCycle
        }})
        return response.data;
    },
    getEvDetailBySearch: async (brand, model, year, color, isRegistrationValid) => { 
        const response = await axios.get(`${linkBaseURL}ev-details/search`,{ params: {
            brand, model, year, color, isRegistrationValid
        }})
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
        const response = await axios.post(linkBaseURL + "ev-details", data);
        return response.data;
    },
    postItemBattery: async (data) => {
        const response = await axios.post(linkBaseURL + "battery-details", data);
        return response.data;
    },
    putItem: async (itemId, itemData) => {
        console.log(itemId, itemData)
        const response = await axios.put(baseURL + `/${itemId}`, itemData)
        return response.data
    },
    putItemDetailEV: async (itemId, evData) => {
        const response = await axios.put(linkBaseURL + "ev-details" + `/${itemId}`, evData)
        return response.data
    },
    putItemDetailBattery: async (itemId, batteryData) => {
        const response = await axios.put(linkBaseURL + "battery-details" + `/${itemId}`, batteryData)
        return response.data
    },
    deleteItem: async (itemId) => {
        const response = await axios.delete(baseURL + `/${itemId}`);
        return response.data;
    },

};
export default itemApi;