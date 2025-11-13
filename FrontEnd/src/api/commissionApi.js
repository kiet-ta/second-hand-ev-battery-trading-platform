import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL + "commission";

const commissionApi = {
    getCommissionByFeeCode: async (feeCode) => {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${baseURL}/rules/ruleCode/${feeCode}`, {}, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    }
};
export default commissionApi;