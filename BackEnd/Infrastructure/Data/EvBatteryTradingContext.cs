using Domain.Entities;
using Infrastructure.Data.Configurations;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Reflection.Metadata;
using System.Security.Cryptography;

namespace Infrastructure.Data;

public class EvBatteryTradingContext : DbContext
{
    public EvBatteryTradingContext()
    {
    }

    public EvBatteryTradingContext(DbContextOptions<EvBatteryTradingContext> options)
        : base(options)
    {
    }

    public DbSet<Address> Addresses { get; set; }

    public DbSet<Auction> Auctions { get; set; }

    public DbSet<BatteryDetail> BatteryDetails { get; set; }

    public DbSet<Bid> Bids { get; set; }

    public DbSet<Blog> Blogs { get; set; }

    public DbSet<Category> Categories { get; set; }

    public DbSet<CommissionFeeRule> CommissionFeeRules { get; set; }

    public DbSet<EVDetail> EvDetails { get; set; }

    public DbSet<Favorite> Favorites { get; set; }

    public DbSet<Item> Items { get; set; }

    public DbSet<ItemImage> ItemImages { get; set; }

    public DbSet<KycDocument> KycDocuments { get; set; }

    public DbSet<Order> Orders { get; set; }

    public DbSet<OrderItem> OrderItems { get; set; }

    public DbSet<Payment> Payments { get; set; }

    public DbSet<PaymentDetail> PaymentDetails { get; set; }

    public DbSet<Review> Reviews { get; set; }

    public DbSet<ReviewImage> ReviewImages { get; set; }

    public DbSet<TransactionCommission> TransactionCommissions { get; set; }

    public DbSet<User> Users { get; set; }

    public DbSet<UserLog> UserLogs { get; set; }

    public DbSet<Wallet> Wallets { get; set; }

    public DbSet<WalletTransaction> WalletTransactions { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(EvBatteryTradingContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}