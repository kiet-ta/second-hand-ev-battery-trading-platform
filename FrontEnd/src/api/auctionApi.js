import axios from "axios";
const baseURL = import.meta.env.VITE_API_BASE_URL + "auction";

const auctionApi = {
    getAuction: async () =>{
        const response = await axios.get(baseURL)
        console.log(response.data)
        return response.data
    },
    postAuction: async (payload) => {
        const response = await axios.post(baseURL,payload)
        return response.data
    }
}
export default auctionApi