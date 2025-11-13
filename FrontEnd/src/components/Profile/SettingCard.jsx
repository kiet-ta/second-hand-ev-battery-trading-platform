import "../assets/styles/SettingCard.css"
const SettingsCard = ({ title, description, isActive, onClick }) => {
    return (
        <button className={`settings-card ${isActive ? "Active" : ""}`} onClick={onClick}>
            <h3 className="card-title">{title}</h3>
            <p className="card-description">{description}</p>
        </button>
    )
}

export default SettingsCard
