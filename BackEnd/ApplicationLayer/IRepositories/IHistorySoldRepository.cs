using Application.DTOs;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.IRepositories
{
    public interface IHistorySoldRepository
    {
        Task<User?> GetSellerByIdAsync(int id);
        Task<List<Item>> GetSoldItemsAsync(int sellerId);

        Task<List<Item>> GetPendingPaymentItemsAsync(int sellerId);

        Task<List<Item>> GetProcessingItemsAsync(int sellerId);

        Task<List<EVItemDTO>> MapToEVItemsAsync(List<Item> evItems);

        Task<List<Item>> GetAllSellerItemsAsync(int sellerId);
        Task<List<BatteryItemDTO>> MapToBatteryItemsAsync(List<Item> batteryItems);
    }
}
