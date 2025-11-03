using Domain.Entities;

namespace Application.IRepositories;

public interface ITransactionCommissionRepository
{
    //Task<IEnumerable<TransactionCommission>> GetByTransactionAsync(int transactionId);

    Task AddAsync(TransactionCommission transactionCommission);
}