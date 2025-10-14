import axios from "axios";
const baseURL = import.meta.env.VITE_API_BASE_URL + "payment";
const paymentApi = {
    createPaymentLink: async (payload) => {
        console.log(payload)
        const response = await axios.post(baseURL + '/create-payment-link', payload);
        console.log(response.data)
        return response.data;
    },
    getPaymentInfoByOrderCode: async (orderCode) => {
        try {
            const response = await axios.get(`${baseURL}/info/${orderCode}`)
            return response.data;
        } catch (error) {
            console.error("Error in createPayment API call:", error);
            throw error;
        }
    },
    cancelPayment: async (orderCode, reason) => {
        try {
            const response = await axios.post(`${baseURL}/info/${orderCode}`,reason)
            return response.data;
        } catch (error) {
            console.error("Error in createPayment API call:", error);
            throw error;
        }
    }

};
export default paymentApi;