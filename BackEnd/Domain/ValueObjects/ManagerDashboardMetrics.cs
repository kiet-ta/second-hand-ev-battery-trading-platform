namespace Domain.ValueObjects
{
    public record ManagerDashboardMetrics
    {
        decimal RevenueThisMonth;
        int TotalUsers;
        int ActiveListings;
        double ComplaintRate;
        double Growth;
    }
}