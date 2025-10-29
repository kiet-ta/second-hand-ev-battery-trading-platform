import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL + "Compaints";

const complaintApi = {
    postComplaint: async (data) => {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${baseURL}`, data, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    },
    getComplaintsByUserId: async (userId) => {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${baseURL}/user/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    }
};

export default complaintApi;