import axios from "axios";
const baseURL = import.meta.env.VITE_API_BASE_URL + "orders";
const orderApi = {
    getOrder: async () => {
        const response = await axios.get(baseURL);
        return response.data;
    },
    getOrderById: async (id) => {
        const token = localStorage.getItem('token');
        const response = await axios.get(baseURL + '/' + id,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        )
        return response.data;
    },
    postOrderNew: async (data) => {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${baseURL}/new`, data, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        console.log("🚀 ~ file: orderApi.js:26 ~ postOrderNew: ~ response:", response.data)
        return response.data;
    },
    getOrdersByBuyerId: async (buyerId) => {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${baseURL}/user/${buyerId}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        )
        return response.data;
    },
    putOrder: async (id, data) => {
        const token = localStorage.getItem('token');
        const response = await axios.put(baseURL + '/' + id, data,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        )
        return response.data;
    }
};
export default orderApi;