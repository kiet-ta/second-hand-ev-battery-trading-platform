import axios from 'axios';
const baseURL = import.meta.env.VITE_API_BASE_URL + 'news';

const newsApi = {
    getNews: async ({ page = 1, pageSize = 20 } = {}) => {
        const response = await axios.get(baseURL, {
            params: { page, pageSize },
        });
        return response.data;
    },
    getNewsById: async (newsId) => {
        const response = await axios.get(`${baseURL}/${newsId}`);
        return response.data;
    },
    postNews: async (payload) => {
        const response = await axios.post(baseURL, payload, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    }
};

export default newsApi;