import axios from "axios";
const baseURL = import.meta.env.VITE_API_BASE_URL + "Notifications";
const notificationApi = {
    getNotificationByReceiverId: async (userId) => {
        const response = await axios.get(`${baseURL}/receiver/${userId}`);
        return response.data;
    },
    createNotification: async (payload) => {
        const response = await axios.post(`${baseURL}`,payload)
        return response.data;
    },
    putNotificationStatusIsRead: async (notificationId) => {
        const response = await axios.put(`${baseURL}/${notificationId}/read`)
        return response.data;
    }
};
export default notificationApi;