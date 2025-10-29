import axios from "axios";
const baseURL = import.meta.env.VITE_API_BASE_URL + "item";
const sellerApi = {
    getItemsBySellerId: async (sellerId) => {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${baseURL}/seller/${sellerId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
        return response.data;
    },
};
export default sellerApi;