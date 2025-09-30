
import { useState } from "react"
import "../assets/styles/ProfileForm.css"
import anhtao from "../assets/images/anhtao.png"

const ProfileForm = () => {
    const [formData, setFormData] = useState({
        fullName: "Trung Thanh",
        email: "thanhtrungshark29@gmail.com",
        phone: "0797330518",
        province: "Dong Nai",
        country: "Vietnam",
    })

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        console.log("Form submitted:", formData)
    }

    return (
        <div className="profile-form-container">
            {/* Profile Photo Section */}
            <div className="profile-photo-section">
                <div className="photo-upload">
                    <img
                        src={anhtao}
                        alt="Profile"
                        className="profile-photo"
                    />
                    <div className="upload-info">
                        <h3>Thanh Trung</h3>
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
