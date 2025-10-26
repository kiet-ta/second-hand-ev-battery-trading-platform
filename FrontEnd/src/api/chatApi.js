import axios from "axios";
const baseURL = import.meta.env.VITE_API_BASE_URL + "Chat";

const chatApi = {
    createChatRoom: async (member1, member2) => {
        const token = localStorage.getItem('token');
        const payload = { members: [member1, member2] };
        const response = await axios.post(`${baseURL}/rooms`, payload,{
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data
    },
    getChatByID: async (chatId) => {
        const response = await axios.get(`${baseURL}/rooms/${chatId}`)
        return response.data
    },
    getRoomByUserIDs: async (userId) => {
        const response = await axios.get(`${baseURL}/rooms/user/${userId}`)
        return response.data
    },
    sendChatMessage: async (payload) => {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${baseURL}/send`, payload,
            {
                headers: {
                    // This line is essential for authorized endpoints
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        )
        return response.data
    }
}
export default chatApi