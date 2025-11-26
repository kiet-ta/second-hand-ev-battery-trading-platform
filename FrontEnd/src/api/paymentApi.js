import axios from "axios";
const baseURL = import.meta.env.VITE_API_BASE_URL + "payment";
const paymentApi = {
    createPaymentLink: async (payload) => {
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
    confirmOrder: async (orderId) => {
        try{
            const response = await axios.post(`${baseURL}/confirm-order/${orderId}`,{} ,{
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            })
            return response.data;
        } catch (error) {
            console.error("Error in createPayment API call:", error);
            throw error;
        }
    },
    cancelPayment: async (data) => {
        try{
            const response = await axios.post(`${baseURL}/cancel/${data.orderCode}`, {reason: data.reason, orderId: data.orderId} ,{
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            })
            return response.data;   

        }
        catch (error) {
            console.error("Error in createPayment API call:", error);
            throw error;
        }
    }

};
export default paymentApi;