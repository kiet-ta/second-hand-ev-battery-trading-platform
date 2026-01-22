using Application.IHelpers;
using Application.IRepositories;
using Application.IRepositories.IBiddingRepositories;
using Application.IRepositories.IChatRepositories;
using Application.IRepositories.IManageStaffRepositories;
using Application.IRepositories.IPaymentRepositories;
using Domain.Entities;
using Infrastructure.Repositories;
using Infrastructure.Repositories.ChatRepositories;
using Infrastructure.Repositories.ManageStaffRepositories;
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
    public UnitOfWork(EvBatteryTradingContext context, IChatRepository chatRepository, IUserModerationRepository userModerationRepository, IDateTimeProvider dateTimeProvider)
    {
        _context = context;

        Auctions = new AuctionRepository(_context, dateTimeProvider);
        Bids = new BidRepository(_context);
        Wallets = new WalletRepository(_context);
        WalletTransactions = new WalletTransactionRepository(_context);
        Items = new ItemRepository(_context);
        Users = new UserRepository(_context);
        Orders = new OrderRepository(_context);
        OrderItems = new OrderItemRepository(_context);
        CommissionFeeRules = new CommissionFeeRuleRepository(_context);
        TransactionCommission = new TransactionCommissionRepository(_context);
        Address = new AddressRepository(_context);
        Payments = new PaymentRepository(_context);
        Chats = chatRepository;
        UserModerations = userModerationRepository;
        Permissions = new PermissionRepository(_context);
        StaffPermissions = new StaffPermissionRepository(_context);
        PaymentDetails = new PaymentDetailRepository(_context);
        BatteryDetails = new BatteryDetailRepository(_context);
        Complaints = new ComplaintRepository(_context);
        Emails = new EmailTemplateRepository(_context);
        EVDetails = new EVDetailRepository(_context);
        Favorites = new FavoriteRepository(_context);
        HistorySolds = new HistorySoldRepository(_context);
        ItemImages = new ItemImageRepository(_context);
        KycDocuments = new KycDocumentRepository(_context);
        News = new NewsRepository(_context);
        Notifications = new NotificationRepository(_context);
        PasswordResetTokens = new PasswordResetTokenRepository(_context);
        Reports = new ReportRepository(_context);
        Reviews = new ReviewRepository(_context);
        Transactions = new TransactionRepository(_context);
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