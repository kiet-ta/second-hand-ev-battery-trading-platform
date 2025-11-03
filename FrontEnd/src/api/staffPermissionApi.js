import axios from "axios";
const baseURL = import.meta.env.VITE_API_BASE_URL + "management";
const staffManagementApi = {
    getPermissionByStaffId: async (id) => {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${baseURL}/staff/${id}/permissions`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        )
        return response.data;
    },
    getPermission: async () => {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${baseURL}/permissions`,
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
export default staffManagementApi;