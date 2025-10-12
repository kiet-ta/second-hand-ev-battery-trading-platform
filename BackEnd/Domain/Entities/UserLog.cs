using System;
using System.Collections.Generic;

namespace Domain.Entities;

public class UserLog
{
    public int LogId { get; set; }

    public int UserId { get; set; }

    public string? Action { get; set; }

    public string? Details { get; set; }

    public DateOnly? CreatedAt { get; set; }

}
