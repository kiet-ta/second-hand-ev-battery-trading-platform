using Application.IRepositories.IBiddingRepositories;
using Application.IRepositories.IChatRepositories;
using Application.IRepositories.IManageStaffRepositories;
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
    ICommissionFeeRuleRepository CommissionFeeRules { get; }
    ITransactionCommissionRepository TransactionCommission { get; }
    IAddressRepository Address { get; }
    IPaymentRepository Payments { get; }
    IItemBiddingRepository ItemBiddings { get; }
    IChatRepository Chats { get; }
    IUserModerationRepository UserModerations { get; }
    IPermissionRepository Permissions { get; }
    IStaffPermissionRepository StaffPermissions { get; }
    IPaymentDetailRepository PaymentDetails { get; }
    IBatteryDetailRepository BatteryDetails { get; }
    ICategoryRepository Categories { get; }
    IComplaintRepository Complaints { get; }
    IEmailRepository Emails { get; }
    IEVDetailRepository EVDetails { get; }
    IFavoriteRepository Favorites { get; }
    IHistorySoldRepository HistorySolds { get; }
    IItemImageRepository ItemImages { get; }
    IKYC_DocumentRepository KycDocuments { get; }
    INewsRepository News { get; }
    INotificationRepository Notifications { get; }
    IPasswordResetTokenRepository PasswordResetTokens { get; }
    IReportRepository Reports { get; }
    IReviewRepository Reviews { get; }
    ITransactionRepository Transactions { get; }

    Task BeginTransactionAsync(CancellationToken cancellationToken = default);

    Task CommitTransactionAsync(CancellationToken cancellationToken = default);

    Task RollbackTransactionAsync(CancellationToken cancellationToken = default);

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);

}