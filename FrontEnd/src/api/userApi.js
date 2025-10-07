import axios from "axios";
const baseURL = import.meta.env.VITE_API_BASE_URL + "User";
const token = localStorage.getItem('token');
const userApi = {
    getUser: async () => {
        const response = await axios.get(baseURL);
        return response.data;
    },
    getUserByID: async (id) => {
        const response = await axios.get(baseURL + '/' + id,
            {headers: {
                            // This line is essential for authorized endpoints
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }}
        )
        return response.data;
    }
};
export default userApi;