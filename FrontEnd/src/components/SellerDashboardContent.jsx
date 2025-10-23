const SellerDashboardContentView = ({ dashboardData }) => (
    <div className="p-8">
        {/* ... (The entire content of your dashboard view) ... */}
        {/* This component is now rendered by the index route in router.jsx */}
        {/* Ensure all dashboardData props are accessed correctly */}
        
        {/* Simplified stats card for brevity */}
        <div className="grid grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="text-3xl font-bold text-gray-900">{dashboardData?.listings ?? 0}</div>
                <div className="text-sm text-gray-500">Listings</div>
            </div>
            {/* ... rest of the cards ... */}
        </div>

        {/* ... rest of the charts ... */}
    </div>
);
export default SellerDashboardContentView