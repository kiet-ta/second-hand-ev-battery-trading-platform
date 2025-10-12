using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations;

public class BidConfiguration : IEntityTypeConfiguration<Bid>
{
    public void Configure(EntityTypeBuilder<Bid> entity)
    {
        entity.HasKey(e => e.BidId).HasName("PK__bids__3DF045963BD4B1A2");

        entity.ToTable("bids");

        entity.HasIndex(e => new { e.AuctionId, e.BidAmount }, "idx_auction_amount").IsDescending(false, true);

        entity.HasIndex(e => new { e.AuctionId, e.UserId }, "idx_auction_user");

        entity.Property(e => e.BidId).HasColumnName("bid_id");
        entity.Property(e => e.AuctionId).HasColumnName("auction_id");
        entity.Property(e => e.BidAmount)
            .HasColumnType("decimal(18, 2)")
            .HasColumnName("bid_amount");
        entity.Property(e => e.BidTime)
            .HasDefaultValueSql("(getdate())")
            .HasColumnType("datetime")
            .HasColumnName("bid_time");
        entity.Property(e => e.UserId).HasColumnName("user_id");

        entity.HasOne<Auction>().WithMany()
            .HasForeignKey(d => d.AuctionId)
            .HasConstraintName("FK__bids__auction_id__0C85DE4D");

        entity.HasOne<User>().WithMany()
            .HasForeignKey(d => d.UserId)
            .OnDelete(DeleteBehavior.ClientSetNull)
            .HasConstraintName("FK__bids__user_id__0D7A0286");
    }
}
