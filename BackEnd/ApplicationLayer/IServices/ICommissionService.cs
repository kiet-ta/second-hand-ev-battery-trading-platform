namespace Application.IServices;

public interface ICommissionService
{
    Task<decimal> CalculateFeeAsync(decimal transactionAmount, string role);
}