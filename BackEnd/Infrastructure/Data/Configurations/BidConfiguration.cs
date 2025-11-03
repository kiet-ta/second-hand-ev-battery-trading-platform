using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations;

public class BidConfiguration : IEntityTypeConfiguration<Bid>
{
    public void Configure(EntityTypeBuilder<Bid> entity)
    {
        entity.ToTable("bids");
        entity.HasKey(e => e.BidId);

        entity.Property(e => e.BidId).HasColumnName("bid_id");
        entity.Property(e => e.AuctionId).HasColumnName("auction_id"); 
        entity.Property(e => e.UserId).HasColumnName("user_id");
        entity.Property(e => e.BidAmount).HasColumnName("bid_amount").HasColumnType("decimal(18,2)");
        entity.Property(e => e.BidTime).HasColumnName("bid_time").HasDefaultValueSql("GETDATE()");
        entity.Property(e => e.Status)
              .HasColumnName("status")
              .HasMaxLength(20)
              .IsRequired()
              .HasDefaultValue("active");
    }
}
