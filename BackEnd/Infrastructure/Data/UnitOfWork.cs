using Application.IRepositories;
using Application.IRepositories.IBiddingRepositories;
using Application.IRepositories.IChatRepositories;
using Application.IRepositories.IManageStaffRepositories;
using Application.IRepositories.IPaymentRepositories;
using Microsoft.EntityFrameworkCore.Storage;

namespace Infrastructure.Data;

public class UnitOfWork : IUnitOfWork
{
    private readonly EvBatteryTradingContext _context;
    private IDbContextTransaction? _currentTransaction; //save transaction present
    private bool _disposed = false; // To manage the disposal

    public IAuctionRepository Auctions { get; }
    public IBidRepository Bids { get; }
    public IWalletRepository Wallets { get; }
    public IWalletTransactionRepository WalletTransactions { get; }
    public IItemRepository Items { get; }
    public IUserRepository Users { get; }
    public IOrderRepository Orders { get; }
    public IOrderItemRepository OrderItems { get; }
    public ICommissionFeeRuleRepository CommissionFeeRules { get;}
    public ITransactionCommissionRepository TransactionCommission { get; }
    public IAddressRepository Address { get; }
    public IPaymentRepository Payments { get; } 
    public IBidRepository ItemBiddings { get; }
    public IChatRepository Chats { get; }   
    public IUserModerationRepository UserModerations { get; }
    public IPermissionRepository Permissions { get; }
    public IStaffPermissionRepository StaffPermissions { get; }
    public IPaymentDetailRepository PaymentDetails  { get; }
    public IBatteryDetailRepository BatteryDetails { get; }
    public IComplaintRepository Complaints { get; }
    public IEmailRepository Emails { get; }
    public IEVDetailRepository EVDetails { get; }
    public IFavoriteRepository Favorites{ get; }
    public IHistorySoldRepository HistorySolds { get; }
    public IItemImageRepository ItemImages { get; }
    public IKycDocumentRepository KycDocuments { get; }
    public INewsRepository News { get; }
    public INotificationRepository Notifications { get; }
    public IPasswordResetTokenRepository PasswordResetTokens{ get; }
    public IReportRepository Reports{ get; }
    public IReviewRepository Reviews { get; }
    public ITransactionRepository Transactions { get; }
    public UnitOfWork(
           EvBatteryTradingContext context,
           IAuctionRepository auctionRepository,
           IBidRepository bidRepository,
           IWalletRepository walletRepository,
           IWalletTransactionRepository walletTransactionRepository,
           IItemRepository itemRepository,
           IUserRepository userRepository,
           IOrderRepository orderRepository,
           IOrderItemRepository orderItemRepository,
           ICommissionFeeRuleRepository commissionFeeRuleRepository,
           ITransactionCommissionRepository transactionCommissionRepository,
           IAddressRepository addressRepository,
           IPaymentRepository paymentRepository,
           IChatRepository chatRepository,
           IUserModerationRepository userModerationRepository,
           IPermissionRepository permissionRepository,
           IStaffPermissionRepository staffPermissionRepository,
           IPaymentDetailRepository paymentDetailRepository,
           IBatteryDetailRepository batteryDetailRepository,
           IComplaintRepository complaintRepository,
           IEmailRepository emailRepository,
           IEVDetailRepository evDetailRepository,
           IFavoriteRepository favoriteRepository,
           IHistorySoldRepository historySoldRepository,
           IItemImageRepository itemImageRepository,
           IKycDocumentRepository kycDocumentRepository,
           INewsRepository newsRepository,
           INotificationRepository notificationRepository,
           IPasswordResetTokenRepository passwordResetTokenRepository,
           IReportRepository reportRepository,
           IReviewRepository reviewRepository,
           ITransactionRepository transactionRepository
       )
    {
        _context = context;

        Auctions = auctionRepository;
        Bids = bidRepository;
        Wallets = walletRepository;
        WalletTransactions = walletTransactionRepository;
        Items = itemRepository;
        Users = userRepository;
        Orders = orderRepository;
        OrderItems = orderItemRepository;
        CommissionFeeRules = commissionFeeRuleRepository;
        TransactionCommission = transactionCommissionRepository;
        Address = addressRepository;
        Payments = paymentRepository;

        Chats = chatRepository;
        UserModerations = userModerationRepository;
        Permissions = permissionRepository;
        StaffPermissions = staffPermissionRepository;
        PaymentDetails = paymentDetailRepository;
        BatteryDetails = batteryDetailRepository;
        Complaints = complaintRepository;
        Emails = emailRepository;
        EVDetails = evDetailRepository;
        Favorites = favoriteRepository;
        HistorySolds = historySoldRepository;
        ItemImages = itemImageRepository;
        KycDocuments = kycDocumentRepository;
        News = newsRepository;
        Notifications = notificationRepository;
        PasswordResetTokens = passwordResetTokenRepository;
        Reports = reportRepository;
        Reviews = reviewRepository;
        Transactions = transactionRepository;
    }

    public async Task BeginTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_currentTransaction != null)
        {
            throw new InvalidOperationException("A transaction is already in progress.");
        }
        _currentTransaction = await _context.Database.BeginTransactionAsync(cancellationToken);
    }

    public async Task CommitTransactionAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            await _context.SaveChangesAsync(cancellationToken);
            await _currentTransaction.CommitAsync(cancellationToken);
        }
        catch
        {
            await RollbackTransactionAsync(cancellationToken);
            throw;
        }
        finally
        {
            if (_currentTransaction != null)
            {
                await _currentTransaction.DisposeAsync();
                _currentTransaction = null;
            }
        }
    }

    public async Task RollbackTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_currentTransaction == null)
        {
            return;
        }
        try
        {
            await _currentTransaction.RollbackAsync(cancellationToken);
        }
        finally
        {
            if (_currentTransaction != null)
            {
                await _currentTransaction.DisposeAsync();
                _currentTransaction = null;
            }
        }
    }

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // help save changes in a single transaction
        return await _context.SaveChangesAsync(cancellationToken);
    }

    // Release unmanaged resources to avoid memory leaks
    protected virtual void Dispose(bool disposing)
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }

}