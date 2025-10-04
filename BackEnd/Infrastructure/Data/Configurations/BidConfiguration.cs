using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Data.Configurations
{
    public class BidConfiguration : IEntityTypeConfiguration<Bid>
    {
        public void Configure(EntityTypeBuilder<Bid> entity)
        {
            entity.HasKey(e => e.BidId).HasName("PK__Bids__3DF045961D4B2A98");

            entity.HasIndex(e => new { e.BiddingId, e.BidAmount }, "idx_bidding_amount").IsDescending(false, true);

            entity.HasIndex(e => new { e.BiddingId, e.UserId }, "idx_bidding_user");

            entity.Property(e => e.BidId).HasColumnName("bid_id");
            entity.Property(e => e.BidAmount)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("bid_amount");
            entity.Property(e => e.BidTime)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("bid_time");
            entity.Property(e => e.BiddingId).HasColumnName("bidding_id");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne<ItemBidding>().WithMany()
                .HasForeignKey(d => d.BiddingId)
                .HasConstraintName("FK__Bids__bidding_id__07C12930");

            entity.HasOne<User>().WithMany()
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Bids__user_id__08B54D69");
        }
    }
}
