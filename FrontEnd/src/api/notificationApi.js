import axios from "axios";
const baseURL = import.meta.env.VITE_API_BASE_URL + "Notifications";
const notificationApi = {
    getNotificationByReceiverId: async (userId) => {
        const response = await axios.get(`${baseURL}/receiver/${userId}`);
        return response.data;
    },
    createNotification: async (payload) => {
        const response = await axios.get(`${baseURL}`,payload)
        return response.data;
    }
};
export default notificationApi;