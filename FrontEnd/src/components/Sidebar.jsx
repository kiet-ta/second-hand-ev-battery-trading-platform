import "../assets/styles/SideBar.css"

const Sidebar = ({ activeSection, setActiveSection }) => {
    const menuItems = [
        { id: "feed", label: "My Job Feed", icon: "📋" },
        { id: "profile", label: "Profile", icon: "👤" },
        { id: "dashboard", label: "Dashboard", icon: "📊" },
        { id: "saved", label: "Saved Jobs", icon: "🔖" },
        { id: "settings", label: "Settings", icon: "⚙️" },
    ]

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <h1 className="logo">weblance</h1>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        className={`nav-item ${activeSection === item.id ? "active" : ""}`}
                        onClick={() => setActiveSection(item.id)}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        <span className="nav-label">{item.label}</span>
                    </button>
                ))}
            </nav>
        </div>
    )
}

export default Sidebar
