using System;
using System.Collections.Generic;

namespace Infrastructure.Data;

public partial class User
{
    public int UserId { get; set; }

    public string FullName { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public string? Gender { get; set; }

    public DateOnly? YearOfBirth { get; set; }

    public string? Phone { get; set; }

    public string? AvatarProfile { get; set; }

    public string Role { get; set; } = null!;

    public string? KycStatus { get; set; }

    public string? AccountStatus { get; set; }

    public DateOnly? CreatedAt { get; set; }

    public DateOnly? UpdatedAt { get; set; }

    public bool? IsDeleted { get; set; }

    public virtual ICollection<Address> Addresses { get; set; } = new List<Address>();

    public virtual ICollection<Favorite> Favorites { get; set; } = new List<Favorite>();

    public virtual ICollection<Item> Items { get; set; } = new List<Item>();

    public virtual ICollection<KycDocument> KycDocumentUsers { get; set; } = new List<KycDocument>();

    public virtual ICollection<KycDocument> KycDocumentVerifiedByNavigations { get; set; } = new List<KycDocument>();

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

    public virtual ICollection<Payment> PaymentBuyers { get; set; } = new List<Payment>();

    public virtual ICollection<Payment> PaymentSellers { get; set; } = new List<Payment>();

    public virtual ICollection<Review> ReviewReviewers { get; set; } = new List<Review>();

    public virtual ICollection<Review> ReviewTargetUsers { get; set; } = new List<Review>();

    public virtual ICollection<UserLog> UserLogs { get; set; } = new List<UserLog>();
}
