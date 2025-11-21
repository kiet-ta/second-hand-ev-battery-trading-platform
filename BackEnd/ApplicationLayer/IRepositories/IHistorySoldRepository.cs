using Application.DTOs;
using Application.DTOs.ItemDtos;
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

        Task<List<EVItemDto>> MapToEVItemsAsync(List<Item> evItems);
        Task<List<EVItemDto>> MapToEVItemsAsync(IQueryable<Item> evItemsQuery);

        Task<List<Item>> GetAllSellerItemsAsync(int sellerId);
        IQueryable<Item> GetAllSellerItemsQueryable(int sellerId);
        Task<List<BatteryItemDto>> MapToBatteryItemsAsync(List<Item> batteryItems);
        Task<List<BatteryItemDto>> MapToBatteryItemsAsync(IQueryable<Item> batteryItemsQuery);
        Task<List<Item>> GetCanceledItemsAsync(int sellerId);
    }
}