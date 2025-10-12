using System;
using System.Collections.Generic;

namespace Domain.Entities;

public class Favorite
{
    public int FavId { get; set; }

    public int UserId { get; set; }

    public int ItemId { get; set; }

    public DateOnly? CreatedAt { get; set; }

}
