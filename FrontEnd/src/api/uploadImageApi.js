import axios from "axios";
const baseURL = import.meta.env.VITE_API_BASE_URL + "item";

const auctionApi = {
    uploadItemImage: async (itemId, files) => {
        const formData = new FormData();
        formData.append("itemId", itemId);

        for (const file of files) {
            formData.append("files", file);
        }

        const response = await axios.post(
            `${baseURL}/${itemId}/images`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        console.log(response.data);
        return response.data;
    },
};

export default auctionApi;
