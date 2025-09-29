import '../assets/styles/StatsCard.css';

const StatsCard = ({ title, value, icon, color = "blue" }) => {
    return (
        <div className={`stats-card ${color}`}>
            <div className="stats-card-content">
                <div>
                    <p className="title">{title}</p>
                    <p className="value">{value}</p>
                </div>
                <div className="icon-box">
                    {icon}
                </div>
            </div>
        </div>
    );
};

export default StatsCard;
