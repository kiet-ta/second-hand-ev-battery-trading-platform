class authApi {
    constructor() {
        this.apiUrl = "https://localhost:7272/api/Auth";
    }

    // Gọi API login
    async login(email, password) {
        try {
            const response = await fetch(`${this.apiUrl}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                throw new Error("Login failed");
            }

            return await response.json();
        } catch (error) {
            console.error("Error in login:", error);
            throw error;
        }
    }

    // Lấy danh sách user
    async getAllUsers() {
        try {
            const response = await fetch(this.apiUrl);
            if (!response.ok) {
                throw new Error("Failed to fetch users");
            }
            return await response.json();
        } catch (error) {
            console.error("Error in getAllUsers:", error);
            throw error;
        }
    }

    // Đăng ký user mới
    async register(userData) {
        try {
            const response = await fetch(`${this.apiUrl}/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userData),
            });

            if (!response.ok) {
                throw new Error("Register failed");
            }

            return await response.json();
        } catch (error) {
            console.error("Error in register:", error);
            throw error;
        }
    }
}

export default new authApi();