const apiUrl = import.meta.env.VITE_API_BASE_URL + "auth";

async function login({ email, password }) {
    try {
        const response = await fetch(`${apiUrl}/tokens`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });

        const text = await response.text();

        if (!response.ok) {
            console.error("Login API failed:", response.status, text);
            throw new Error("Login failed");
        }

        return JSON.parse(text);
    } catch (error) {
        console.error("Error in login:", error);
        throw error;
    }
}

async function register(userData) {
    try {
        const res = await fetch(`${apiUrl}/users`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
        });

        const text = await res.text();

        if (!res.ok) {
            console.error("Register API failed:", res.status, text);
            throw new Error("Register failed");
        }

        return JSON.parse(text);
    } catch (err) {
        console.error("Error in register:", err);
        throw err;
    }
}

const authApi = {
    login,
    register,
};

export default authApi;
