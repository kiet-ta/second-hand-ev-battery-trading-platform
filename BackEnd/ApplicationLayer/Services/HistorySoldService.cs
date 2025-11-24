using Application.DTOs;
using Application.DTOs.ItemDtos;
using Application.IRepositories;
using Application.IServices;
using Domain.Common.Constants;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Application.Services
{
    public class HistorySoldService : IHistorySoldService
    {
        private readonly IUnitOfWork _unitOfWork;

        public HistorySoldService(IUnitOfWork unitOfWork)
        {

            _unitOfWork = unitOfWork;
        }

        //public async Task<List<object>> GetAllSellerItemsAsync(int sellerId)
        //{
        //    if (sellerId <= 0)
        //        throw new ArgumentException("Invalid seller ID");

        //    var seller = await _unitOfWork.HistorySolds.GetSellerByIdAsync(sellerId);
        //    if (seller == null)
        //        throw new KeyNotFoundException($"Seller with ID {sellerId} not found");

        //    var sold = await GetSoldItemsAsync(sellerId);
        //    var pending = await GetPendingPaymentItemsAsync(sellerId);
        //    var processing = await GetProcessingItemsAsync(sellerId);
        //    var canceled = await GetCanceledItemsAsync(sellerId);

        //    var allItems = await _unitOfWork.HistorySolds.GetAllSellerItemsAsync(sellerId);
        //    if (allItems == null)
        //        throw new Exception("Failed to fetch seller items");

        //    var takenIds = new HashSet<int>(
        //        sold.Select(i => (int)((dynamic)i).ItemId)
        //            .Concat(pending.Select(i => (int)((dynamic)i).ItemId))
        //            .Concat(processing.Select(i => (int)((dynamic)i).ItemId))
        //            .Concat(canceled.Select(i => (int)((dynamic)i).ItemId))
        //    );

        //    var availableItems = allItems.Where(i => !takenIds.Contains(i.ItemId)).ToList();
        //    var mappedAvailable = await MapItemsAsync(availableItems);

        //    foreach (var obj in mappedAvailable)
        //    {
        //        if (obj is BatteryItemDto battery)
        //            battery.Status = "Available";
        //        else if (obj is EVItemDto ev)
        //            ev.Status = "Available";
        //    }

        //    var finalList = new List<object>();
        //    finalList.AddRange(sold);
        //    finalList.AddRange(pending);
        //    finalList.AddRange(processing);
        //    finalList.AddRange(canceled);
        //    finalList.AddRange(mappedAvailable);

        //    return finalList;
        //}
        //public async Task<PagedResultBought<object>> GetAllSellerItemsAsync(int sellerId, PaginationParams pagination)
        //{
        //    if (sellerId <= 0)
        //        throw new ArgumentException("Invalid seller ID");

        //    var seller = await _unitOfWork.HistorySolds.GetSellerByIdAsync(sellerId);

        //    if (seller == null)
        //        throw new KeyNotFoundException($"Seller with ID {sellerId} not found");

        //    var allItemsQuery = _unitOfWork.HistorySolds.GetAllSellerItemsQueryable(sellerId);


        //    var totalCount = await allItemsQuery.CountAsync();
        //    if (totalCount == 0)
        //    {
        //        return new PagedResultBought<object>(new List<object>(), 0, pagination.PageNumber, pagination.PageSize);
        //    }

        //    var paginatedItemsQuery = allItemsQuery
        //        .OrderByDescending(i => i.CreatedAt)
        //        .Skip((pagination.PageNumber - 1) * pagination.PageSize)
        //        .Take(pagination.PageSize);

        //    //var mappedItems = await MapItemsAsync(paginatedItemsQuery);

        //    return new PagedResultBought<object>(mappedItems, totalCount, pagination.PageNumber, pagination.PageSize);
        //}

        public async Task<IEnumerable<OrderDetailDto>> GetOrdersBySellerId(int sellerId)
        {
            var listOfOrderDetails = new List<OrderDetailDto>();
            var itemBySellerIds = await _unitOfWork.Items.GetBySellerIdAsync(sellerId);
            var ordersBySellerId = await _unitOfWork.OrderItems.GetOrderItemsByItemIdsAsync(itemBySellerIds.Select(i => i.ItemId));
            foreach (var orderItem in ordersBySellerId)
            {
                var orderDetailDto = new OrderDetailDto();
                var order = await _unitOfWork.Orders.GetByIdAsync(orderItem.OrderId.Value);
                if (await _unitOfWork.WalletTransactions.GetByOrderItemIdAsync(orderItem.OrderId.Value) != null)
                {
                    orderDetailDto.PaymentMethod = "Wallet";

                }
                else if (await _unitOfWork.PaymentDetails.GetByOrderIdAsync(orderItem.OrderId.Value) != null)
                {
                    orderDetailDto.PaymentMethod = "Payment";
                }
                var seller = await _unitOfWork.Users.GetByIdAsync(sellerId);
                var sellerWallet = await _unitOfWork.Wallets.GetWalletByUserIdAsync(sellerId);
                if (sellerWallet == null)
                    throw new Exception($"Không tìm thấy ví cho Seller (ID: {sellerId}).");
                string feeCode;
                if (seller.IsStore) feeCode = "FEESF";
                else feeCode = "FEEPF";
                var commissionRule = await _unitOfWork.CommissionFeeRules.GetByFeeCodeAsync(feeCode);
                if (commissionRule == null)
                    throw new Exception("Không tìm thấy quy tắc hoa hồng 'FEE001'.");
                decimal commissionAmount = 0;
                var totalOrderAmount = orderItem.Price * orderItem.Quantity;
                if (commissionRule.FeeType == CommissionFeeType.Percentage.ToString())
                {
                    commissionAmount = totalOrderAmount * (commissionRule.FeeValue / 100);
                }
                else
                {
                    commissionAmount = commissionRule.FeeValue;
                }

                orderDetailDto.Order = orderItem;
                orderDetailDto.FeeValue = commissionAmount;
                orderDetailDto.TotalAmount = orderItem.Price * orderItem.Quantity - orderDetailDto.FeeValue;
                orderDetailDto.Status = orderItem.Status;

                listOfOrderDetails.Add(orderDetailDto);
            }


            return listOfOrderDetails;
        }


        //public async Task<List<object>> GetProcessingItemsAsync(int sellerId)
        //{
        //    var seller = await _unitOfWork.HistorySolds.GetSellerByIdAsync(sellerId);
        //    if (seller == null)
        //        throw new KeyNotFoundException($"Seller with ID {sellerId} not found");

        //    var items = await _unitOfWork.HistorySolds.GetProcessingItemsAsync(sellerId);
        //    if (items == null)
        //        throw new Exception("Failed to fetch processing items");

        //    var mappedItems = await MapItemsAsync(items);

        //    foreach (var obj in mappedItems)
        //    {
        //        if (obj is BatteryItemDto battery)
        //            battery.Status = "Processing";
        //        else if (obj is EVItemDto ev)
        //            ev.Status = "Processing";
        //    }

        //    return mappedItems;
        //}

        //public async Task<List<object>> GetPendingPaymentItemsAsync(int sellerId)
        //{
        //    var seller = await _unitOfWork.HistorySolds.GetSellerByIdAsync(sellerId);
        //    if (seller == null)
        //        throw new KeyNotFoundException($"Seller with ID {sellerId} not found");

        //    var items = await _unitOfWork.HistorySolds.GetPendingPaymentItemsAsync(sellerId);
        //    if (items == null)
        //        throw new Exception("Failed to fetch pending payment items");

        //    var mappedItems = await MapItemsAsync(items);

        //    foreach (var obj in mappedItems)
        //    {
        //        if (obj is BatteryItemDto battery)
        //            battery.Status = "Pending_Approval";
        //        else if (obj is EVItemDto ev)
        //            ev.Status = "Pending_Approval";
        //    }

        //    return mappedItems;
        //}

        //public async Task<List<object>> GetSoldItemsAsync(int sellerId)
        //{
        //    var seller = await _unitOfWork.HistorySolds.GetSellerByIdAsync(sellerId);
        //    if (seller == null)
        //        throw new KeyNotFoundException($"Seller with ID {sellerId} not found");

        //    var items = await _unitOfWork.HistorySolds.GetSoldItemsAsync(sellerId);
        //    if (items == null)
        //        throw new Exception("Failed to fetch sold items");

        //    var mappedItems = await MapItemsAsync(items);

        //    foreach (var obj in mappedItems)
        //    {
        //        if (obj is BatteryItemDto battery)
        //            battery.Status = "Sold";
        //        else if (obj is EVItemDto ev)
        //            ev.Status = "Sold";
        //    }

        //    return mappedItems;
        //}

        //public async Task<List<object>> GetCanceledItemsAsync(int sellerId)
        //{
        //    var seller = await _unitOfWork.HistorySolds.GetSellerByIdAsync(sellerId);
        //    if (seller == null)
        //        throw new KeyNotFoundException($"Seller with ID {sellerId} not found");

        //    var items = await _unitOfWork.HistorySolds.GetCanceledItemsAsync(sellerId);
        //    if (items == null)
        //        throw new Exception("Failed to fetch canceled items");

        //    var mappedItems = await MapItemsAsync(items);

        //    foreach (var obj in mappedItems)
        //    {
        //        if (obj is BatteryItemDto battery)
        //            battery.Status = "Canceled";
        //        else if (obj is EVItemDto ev)
        //            ev.Status = "Canceled";
        //    }

        //    return mappedItems;
        //}

        //private async Task<List<object>> MapItemsAsync(List<Item> items)
        //{
        //    if (items == null)
        //        throw new ArgumentNullException(nameof(items), "Item list cannot be null");

        //    var result = new List<object>();

        //    var batteryItems = items.Where(i => i.ItemType == ItemType.Battery.ToString()).ToList();
        //    if (batteryItems.Any())
        //    {
        //        var mappedBatteryItems = await _unitOfWork.HistorySolds.MapToBatteryItemsAsync(batteryItems);
        //        if (mappedBatteryItems == null)
        //            throw new Exception("Failed to map battery items");
        //        result.AddRange(mappedBatteryItems);
        //    }

        //    var evItems = items.Where(i => i.ItemType == ItemType.Ev.ToString()).ToList();
        //    if (evItems.Any())
        //    {
        //        var mappedEVItems = await _unitOfWork.HistorySolds.MapToEVItemsAsync(evItems);
        //        if (mappedEVItems == null)
        //            throw new Exception("Failed to map EV items");
        //        result.AddRange(mappedEVItems);
        //    }

        //    return result;
        //}
    }
}