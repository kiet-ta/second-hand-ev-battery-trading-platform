import axios from "axios";
const baseURL = import.meta.env.VITE_API_BASE_URL + "kyc-document";
const kycApi = {
    postKYC: async (userid, payload) => {
        const response = await axios.post(baseURL + '/users/' + userid + '/kyc', payload, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    },
    getPendingKYC: async () => {
        const response = await axios.get(`${baseURL}/kyc/pending`)
        return response.data;
    },
    getApprovedKYC: async () => {
        const response = await axios.get(`${baseURL}/kyc/approved`)
        return response.data;
    },
    getRejectedKYC: async () => {
        const response = await axios.get(`${baseURL}/kyc/rejected`)
        return response.data;
    },
    putApprovedKYC: async (kycID, payload) => {
        const response = await axios.put(`${baseURL}/kyc/${kycID}/approve`, payload)
        return response.data;
    },
    putRejectedKYC: async (kycID, payload) => {
        const response = await axios.put(`${baseURL}/kyc/${kycID}/reject`, payload)
        return response.data;
    },

};
export default kycApi;