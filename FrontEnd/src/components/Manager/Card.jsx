function Card({ children, className = "" }) {
    return (
        <div className={`rounded-2xl shadow-sm border border-slate-200 bg-white ${className}`}>
            {children}
        </div>
    );
}
export default Card