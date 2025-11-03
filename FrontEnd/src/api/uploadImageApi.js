import axios from "axios";
const baseURL = import.meta.env.VITE_API_BASE_URL + "item";

const auctionApi = {
    uploadItemImage: async (itemId, files) => {
        const formData = new FormData();
        formData.append('itemId', itemId);
        files.forEach(file => {
            formData.append('files', file);
        });
        const response = await axios.post(`${baseURL}/${itemId}/images`, formData, {
            header: {
                'Content-Type': 'multipart/form-data',
            }
        })
        console.log(response.data)
        return response.data
    },
}
export default auctionApi