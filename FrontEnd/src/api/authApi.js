class authApi {
    constructor() {
        this.apiUrl = import.meta.env.VITE_API_BASE_URL + "auth";
    }

    async login({ email, password }) {
        try {
            const response = await fetch(`${this.apiUrl}/tokens`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const text = await response.text();
            if (!response.ok) {
                console.error("❌ Login API failed:", response.status, text);
                throw new Error("Login failed");
            }

            // ✅ parse JSON trả về có field "data"
            const json = JSON.parse(text);
            return json;
        } catch (error) {
            console.error("Error in login:", error);
            throw error;
        }
    }


    // 🧾 Đăng ký
    async register(userData) {
        try {
            const res = await fetch(`${this.apiUrl}/users`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData),
            });

            const text = await res.text();
            if (!res.ok) {
                console.error("❌ Register API failed:", res.status, text);
                throw new Error("Register failed");
            }

            return JSON.parse(text); // Trả JSON có field data
        } catch (err) {
            console.error("Error in register:", err);
            throw err;
        }
    }
}

export default new authApi();
