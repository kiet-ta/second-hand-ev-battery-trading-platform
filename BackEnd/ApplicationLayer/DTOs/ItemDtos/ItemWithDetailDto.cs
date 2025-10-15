﻿using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.ItemDtos
{
    public class ItemWithDetailDto
    {
        public int ItemId { get; set; }
        public string? Title { get; set; }
        public string? ItemType { get; set; }
        public int? CategoryId { get; set; }
        public string? Description { get; set; }
        public decimal? Price { get; set; }
        public int? Quantity { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public int? UpdatedBy { get; set; }

        // Quan hệ phụ
        public ItemImage? ItemImage { get; set; }
        public EVDetail? EVDetail { get; set; }
        public BatteryDetail? BatteryDetail { get; set; }
    }
}
