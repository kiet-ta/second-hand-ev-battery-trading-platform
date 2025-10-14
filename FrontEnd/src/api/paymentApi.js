import axios from "axios";
const baseURL = import.meta.env.VITE_API_BASE_URL + "payment";
const paymentApi = {
    createPaymentLink: async (payload) => {
        const response = await axios.get(baseURL + '/create-payment-link',payload);
        return response.data;
    },
    postOrderItem: async (data) => {
        try{
        const response = await axios.post(baseURL,data)
        return response.data;
        } catch (error) {
        console.error("Error in createPayment API call:", error);
        throw error;
    }
    }
};
export default paymentApi;