import axios from "axios";

const baseURL = "https://localhost:7272/api/Item";
const itemApi ={
    getItem: async () => {
        const response = await axios.get(baseURL);
        return response.data;
    },
    getItemById: async (id) => {
        const response = await axios.get(baseURL + "/" + id);
        return response.data;
    },
    postItem: async (data) => {
        const response = await axios.post(baseURL, data);
        return response.data;
    }
};
export default itemApi;