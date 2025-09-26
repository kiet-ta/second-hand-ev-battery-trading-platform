using System;
using System.Collections.Generic;

namespace Domain.Entities;

public partial class ExternalUser
{
    public int UserId { get; set; }

    public string Name { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string? Phone { get; set; }
     
    public string PasswordHash { get; set; } = null!;

    public string? Role { get; set; }

    public string? Status { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual ICollection<Battery> Batteries { get; set; } = new List<Battery>();

    public virtual ICollection<Complaint> Complaints { get; set; } = new List<Complaint>();

    public virtual ICollection<KycDocument> KycDocuments { get; set; } = new List<KycDocument>();

    public virtual ICollection<Listing> Listings { get; set; } = new List<Listing>();

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

    public virtual ICollection<Review> ReviewFromUserNavigations { get; set; } = new List<Review>();

    public virtual ICollection<Review> ReviewToUserNavigations { get; set; } = new List<Review>();

    public virtual ICollection<Vehicle> Vehicles { get; set; } = new List<Vehicle>();

    public virtual ICollection<Wishlist> Wishlists { get; set; } = new List<Wishlist>();
}
