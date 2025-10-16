import axios from "axios";
const baseURL = import.meta.env.VITE_API_BASE_URL + "Reviews";
const reviewApi = {
    postReview: async (data) => {
        const response = await axios.post(baseURL, data);
        console.log(response.data)
        return response.data;
    }
    };
export default reviewApi;