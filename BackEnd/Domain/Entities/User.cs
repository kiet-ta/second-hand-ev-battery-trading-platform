using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities;

public class User
{
    public int UserId { get; set; }

    public string FullName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public string? Gender { get; set; }

    public DateOnly? YearOfBirth { get; set; }

    public string? Phone { get; set; }

    public string? AvatarProfile { get; set; }

    public string Role { get; set; } = "Buyer";

    public string KycStatus { get; set; } = "not_submitted";

    public string AccountStatus { get; set; } = "active";

    public DateTime CreatedAt { get; set; } = DateTime.Now;

    public DateTime UpdatedAt { get; set; } = DateTime.Now;

    public bool? IsDeleted { get; set; }
}
