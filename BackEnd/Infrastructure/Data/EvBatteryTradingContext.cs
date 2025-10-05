using Domain.Entities;
using Infrastructure.Data.Configurations;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;

namespace Infrastructure.Data;

public partial class EvBatteryTradingContext : DbContext//, IUnitOfWork
{
    public EvBatteryTradingContext()
    {
    }

    public EvBatteryTradingContext(DbContextOptions<EvBatteryTradingContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Address> Addresses { get; set; }

    public virtual DbSet<BatteryDetail> BatteryDetails { get; set; }

    public virtual DbSet<Bid> Bids { get; set; }

    public virtual DbSet<Blog> Blogs { get; set; }

    public virtual DbSet<Category> Categories { get; set; }

    public virtual DbSet<EvDetail> EvDetails { get; set; }

    public virtual DbSet<Favorite> Favorites { get; set; }

    public virtual DbSet<Item> Items { get; set; }

    public virtual DbSet<ItemBidding> ItemBiddings { get; set; }

    public virtual DbSet<ItemImage> ItemImages { get; set; }

    public virtual DbSet<KycDocument> KycDocuments { get; set; }

    public virtual DbSet<Order> Orders { get; set; }

    public virtual DbSet<OrderItem> OrderItems { get; set; }

    public virtual DbSet<Payment> Payments { get; set; }

    public virtual DbSet<PaymentDetail> PaymentDetails { get; set; }

    public virtual DbSet<Review> Reviews { get; set; }

    public virtual DbSet<ReviewImage> ReviewImages { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<UserLog> UserLogs { get; set; }

    public virtual DbSet<Wallet> Wallets { get; set; }

    public virtual DbSet<WalletTransaction> WalletTransactions { get; set; }

    

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
//#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Data Source=TECOOKIE\\SQLEXPRESS;Initial Catalog=EV_Battery_Trading;User ID=sa;Password=123456;Trust Server Certificate=True");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Item>().Property(i => i.IsDeleted).HasDefaultValue(false);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(EvBatteryTradingContext).Assembly);

        modelBuilder.ApplyConfiguration(new UserConfiguration());
        modelBuilder.ApplyConfiguration(new ItemConfiguration());
        modelBuilder.ApplyConfiguration(new CategoryConfiguration());
        modelBuilder.ApplyConfiguration(new ItemBiddingConfiguration());
        modelBuilder.ApplyConfiguration(new ItemImageConfiguration());
        modelBuilder.ApplyConfiguration(new KycDocumentConfiguration());
        modelBuilder.ApplyConfiguration(new OrderConfiguration());
        modelBuilder.ApplyConfiguration(new OrderItemConfiguration());
        modelBuilder.ApplyConfiguration(new PaymentConfiguration());
        modelBuilder.ApplyConfiguration(new PaymentDetailConfiguration());
        modelBuilder.ApplyConfiguration(new ReviewConfiguration());
        modelBuilder.ApplyConfiguration(new ReviewImageConfiguration());
        modelBuilder.ApplyConfiguration(new AddressConfiguration());
        modelBuilder.ApplyConfiguration(new BatteryDetailConfiguration());
        modelBuilder.ApplyConfiguration(new EvDetailConfiguration());
        modelBuilder.ApplyConfiguration(new FavoriteConfiguration());
        modelBuilder.ApplyConfiguration(new BidConfiguration());
        modelBuilder.ApplyConfiguration(new UserLogConfiguration());
        modelBuilder.ApplyConfiguration(new WalletConfiguration());
        modelBuilder.ApplyConfiguration(new WalletTransactionConfiguration());
    
        base.OnModelCreating(modelBuilder);

    }

    // IUnitOfWork implementation
    //public Task<int> SaveChangesAsync(CancellationToken ct = default) =>
        //base.SaveChangesAsync(ct);
    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
