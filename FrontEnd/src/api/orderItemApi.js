import axios from "axios";
const baseURL = import.meta.env.VITE_API_BASE_URL + "OrderItems";
const orderItemApi = {
    getOrderItem: async (userid) => {
        const response = await axios.get(baseURL + '/cart/' + userid);
        return response.data;
    },
    postOrderItem: async (data) => {
        const response = await axios.post(baseURL, data)
        return response.data;
    },
    deleteOrderItem: async (itemId) => {
        await axios.delete(baseURL + `/${itemId}`)
    },
};
export default orderItemApi;