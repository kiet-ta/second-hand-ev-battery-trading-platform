using Domain.Entities;
using Infrastructure.Data.Configurations;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;

namespace Infrastructure.Data;

public partial class EvBatteryTradingContext : DbContext
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

    public virtual DbSet<EVDetail> EvDetails { get; set; }

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

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(EvBatteryTradingContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}