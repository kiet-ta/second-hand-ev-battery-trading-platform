import { useState, useEffect } from "react"
import "../assets/styles/ProfileForm.css"
import anhtao from "../assets/images/anhtao.png"

const ProfileForm = () => {
    const [formData, setFormData] = useState(null)
    const userId = localStorage.getItem("userId")
    const token = localStorage.getItem("token")

    // Gọi API khi load component
    useEffect(() => {
        if (!userId) return

        fetch(`https://localhost:7272/api/Users/${userId}`, {
            headers: {
                "Authorization": `Bearer ${token}`, // nếu API yêu cầu JWT
                "Content-Type": "application/json"
            }
        })
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch user")
                return res.json()
            })
            .then(data => {
                if (data.yearOfBirth) {
                    data.yearOfBirth = data.yearOfBirth.split("T")[0]  // chỉ lấy yyyy-MM-dd
                }
                setFormData(data)
            })
            .catch(err => console.error("Error:", err))
    }, [userId, token])

    if (!formData) return <p>Loading...</p>

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        const updatedUser = {
            ...formData,
            fullName: formData.fullName,
            email: formData.email,
            gender: formData.gender,
            yearOfBirth: formData.yearOfBirth
                ? new Date(formData.yearOfBirth).toISOString().split("T")[0] // => YYYY-MM-DD
                : null,
            phone: formData.phone,
            updatedAt: new Date().toISOString()
        }
        console.log(formData.yearOfBirth);

        fetch(`https://localhost:7272/api/Users/${userId}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedUser),
        })
            .then(async (res) => {
                if (!res.ok) throw new Error("Failed to update user")

                // Nếu có content thì parse JSON, còn không thì return null
                const text = await res.text()
                return text ? JSON.parse(text) : null
            })
            .then((data) => {
                alert("Update successful!")
                console.log("Updated user:", data)
            })
            .catch((err) => console.error("Error updating user:", err))
    }


    return (
        <div className="profile-form-container">
            {/* Profile Photo Section */}
            <div className="profile-photo-section">
                <div className="photo-upload">
                    <img src={anhtao} alt="Profile" className="profile-photo" />
                    <div className="upload-info">
                        <h3>{formData.fullName}</h3>
                    </div>
                </div>
                <button className="update-btn">Update</button>
            </div>

            {/* Form Section */}
            <div className="form-section">
                <h2 className="form-title">Change User Information here</h2>

                <form onSubmit={handleSubmit} className="profile-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="fullName">Full Name*</label>
                            <input
                                type="text"
                                id="fullName"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email Address*</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="gender">Gender*</label>
                            <input
                                type="text"
                                id="gender"
                                name="gender"
                                value={formData.gender}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="yearOfBirth">Year of Birth*</label>
                            <input
                                type="date"
                                id="yeaOfBirth"
                                name="yearOfBirth"
                                value={formData.yearOfBirth || ""}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                    </div>

                    <div className="form-group full-width">
                        <label htmlFor="phone">Phone*</label>
                        <input
                            type="text"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <button type="submit" className="submit-btn">
                        Update Information
                    </button>
                </form>
            </div>
        </div>
    )
}

export default ProfileForm
