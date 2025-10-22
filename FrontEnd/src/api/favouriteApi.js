import axios from "axios";
const baseURL = import.meta.env.VITE_API_BASE_URL + "Favorites";
const favouriteApi = {
    postFavourite: async (data) => {
        const response = await axios.post(baseURL, data);
        return response.data;
    },
    getFavouriteByUserID: async (userId) => {
        const response = await axios.get(baseURL + `/${userId}`);
        return response.data
    },
    deleteFavourite: async (favouriteId) => {
        const token = localStorage.getItem('token');
        const response = await axios.delete(baseURL + `/${favouriteId}`,{
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;}
};
export default favouriteApi;