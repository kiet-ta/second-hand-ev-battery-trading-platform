using Application.IRepositories;
using Application.IRepositories.IBiddingRepositories;
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
    public ICommissionFeeRuleRepository CommissionFeeRule { get;}
    public ITransactionCommissionRepository TransactionCommission { get; }
    public IAddressRepository Address { get; }
    public IPaymentRepository Payments { get; }
    public ICommissionFeeRuleRepository CommissionFeeRules { get; }
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
            IAddressRepository addressRepository,
            IPaymentRepository paymentRepository,
            ICommissionFeeRuleRepository commissionFeeRuleRepository,
            ITransactionCommissionRepository transactionCommissionRepository
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
        Address = addressRepository;
        Payments = paymentRepository;
        CommissionFeeRules = commissionFeeRuleRepository;
        TransactionCommission = transactionCommissionRepository;      
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