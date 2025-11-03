using Application.DTOs.ItemDtos.BatteryDto;
using Application.DTOs.UserDtos;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.ItemDtos;

public class ItemWithSellerResult
{
    public required UserDto Seller { get; set; }
    public required Item Item{ get; set; } 
    public EVDetailDto? EVDetail { get; set; }
    public BatteryDetailDto? BatteryDetail { get; set; }
    public List<ItemImageDto> Images { get; set; } = new();
}
