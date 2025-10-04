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

    

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        //modelBuilder.Entity<Address>(entity =>
        //{
        //    entity.HasKey(e => e.AddressId).HasName("PK__Address__CAA247C84EA71887");

        //    entity.ToTable("Address");

        //    entity.Property(e => e.AddressId).HasColumnName("address_id");
        //    entity.Property(e => e.CreatedAt)
        //        .HasDefaultValueSql("(getdate())")
        //        .HasColumnName("created_at");
        //    entity.Property(e => e.District)
        //        .HasMaxLength(100)
        //        .HasColumnName("district");
        //    entity.Property(e => e.IsDefault)
        //        .HasDefaultValue(false)
        //        .HasColumnName("is_default");
        //    entity.Property(e => e.IsDeleted)
        //        .HasDefaultValue(false)
        //        .HasColumnName("is_deleted");
        //    entity.Property(e => e.Phone)
        //        .HasMaxLength(20)
        //        .HasColumnName("phone");
        //    entity.Property(e => e.Province)
        //        .HasMaxLength(100)
        //        .HasColumnName("province");
        //    entity.Property(e => e.RecipientName)
        //        .HasMaxLength(100)
        //        .HasColumnName("recipient_name");
        //    entity.Property(e => e.Street)
        //        .HasMaxLength(255)
        //        .HasColumnName("street");
        //    entity.Property(e => e.UserId).HasColumnName("user_id");
        //    entity.Property(e => e.Ward)
        //        .HasMaxLength(100)
        //        .HasColumnName("ward");

        //    entity.HasOne(d => d.User).WithMany(p => p.Addresses)
        //        .HasForeignKey(d => d.UserId)
        //        .OnDelete(DeleteBehavior.ClientSetNull)
        //        .HasConstraintName("FK__Address__user_id__33D4B598");
        //});

        //modelBuilder.Entity<BatteryDetail>(entity =>
        //{
        //    entity.HasKey(e => e.ItemId).HasName("PK__Battery___52020FDD728D4615");

        //    entity.ToTable("Battery_Detail");

        //    entity.Property(e => e.ItemId)
        //        .ValueGeneratedNever()
        //        .HasColumnName("item_id");
        //    entity.Property(e => e.Brand)
        //        .HasMaxLength(100)
        //        .HasColumnName("brand");
        //    entity.Property(e => e.Capacity).HasColumnName("capacity");
        //    entity.Property(e => e.ChargeCycles).HasColumnName("charge_cycles");
        //    entity.Property(e => e.UpdatedAt)
        //        .HasDefaultValueSql("(getdate())")
        //        .HasColumnName("updated_at");
        //    entity.Property(e => e.Voltage)
        //        .HasColumnType("decimal(5, 2)")
        //        .HasColumnName("voltage");

        //    entity.HasOne(d => d.Item).WithOne(p => p.BatteryDetail)
        //        .HasForeignKey<BatteryDetail>(d => d.ItemId)
        //        .OnDelete(DeleteBehavior.ClientSetNull)
        //        .HasConstraintName("FK__Battery_D__item___4BAC3F29");
        //});

        //modelBuilder.Entity<Bid>(entity =>
        //{
        //    entity.HasKey(e => e.BidId).HasName("PK__Bids__3DF045961D4B2A98");

        //    entity.HasIndex(e => new { e.BiddingId, e.BidAmount }, "idx_bidding_amount").IsDescending(false, true);

        //    entity.HasIndex(e => new { e.BiddingId, e.UserId }, "idx_bidding_user");

        //    entity.Property(e => e.BidId).HasColumnName("bid_id");
        //    entity.Property(e => e.BidAmount)
        //        .HasColumnType("decimal(18, 2)")
        //        .HasColumnName("bid_amount");
        //    entity.Property(e => e.BidTime)
        //        .HasDefaultValueSql("(getdate())")
        //        .HasColumnType("datetime")
        //        .HasColumnName("bid_time");
        //    entity.Property(e => e.BiddingId).HasColumnName("bidding_id");
        //    entity.Property(e => e.UserId).HasColumnName("user_id");

        //    entity.HasOne(d => d.Bidding).WithMany(p => p.Bids)
        //        .HasForeignKey(d => d.BiddingId)
        //        .HasConstraintName("FK__Bids__bidding_id__07C12930");

        //    entity.HasOne(d => d.User).WithMany(p => p.Bids)
        //        .HasForeignKey(d => d.UserId)
        //        .OnDelete(DeleteBehavior.ClientSetNull)
        //        .HasConstraintName("FK__Bids__user_id__08B54D69");
        //});

        //modelBuilder.Entity<Blog>(entity =>
        //{
        //    entity.HasKey(e => e.BlogId).HasName("PK__Blogs__2975AA28D56D655A");

        //    entity.Property(e => e.BlogId).HasColumnName("blog_id");
        //    entity.Property(e => e.Author)
        //        .HasMaxLength(100)
        //        .HasColumnName("author");
        //    entity.Property(e => e.Category)
        //        .HasMaxLength(100)
        //        .HasColumnName("category");
        //    entity.Property(e => e.Content).HasColumnName("content");
        //    entity.Property(e => e.PublishDate).HasColumnName("publish_date");
        //    entity.Property(e => e.Summary).HasColumnName("summary");
        //    entity.Property(e => e.Tags)
        //        .HasMaxLength(255)
        //        .HasColumnName("tags");
        //    entity.Property(e => e.ThumbnailUrl)
        //        .HasMaxLength(255)
        //        .HasColumnName("thumbnail_url");
        //    entity.Property(e => e.Title)
        //        .HasMaxLength(255)
        //        .HasColumnName("title");
        //});

        //modelBuilder.Entity<Category>(entity =>
        //{
        //    entity.HasKey(e => e.CategoryId).HasName("PK__Category__D54EE9B475D157A4");

        //    entity.ToTable("Category");

        //    entity.HasIndex(e => e.Name, "UQ__Category__72E12F1BCBDF415D").IsUnique();

        //    entity.Property(e => e.CategoryId).HasColumnName("category_id");
        //    entity.Property(e => e.Description).HasColumnName("description");
        //    entity.Property(e => e.Name)
        //        .HasMaxLength(100)
        //        .HasColumnName("name");
        //});

        //modelBuilder.Entity<EvDetail>(entity =>
        //{
        //    entity.HasKey(e => e.ItemId).HasName("PK__EV_Detai__52020FDDFEEACF69");

        //    entity.ToTable("EV_Detail");

        //    entity.HasIndex(e => e.LicensePlate, "UQ__EV_Detai__F72CD56E5C094F7E").IsUnique();

        //    entity.Property(e => e.ItemId)
        //        .ValueGeneratedNever()
        //        .HasColumnName("item_id");
        //    entity.Property(e => e.BodyStyle)
        //        .HasMaxLength(100)
        //        .IsUnicode(false)
        //        .HasColumnName("body_style");
        //    entity.Property(e => e.Brand)
        //        .HasMaxLength(100)
        //        .HasColumnName("brand");
        //    entity.Property(e => e.Color)
        //        .HasMaxLength(50)
        //        .IsUnicode(false)
        //        .HasColumnName("color");
        //    entity.Property(e => e.HasAccessories)
        //        .HasDefaultValue(false)
        //        .HasColumnName("has_accessories");
        //    entity.Property(e => e.IsRegistrationValid)
        //        .HasDefaultValue(false)
        //        .HasColumnName("is_registration_valid");
        //    entity.Property(e => e.LicensePlate)
        //        .HasMaxLength(20)
        //        .IsUnicode(false)
        //        .HasColumnName("license_plate");
        //    entity.Property(e => e.Mileage).HasColumnName("mileage");
        //    entity.Property(e => e.Model)
        //        .HasMaxLength(100)
        //        .HasColumnName("model");
        //    entity.Property(e => e.PreviousOwners)
        //        .HasDefaultValue(1)
        //        .HasColumnName("previous_owners");
        //    entity.Property(e => e.UpdatedAt)
        //        .HasDefaultValueSql("(getdate())")
        //        .HasColumnName("updated_at");
        //    entity.Property(e => e.Version)
        //        .HasMaxLength(255)
        //        .HasColumnName("version");
        //    entity.Property(e => e.Year).HasColumnName("year");

        //    entity.HasOne(d => d.Item).WithOne(p => p.EvDetail)
        //        .HasForeignKey<EvDetail>(d => d.ItemId)
        //        .OnDelete(DeleteBehavior.ClientSetNull)
        //        .HasConstraintName("FK__EV_Detail__item___47DBAE45");
        //});

        //modelBuilder.Entity<Favorite>(entity =>
        //{
        //    entity.HasKey(e => e.FavId).HasName("PK__Favorite__37AAF6FE7205E29C");

        //    entity.ToTable("Favorite");

        //    entity.Property(e => e.FavId).HasColumnName("fav_id");
        //    entity.Property(e => e.CreatedAt)
        //        .HasDefaultValueSql("(getdate())")
        //        .HasColumnName("created_at");
        //    entity.Property(e => e.ItemId).HasColumnName("item_id");
        //    entity.Property(e => e.UserId).HasColumnName("user_id");

        //    entity.HasOne(d => d.Item).WithMany(p => p.Favorites)
        //        .HasForeignKey(d => d.ItemId)
        //        .OnDelete(DeleteBehavior.ClientSetNull)
        //        .HasConstraintName("FK__Favorite__item_i__534D60F1");

        //    entity.HasOne(d => d.User).WithMany(p => p.Favorites)
        //        .HasForeignKey(d => d.UserId)
        //        .OnDelete(DeleteBehavior.ClientSetNull)
        //        .HasConstraintName("FK__Favorite__user_i__52593CB8");
        //});

        //modelBuilder.Entity<Item>(entity =>
        //{
        //    entity.HasKey(e => e.ItemId).HasName("PK__Item__52020FDDE3A0A004");

        //    entity.ToTable("Item");

        //    entity.Property(e => e.ItemId).HasColumnName("item_id");
        //    entity.Property(e => e.CategoryId).HasColumnName("category_id");
        //    entity.Property(e => e.CreatedAt)
        //        .HasDefaultValueSql("(getdate())")
        //        .HasColumnName("created_at");
        //    entity.Property(e => e.Description).HasColumnName("description");
        //    entity.Property(e => e.IsDeleted)
        //        .HasDefaultValue(false)
        //        .HasColumnName("is_deleted");
        //    entity.Property(e => e.ItemType)
        //        .HasMaxLength(20)
        //        .HasColumnName("item_type");
        //    entity.Property(e => e.Price)
        //        .HasColumnType("decimal(18, 2)")
        //        .HasColumnName("price");
        //    entity.Property(e => e.Quantity)
        //        .HasDefaultValue(1)
        //        .HasColumnName("quantity");
        //    entity.Property(e => e.Status)
        //        .HasMaxLength(20)
        //        .HasColumnName("status");
        //    entity.Property(e => e.Title)
        //        .HasMaxLength(200)
        //        .HasColumnName("title");
        //    entity.Property(e => e.UpdatedAt)
        //        .HasDefaultValueSql("(getdate())")
        //        .HasColumnName("updated_at");
        //    entity.Property(e => e.UpdatedBy).HasColumnName("updated_by");

        //    entity.HasOne(d => d.Category).WithMany(p => p.Items)
        //        .HasForeignKey(d => d.CategoryId)
        //        .HasConstraintName("FK__Item__category_i__3F466844");

        //    entity.HasOne(d => d.UpdatedByNavigation).WithMany(p => p.Items)
        //        .HasForeignKey(d => d.UpdatedBy)
        //        .HasConstraintName("FK__Item__updated_by__403A8C7D");
        //});

        //modelBuilder.Entity<ItemBidding>(entity =>
        //{
        //    entity.HasKey(e => e.BiddingId).HasName("PK__Item_Bid__5C3BD3C5EF131C43");

        //    entity.ToTable("Item_Bidding");

        //    entity.HasIndex(e => e.ItemId, "UQ__Item_Bid__52020FDC03D0B220").IsUnique();

        //    entity.Property(e => e.BiddingId).HasColumnName("bidding_id");
        //    entity.Property(e => e.CreatedAt)
        //        .HasDefaultValueSql("(getdate())")
        //        .HasColumnType("datetime")
        //        .HasColumnName("created_at");
        //    entity.Property(e => e.CurrentPrice)
        //        .HasColumnType("decimal(18, 2)")
        //        .HasColumnName("current_price");
        //    entity.Property(e => e.EndTime)
        //        .HasColumnType("datetime")
        //        .HasColumnName("end_time");
        //    entity.Property(e => e.ItemId).HasColumnName("item_id");
        //    entity.Property(e => e.StartTime)
        //        .HasColumnType("datetime")
        //        .HasColumnName("start_time");
        //    entity.Property(e => e.StartingPrice)
        //        .HasColumnType("decimal(18, 2)")
        //        .HasColumnName("starting_price");
        //    entity.Property(e => e.Status)
        //        .HasMaxLength(20)
        //        .HasDefaultValue("active")
        //        .HasColumnName("status");

        //    entity.HasOne(d => d.Item).WithOne(p => p.ItemBidding)
        //        .HasForeignKey<ItemBidding>(d => d.ItemId)
        //        .HasConstraintName("FK__Item_Bidd__item___03F0984C");
        //});

        //modelBuilder.Entity<ItemImage>(entity =>
        //{
        //    entity.HasKey(e => e.ImageId).HasName("PK__Item_Ima__DC9AC955E74EA536");

        //    entity.ToTable("Item_Image");

        //    entity.Property(e => e.ImageId).HasColumnName("image_id");
        //    entity.Property(e => e.ImageUrl)
        //        .HasMaxLength(500)
        //        .HasColumnName("image_url");
        //    entity.Property(e => e.ItemId).HasColumnName("item_id");

        //    entity.HasOne(d => d.Item).WithMany(p => p.ItemImages)
        //        .HasForeignKey(d => d.ItemId)
        //        .OnDelete(DeleteBehavior.ClientSetNull)
        //        .HasConstraintName("FK__Item_Imag__item___4E88ABD4");
        //});

        //modelBuilder.Entity<KycDocument>(entity =>
        //{
        //    entity.HasKey(e => e.DocId).HasName("PK__KYC_Docu__8AD02924D8333BD8");

        //    entity.ToTable("KYC_Document");

        //    entity.Property(e => e.DocId).HasColumnName("doc_id");
        //    entity.Property(e => e.DocType)
        //        .HasMaxLength(50)
        //        .HasColumnName("doc_type");
        //    entity.Property(e => e.DocUrl)
        //        .HasMaxLength(500)
        //        .HasColumnName("doc_url");
        //    entity.Property(e => e.Note).HasColumnName("note");
        //    entity.Property(e => e.Status)
        //        .HasMaxLength(20)
        //        .HasDefaultValue("pending")
        //        .HasColumnName("status");
        //    entity.Property(e => e.SubmittedAt)
        //        .HasDefaultValueSql("(getdate())")
        //        .HasColumnType("datetime")
        //        .HasColumnName("submitted_at");
        //    entity.Property(e => e.UserId).HasColumnName("user_id");
        //    entity.Property(e => e.VerifiedAt)
        //        .HasColumnType("datetime")
        //        .HasColumnName("verified_at");
        //    entity.Property(e => e.VerifiedBy).HasColumnName("verified_by");

        //    entity.HasOne(d => d.User).WithMany(p => p.KycDocumentUsers)
        //        .HasForeignKey(d => d.UserId)
        //        .OnDelete(DeleteBehavior.ClientSetNull)
        //        .HasConstraintName("FK__KYC_Docum__user___7A672E12");

        //    entity.HasOne(d => d.VerifiedByNavigation).WithMany(p => p.KycDocumentVerifiedByNavigations)
        //        .HasForeignKey(d => d.VerifiedBy)
        //        .HasConstraintName("FK__KYC_Docum__verif__7B5B524B");
        //});

        //modelBuilder.Entity<Order>(entity =>
        //{
        //    entity.HasKey(e => e.OrderId).HasName("PK__Orders__465962294CC5A1D2");

        //    entity.Property(e => e.OrderId).HasColumnName("order_id");
        //    entity.Property(e => e.AddressId).HasColumnName("address_id");
        //    entity.Property(e => e.BuyerId).HasColumnName("buyer_id");
        //    entity.Property(e => e.CreatedAt)
        //        .HasDefaultValueSql("(getdate())")
        //        .HasColumnName("created_at");
        //    entity.Property(e => e.Status)
        //        .HasMaxLength(20)
        //        .HasColumnName("status");
        //    entity.Property(e => e.UpdatedAt)
        //        .HasDefaultValueSql("(getdate())")
        //        .HasColumnName("updated_at");

        //    entity.HasOne(d => d.Address).WithMany(p => p.Orders)
        //        .HasForeignKey(d => d.AddressId)
        //        .OnDelete(DeleteBehavior.ClientSetNull)
        //        .HasConstraintName("FK__Orders__address___59FA5E80");

        //    entity.HasOne(d => d.Buyer).WithMany(p => p.Orders)
        //        .HasForeignKey(d => d.BuyerId)
        //        .OnDelete(DeleteBehavior.ClientSetNull)
        //        .HasConstraintName("FK__Orders__buyer_id__59063A47");
        //});

        //modelBuilder.Entity<OrderItem>(entity =>
        //{
        //    entity.HasKey(e => e.OrderItemId).HasName("PK__Order_It__3764B6BC0E431B17");

        //    entity.ToTable("Order_Item");

        //    entity.Property(e => e.OrderItemId).HasColumnName("order_item_id");
        //    entity.Property(e => e.ItemId).HasColumnName("item_id");
        //    entity.Property(e => e.OrderId).HasColumnName("order_id");
        //    entity.Property(e => e.Price)
        //        .HasColumnType("decimal(18, 2)")
        //        .HasColumnName("price");
        //    entity.Property(e => e.Quantity)
        //        .HasDefaultValue(1)
        //        .HasColumnName("quantity");

        //    entity.HasOne(d => d.Item).WithMany(p => p.OrderItems)
        //        .HasForeignKey(d => d.ItemId)
        //        .OnDelete(DeleteBehavior.ClientSetNull)
        //        .HasConstraintName("FK__Order_Ite__item___5EBF139D");

        //    entity.HasOne(d => d.Order).WithMany(p => p.OrderItems)
        //        .HasForeignKey(d => d.OrderId)
        //        .OnDelete(DeleteBehavior.ClientSetNull)
        //        .HasConstraintName("FK__Order_Ite__order__5DCAEF64");
        //});

        //modelBuilder.Entity<Payment>(entity =>
        //{
        //    entity.HasKey(e => e.PaymentId).HasName("PK__Payment__ED1FC9EAA8679B03");

        //    entity.ToTable("Payment");

        //    entity.HasIndex(e => e.OrderCode, "UQ__Payment__99D12D3F05355D24").IsUnique();

        //    entity.Property(e => e.PaymentId).HasColumnName("payment_id");
        //    entity.Property(e => e.CreatedAt)
        //        .HasDefaultValueSql("(getdate())")
        //        .HasColumnType("datetime")
        //        .HasColumnName("created_at");
        //    entity.Property(e => e.Currency)
        //        .HasMaxLength(10)
        //        .HasDefaultValue("VND")
        //        .HasColumnName("currency");
        //    entity.Property(e => e.ExpiredAt)
        //        .HasColumnType("datetime")
        //        .HasColumnName("expired_at");
        //    entity.Property(e => e.Method)
        //        .HasMaxLength(50)
        //        .HasColumnName("method");
        //    entity.Property(e => e.OrderCode).HasColumnName("order_code");
        //    entity.Property(e => e.Status)
        //        .HasMaxLength(20)
        //        .HasColumnName("status");
        //    entity.Property(e => e.TotalAmount)
        //        .HasColumnType("decimal(18, 2)")
        //        .HasColumnName("total_amount");
        //    entity.Property(e => e.UpdatedAt)
        //        .HasDefaultValueSql("(getdate())")
        //        .HasColumnType("datetime")
        //        .HasColumnName("updated_at");
        //    entity.Property(e => e.UserId).HasColumnName("user_id");

        //    entity.HasOne(d => d.User).WithMany(p => p.Payments)
        //        .HasForeignKey(d => d.UserId)
        //        .OnDelete(DeleteBehavior.ClientSetNull)
        //        .HasConstraintName("FK__Payment__user_id__66603565");
        //});

        //modelBuilder.Entity<PaymentDetail>(entity =>
        //{
        //    entity.HasKey(e => e.PaymentDetailId).HasName("PK__Payment___C66E6E36E9E2A3A2");

        //    entity.ToTable("Payment_Detail");

        //    entity.Property(e => e.PaymentDetailId).HasColumnName("payment_detail_id");
        //    entity.Property(e => e.Amount)
        //        .HasColumnType("decimal(18, 2)")
        //        .HasColumnName("amount");
        //    entity.Property(e => e.ItemId).HasColumnName("item_id");
        //    entity.Property(e => e.OrderId).HasColumnName("order_id");
        //    entity.Property(e => e.PaymentId).HasColumnName("payment_id");

        //    entity.HasOne(d => d.Item).WithMany(p => p.PaymentDetails)
        //        .HasForeignKey(d => d.ItemId)
        //        .HasConstraintName("FK__Payment_D__item___1AD3FDA4");

        //    entity.HasOne(d => d.Order).WithMany(p => p.PaymentDetails)
        //        .HasForeignKey(d => d.OrderId)
        //        .HasConstraintName("FK__Payment_D__order__19DFD96B");

        //    entity.HasOne(d => d.Payment).WithMany(p => p.PaymentDetails)
        //        .HasForeignKey(d => d.PaymentId)
        //        .OnDelete(DeleteBehavior.ClientSetNull)
        //        .HasConstraintName("FK__Payment_D__payme__18EBB532");
        //});

        //modelBuilder.Entity<Review>(entity =>
        //{
        //    entity.HasKey(e => e.ReviewId).HasName("PK__Review__60883D90B4F3EC91");

        //    entity.ToTable("Review");

        //    entity.Property(e => e.ReviewId).HasColumnName("review_id");
        //    entity.Property(e => e.Comment)
        //        .HasColumnType("text")
        //        .HasColumnName("comment");
        //    entity.Property(e => e.CreatedAt)
        //        .HasDefaultValueSql("(getdate())")
        //        .HasColumnName("created_at");
        //    entity.Property(e => e.Rating).HasColumnName("rating");
        //    entity.Property(e => e.ReviewerId).HasColumnName("reviewer_id");
        //    entity.Property(e => e.TargetUserId).HasColumnName("target_user_id");
        //    entity.Property(e => e.UpdatedAt)
        //        .HasDefaultValueSql("(getdate())")
        //        .HasColumnName("updated_at");

        //    entity.HasOne(d => d.Reviewer).WithMany(p => p.ReviewReviewers)
        //        .HasForeignKey(d => d.ReviewerId)
        //        .OnDelete(DeleteBehavior.ClientSetNull)
        //        .HasConstraintName("FK__Review__reviewer__6C190EBB");

        //    entity.HasOne(d => d.TargetUser).WithMany(p => p.ReviewTargetUsers)
        //        .HasForeignKey(d => d.TargetUserId)
        //        .OnDelete(DeleteBehavior.ClientSetNull)
        //        .HasConstraintName("FK__Review__target_u__6D0D32F4");
        //});

        //modelBuilder.Entity<ReviewImage>(entity =>
        //{
        //    entity.HasKey(e => e.ImageId).HasName("PK__Review_I__DC9AC95522FFE06C");

        //    entity.ToTable("Review_Image");

        //    entity.Property(e => e.ImageId).HasColumnName("image_id");
        //    entity.Property(e => e.ImageUrl)
        //        .HasMaxLength(500)
        //        .HasColumnName("image_url");
        //    entity.Property(e => e.ReviewId).HasColumnName("review_id");

        //    entity.HasOne(d => d.Review).WithMany(p => p.ReviewImages)
        //        .HasForeignKey(d => d.ReviewId)
        //        .OnDelete(DeleteBehavior.ClientSetNull)
        //        .HasConstraintName("FK__Review_Im__revie__6FE99F9F");
        //});

        //modelBuilder.Entity<User>(entity =>
        //{
        //    entity.HasKey(e => e.UserId).HasName("PK__Users__B9BE370FE6A6BBD4");

        //    entity.HasIndex(e => e.Email, "UQ__Users__AB6E616425AC3495").IsUnique();

        //    entity.Property(e => e.UserId)
        //        .ValueGeneratedNever()
        //        .HasColumnName("user_id");
        //    entity.Property(e => e.AccountStatus)
        //        .HasMaxLength(20)
        //        .HasDefaultValue("active")
        //        .HasColumnName("account_status");
        //    entity.Property(e => e.AvatarProfile)
        //        .HasMaxLength(500)
        //        .HasDefaultValueSql("(NULL)")
        //        .HasColumnName("avatar_profile");
        //    entity.Property(e => e.CreatedAt)
        //        .HasDefaultValueSql("(getdate())")
        //        .HasColumnName("created_at");
        //    entity.Property(e => e.Email)
        //        .HasMaxLength(100)
        //        .HasColumnName("email");
        //    entity.Property(e => e.FullName)
        //        .HasMaxLength(100)
        //        .HasColumnName("full_name");
        //    entity.Property(e => e.Gender)
        //        .HasMaxLength(50)
        //        .HasColumnName("gender");
        //    entity.Property(e => e.IsDeleted)
        //        .HasDefaultValue(false)
        //        .HasColumnName("is_deleted");
        //    entity.Property(e => e.KycStatus)
        //        .HasMaxLength(20)
        //        .HasDefaultValue("not_submitted")
        //        .HasColumnName("kyc_status");
        //    entity.Property(e => e.PasswordHash)
        //        .HasMaxLength(255)
        //        .HasColumnName("password_hash");
        //    entity.Property(e => e.Phone)
        //        .HasMaxLength(20)
        //        .HasColumnName("phone");
        //    entity.Property(e => e.Role)
        //        .HasMaxLength(20)
        //        .HasColumnName("role");
        //    entity.Property(e => e.UpdatedAt)
        //        .HasDefaultValueSql("(getdate())")
        //        .HasColumnName("updated_at");
        //    entity.Property(e => e.YearOfBirth)
        //        .HasDefaultValueSql("(NULL)")
        //        .HasColumnName("year_of_birth");
        //});

        //modelBuilder.Entity<UserLog>(entity =>
        //{
        //    entity.HasKey(e => e.LogId).HasName("PK__User_Log__9E2397E01E37EDEB");

        //    entity.ToTable("User_Log");

        //    entity.Property(e => e.LogId).HasColumnName("log_id");
        //    entity.Property(e => e.Action)
        //        .HasMaxLength(200)
        //        .HasColumnName("action");
        //    entity.Property(e => e.CreatedAt)
        //        .HasDefaultValueSql("(getdate())")
        //        .HasColumnName("created_at");
        //    entity.Property(e => e.Details).HasColumnName("details");
        //    entity.Property(e => e.UserId).HasColumnName("user_id");

        //    entity.HasOne(d => d.User).WithMany(p => p.UserLogs)
        //        .HasForeignKey(d => d.UserId)
        //        .OnDelete(DeleteBehavior.ClientSetNull)
        //        .HasConstraintName("FK__User_Log__user_i__73BA3083");
        //});

        //modelBuilder.Entity<Wallet>(entity =>
        //{
        //    entity.HasKey(e => e.WalletId).HasName("PK__Wallet__0EE6F041A32C537B");

        //    entity.ToTable("Wallet");

        //    entity.HasIndex(e => e.UserId, "UQ__Wallet__B9BE370EE0137BF7").IsUnique();

        //    entity.Property(e => e.WalletId).HasColumnName("wallet_id");
        //    entity.Property(e => e.Balance)
        //        .HasColumnType("decimal(18, 2)")
        //        .HasColumnName("balance");
        //    entity.Property(e => e.Currency)
        //        .HasMaxLength(10)
        //        .HasDefaultValue("VND")
        //        .HasColumnName("currency");
        //    entity.Property(e => e.Status)
        //        .HasMaxLength(20)
        //        .HasDefaultValue("active")
        //        .HasColumnName("status");
        //    entity.Property(e => e.UpdatedAt)
        //        .HasDefaultValueSql("(getdate())")
        //        .HasColumnType("datetime")
        //        .HasColumnName("updated_at");
        //    entity.Property(e => e.UserId).HasColumnName("user_id");

        //    entity.HasOne(d => d.User).WithOne(p => p.Wallet)
        //        .HasForeignKey<Wallet>(d => d.UserId)
        //        .HasConstraintName("FK__Wallet__user_id__114A936A");
        //});

        //modelBuilder.Entity<WalletTransaction>(entity =>
        //{
        //    entity.HasKey(e => e.TransactionId).HasName("PK__Wallet_T__85C600AF15416D38");

        //    entity.ToTable("Wallet_Transaction");

        //    entity.Property(e => e.TransactionId).HasColumnName("transaction_id");
        //    entity.Property(e => e.Amount)
        //        .HasColumnType("decimal(18, 2)")
        //        .HasColumnName("amount");
        //    entity.Property(e => e.CreatedAt)
        //        .HasDefaultValueSql("(getdate())")
        //        .HasColumnType("datetime")
        //        .HasColumnName("created_at");
        //    entity.Property(e => e.RefId).HasColumnName("ref_id");
        //    entity.Property(e => e.Type)
        //        .HasMaxLength(20)
        //        .HasColumnName("type");
        //    entity.Property(e => e.WalletId).HasColumnName("wallet_id");

        //    entity.HasOne(d => d.Wallet).WithMany(p => p.WalletTransactions)
        //        .HasForeignKey(d => d.WalletId)
        //        .OnDelete(DeleteBehavior.ClientSetNull)
        //        .HasConstraintName("FK__Wallet_Tr__walle__160F4887");
        //});

        //OnModelCreatingPartial(modelBuilder);

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

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
