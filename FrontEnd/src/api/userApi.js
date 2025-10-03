import axios from "axios";
const baseURL = import.meta.env.VITE_API_BASE_URL + "Users";
const userApi = {
    getUser: async () => {
        const response = await axios.get(baseURL);
        return response.data;
    },
    getUserByID: async (id) => {
        const response = await axios.get(baseURL + '/' + id)
        return response.data;
    }
};
export default userApi;