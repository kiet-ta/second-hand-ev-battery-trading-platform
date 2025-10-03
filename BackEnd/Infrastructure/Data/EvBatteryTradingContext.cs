using Domain.Entities;
using Infrastructure.Data.Configurations;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;

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

    public DbSet<BatteryDetail> BatteryDetails { get; set; }

    public  DbSet<Blog> Blogs { get; set; }

    public DbSet<Category> Categories { get; set; }

    public DbSet<EvDetail> EvDetails { get; set; }

    public DbSet<Favorite> Favorites { get; set; }

    public DbSet<Item> Items { get; set; }

    public DbSet<ItemImage> ItemImages { get; set; }

    public DbSet<KycDocument> KycDocuments { get; set; }

    public DbSet<Order> Orders { get; set; }

    public DbSet<OrderItem> OrderItems { get; set; }

    public DbSet<Payment> Payments { get; set; }

    public DbSet<Review> Reviews { get; set; }

    public DbSet<ReviewImage> ReviewImages { get; set; }

    public DbSet<User> Users { get; set; }

    public DbSet<UserLog> UserLogs { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        //modelBuilder.Entity<Address>(entity =>
        //{
        //    entity.HasKey(e => e.AddressId).HasName("PK__Address__CAA247C8683ADAD5");

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
        //    entity.HasKey(e => e.ItemId).HasName("PK__Battery___52020FDD5AD84C38");

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

        //modelBuilder.Entity<Blog>(entity =>
        //{
        //    entity.HasKey(e => e.BlogId).HasName("PK__Blogs__2975AA28A967B9A7");

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
        //    entity.HasKey(e => e.CategoryId).HasName("PK__Category__D54EE9B481CE1CA9");

        //    entity.ToTable("Category");

        //    entity.HasIndex(e => e.Name, "UQ__Category__72E12F1B74B05961").IsUnique();

        //    entity.Property(e => e.CategoryId).HasColumnName("category_id");
        //    entity.Property(e => e.Description).HasColumnName("description");
        //    entity.Property(e => e.Name)
        //        .HasMaxLength(100)
        //        .HasColumnName("name");
        //});

        //modelBuilder.Entity<EvDetail>(entity =>
        //{
        //    entity.HasKey(e => e.ItemId).HasName("PK__EV_Detai__52020FDD1269DAF7");

        //    entity.ToTable("EV_Detail");

        //    entity.HasIndex(e => e.LicensePlate, "UQ__EV_Detai__F72CD56E33920A4E").IsUnique();

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
        //    entity.HasKey(e => e.FavId).HasName("PK__Favorite__37AAF6FE1E4927A2");

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
        //    entity.HasKey(e => e.ItemId).HasName("PK__Item__52020FDDE066F744");

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

        //modelBuilder.Entity<ItemImage>(entity =>
        //{
        //    entity.HasKey(e => e.ImageId).HasName("PK__Item_Ima__DC9AC955331CD3AA");

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
        //    entity.HasKey(e => e.DocId).HasName("PK__KYC_Docu__8AD0292418E93900");

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
        //    entity.HasKey(e => e.OrderId).HasName("PK__Orders__4659622997BAF383");

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
        //    entity.HasKey(e => e.OrderItemId).HasName("PK__Order_It__3764B6BCB90010EF");

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

        //  entity.HasOne(d => d.Order).WithMany(p => p.OrderItems)
        //    .HasForeignKey(d => d.OrderId)
        //    .OnDelete(DeleteBehavior.ClientSetNull)
        //    .HasConstraintName("FK__Order_Ite__order__5DCAEF64");
        //});

        //modelBuilder.Entity<Payment>(entity =>
        //{
        //    entity.HasKey(e => e.PaymentId).HasName("PK__Payment__ED1FC9EA80C84872");

        //    entity.ToTable("Payment");

        //    entity.Property(e => e.PaymentId).HasColumnName("payment_id");
        //    entity.Property(e => e.BuyerId).HasColumnName("buyer_id");
        //    entity.Property(e => e.Method)
        //        .HasMaxLength(50)
        //        .HasColumnName("method");
        //    entity.Property(e => e.OrderId).HasColumnName("order_id");
        //    entity.Property(e => e.PaidAt)
        //        .HasColumnType("datetime")
        //        .HasColumnName("paid_at");
        //    entity.Property(e => e.SellerId).HasColumnName("seller_id");
        //    entity.Property(e => e.Status)
        //        .HasMaxLength(20)
        //        .HasColumnName("status");
        //    entity.Property(e => e.UpdatedAt)
        //        .HasDefaultValueSql("(getdate())")
        //        .HasColumnName("updated_at");

        //    entity.HasOne(d => d.Buyer).WithMany(p => p.PaymentBuyers)
        //        .HasForeignKey(d => d.BuyerId)
        //        .OnDelete(DeleteBehavior.ClientSetNull)
        //        .HasConstraintName("FK__Payment__buyer_i__656C112C");

        //    entity.HasOne(d => d.Order).WithMany(p => p.Payments)
        //        .HasForeignKey(d => d.OrderId)
        //        .OnDelete(DeleteBehavior.ClientSetNull)
        //        .HasConstraintName("FK__Payment__order_i__6477ECF3");

        //    entity.HasOne(d => d.Seller).WithMany(p => p.PaymentSellers)
        //        .HasForeignKey(d => d.SellerId)
        //        .OnDelete(DeleteBehavior.ClientSetNull)
        //        .HasConstraintName("FK__Payment__seller___66603565");
        //});

        //modelBuilder.Entity<Review>(entity =>
        //{
        //    entity.HasKey(e => e.ReviewId).HasName("PK__Review__60883D909B0632ED");

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
        //    entity.HasKey(e => e.ImageId).HasName("PK__Review_I__DC9AC955ACFDBB12");

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
        //    entity.HasKey(e => e.UserId).HasName("PK__Users__B9BE370F6C5317DA");

        //    entity.HasIndex(e => e.Email, "UQ__Users__AB6E61647AC3DCC1").IsUnique();

        //    entity.Property(e => e.UserId).HasColumnName("user_id");
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
        //    entity.HasKey(e => e.LogId).HasName("PK__User_Log__9E2397E0EA56C447");

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

        //OnModelCreatingPartial(modelBuilder);

        modelBuilder.Entity<Item>().Property(i => i.IsDeleted).HasDefaultValue(false);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(EvBatteryTradingContext).Assembly);

        modelBuilder.ApplyConfiguration(new UserConfiguration());
        modelBuilder.ApplyConfiguration(new ItemConfiguration());

        base.OnModelCreating(modelBuilder);
    }

    //partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
