import axios from "axios";
const baseURL = import.meta.env.VITE_API_BASE_URL + "wallet";
const walletApi = {
    getWalletByUser: async (userId) => {
        const response = await axios.get(`${baseURL}/user/${userId}`);
        return response.data;
    },
    depositWallet: async (payload) => {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${baseURL}/deposit`, payload,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        )
        return response.data;
    },
    getWalletTransactions: async (walletId) => {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${baseURL}/${walletId}/transactions`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        )
        return response.data;
    }
};
export default walletApi;