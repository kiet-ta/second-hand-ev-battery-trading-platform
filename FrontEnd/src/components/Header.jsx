import { useState } from "react"
import anhtao from "../assets/images/anhtao.png"

const Header = () => {
    const [searchQuery, setSearchQuery] = useState("")

    return (
        <header className="header">
            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search Product"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                />
                <button className="search-button">🔍</button>
            </div>

            <div className="header-actions">
                <button className="notification-btn">🔔</button>
                <button className="cart-btn">
                    🛒<span className="cart-badge">2</span>
                </button>
                <div className="user-profile">
                    <img
                        src={anhtao}
                        alt="Profile"
                        className="user-avatar"
                    />
                    <span className="user-name">Thanh Trung</span>
                    <button className="menu-btn">⋯</button>
                </div>
            </div>
        </header>
    )
}

export default Header
