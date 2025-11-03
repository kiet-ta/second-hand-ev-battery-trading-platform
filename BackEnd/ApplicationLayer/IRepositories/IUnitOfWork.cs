using Application.IRepositories.IBiddingRepositories;
using Application.IRepositories.IPaymentRepositories;
namespace Application.IRepositories;

public interface IUnitOfWork 
{
    IAuctionRepository Auctions { get; }
    IBidRepository Bids { get; }
    IWalletRepository Wallets { get; }
    IWalletTransactionRepository WalletTransactions { get; }
    IItemRepository Items { get; }
    IUserRepository Users { get; }
    IOrderRepository Orders { get; }
    IOrderItemRepository OrderItems { get; }
    IPaymentRepository Payments { get; }
    ICommissionFeeRuleRepository CommissionFeeRules { get; }
    ITransactionCommissionRepository TransactionCommission { get; }

    IAddressRepository Address { get; }

    Task BeginTransactionAsync(CancellationToken cancellationToken = default);

    Task CommitTransactionAsync(CancellationToken cancellationToken = default);

    Task RollbackTransactionAsync(CancellationToken cancellationToken = default);

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);

}