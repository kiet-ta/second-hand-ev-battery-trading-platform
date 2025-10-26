import axios from "axios";
const baseURL = import.meta.env.VITE_API_BASE_URL + "Orders";
const token = localStorage.getItem('token');
const orderApi = {
    getOrder: async () => {
        const response = await axios.get(baseURL);
        return response.data;
    },
    getOrderById: async (id) => {
        const response = await axios.get(baseURL + '/' + id,
            {headers: {
                            // This line is essential for authorized endpoints
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }}
        )
        return response.data;
    },
    postOrderNew : async (data) => {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${baseURL}/new`,data,{
            headers:{
                'Authorization': `Bearer ${token}`
            }
        })
        return response.data;   
    },
    getOrderByUserId: async (userId) => {
        const response = await axios.get(`${baseURL}/user/${userId}`,
            {headers: {
                            // This line is essential for authorized endpoints
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }}
        )
        return response.data;
    }
};
export default orderApi;