using System;
using System.Collections.Generic;

namespace Domain.Entities;

public class User
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

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public bool? IsDeleted { get; set; }

}
