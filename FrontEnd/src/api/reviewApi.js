import axios from "axios";
const baseURL = import.meta.env.VITE_API_BASE_URL + "Reviews";
const reviewApi = {
    postReview: async (data) => {
        const response = await axios.post(baseURL, data);
        console.log(response.data)
        return response.data;
    },
    getReviewByItemID: async (itemID) => {
        const response = await axios.get(`${baseURL}/exists/item/${itemID}`)
        return response.data
    }
    };
export default reviewApi;