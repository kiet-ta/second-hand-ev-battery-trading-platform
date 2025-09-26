using System;
using System.Collections.Generic;

namespace Domain.Entities;

public partial class InternalUser
{
    public int UserId { get; set; }

    public string Fullname { get; set; } = null!;

    public DateOnly? Dob { get; set; }

    public string Email { get; set; } = null!;

    public string? Address { get; set; }

    public string? Phone { get; set; }

    public string? ProfileImg { get; set; }

    public string PasswordHash { get; set; } = null!;

    public string? Role { get; set; }

    public string? Status { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual ICollection<AdminLog> AdminLogs { get; set; } = new List<AdminLog>();

    public virtual ICollection<KycDocument> KycDocuments { get; set; } = new List<KycDocument>();
}
