import axios from "axios";
<<<<<<< Updated upstream
<<<<<<< Updated upstream
const baseURL = import.meta.env.VITE_API_BASE_URL + "Users";
=======
const baseURL = import.meta.env.VITE_API_BASE_URL + "User";
const token = localStorage.getItem('token');
>>>>>>> Stashed changes
=======
const baseURL = import.meta.env.VITE_API_BASE_URL + "User";
const token = localStorage.getItem('token');
>>>>>>> Stashed changes
const userApi = {
    getUser: async () => {
        const response = await axios.get(baseURL);
        return response.data;
    },
    getUserByID: async (id) => {
<<<<<<< Updated upstream
<<<<<<< Updated upstream
        const response = await axios.get(baseURL + '/' + id)
=======
=======
>>>>>>> Stashed changes
        const response = await axios.get(baseURL + '/' + id,{
            headers: {
            'Authorization': `Bearer ${token}`
            }
        })
        console.log(response.data)
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
        return response.data;
    }
};
export default userApi;