import axios from "axios";
const baseURL = import.meta.env.VITE_API_BASE_URL + "auction";

const auctionApi = {
    getAuction: async () =>{
        const response = await axios.get(baseURL)
        console.log(response.data)
        return response.data
    },
    getAuctionByItemId : async (itemId) => {
        const response = await axios.get(`${baseURL}/item/${itemId}`)
        return response.data
    },
    postAuction: async (payload) => {
        const response = await axios.post(baseURL,payload)
        return response.data
    },
    bidAuction: async (auctionId, payload) => {
        const response = await axios.post(`${baseURL}/${auctionId}/bid`,payload)
        return response.data
    },
    getBiddingHistory: async (auctionId) => {
        const response = await axios.get(`${baseURL}/${auctionId}/bidders`)
        return response.data
    }
}
export default auctionApi