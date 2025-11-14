using Application.DTOs;
using Application.DTOs.ItemDtos;
using Application.IRepositories;
using Domain.Common.Constants;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Infrastructure.Repositories
{
    public class HistorySoldRepository : IHistorySoldRepository
    {
        private readonly EvBatteryTradingContext _context;

        public HistorySoldRepository(EvBatteryTradingContext context)
        {
            _context = context;
        }

        public async Task<User?> GetSellerByIdAsync(int id)
        {
            return await _context.Users
                .Where(u =>
                    u.UserId == id &&
                    u.Role == UserRole.Seller.ToString() &&
                    !(u.IsDeleted == true) &&
                    u.KycStatus == KycStatus.Approved.ToString() &&
                    u.AccountStatus != UserStatus.Ban.ToString()
                )
                .FirstOrDefaultAsync();
        }

        public async Task<List<Item>> GetAllSellerItemsAsync(int sellerId)
        {
            return await _context.Items
                .Where(i => i.UpdatedBy == sellerId && !(i.IsDeleted == true))
                .ToListAsync();
        }
        public IQueryable<Item> GetAllSellerItemsQueryable(int sellerId)
        {
            return _context.Items
                .Where(i => i.UpdatedBy == sellerId && !(i.IsDeleted == true))
                .AsQueryable();
        }

    //    private async Task<List<Item>> GetItemsByOrderStatusAsync(
    //int sellerId,
    //string orderStatus,
    //string itemStatusToReturn)
    //    {
    //        var items = await _context.Items
    //            .Where(item =>
    //                item.UpdatedBy == sellerId &&
    //                !item.IsDeleted &&
    //                _context.OrderItems
    //                    .Join(_context.Orders,
    //                          oi => oi.OrderId,
    //                          o => o.OrderId,
    //                          (oi, o) => new { oi, o })
    //                    .Any(joined =>
    //                        joined.oi.ItemId == item.ItemId &&
    //                        joined.o.Status == orderStatus)
    //            )
    //            .ToListAsync();

    //        foreach (var item in items)
    //        {
    //            item.Status = itemStatusToReturn;
    //        }

    //        return items;
    //    }

    //    public Task<List<Item>> GetPendingItemsAsync(int sellerId)
    //    {
    //        return GetItemsByOrderStatusAsync(sellerId, OrderStatus.Pending.ToString(), "pending");
    //    }
    //    public Task<List<Item>> GetPaidItemsAsync(int sellerId)
    //    {
    //        return GetItemsByOrderStatusAsync(sellerId, OrderStatus.Paid.ToString(), "paid");
    //    }
    //    public Task<List<Item>> GetShippedItemsAsync(int sellerId)
    //    {
    //        return GetItemsByOrderStatusAsync(sellerId, OrderStatus.Shipped.ToString(), "shipped");
    //    }
    //    public Task<List<Item>> GetCompletedItemsAsync(int sellerId)
    //    {
    //        return GetItemsByOrderStatusAsync(sellerId, OrderStatus.Completed.ToString(), "sold");
    //    }
    //    public Task<List<Item>> GetCancelledItemsAsync(int sellerId)
    //    {
    //        return GetItemsByOrderStatusAsync(sellerId, OrderStatus.Cancelled.ToString(), "canceled");
    //    }


#pragma warning disable CS8601

        public async Task<List<BatteryItemDto>> MapToBatteryItemsAsync(List<Item> batteryItems)
        {
            var itemIds = batteryItems.Select(i => i.ItemId).ToList();

            var query = from item in _context.Items
                        where itemIds.Contains(item.ItemId)
                        join battery in _context.BatteryDetails on item.ItemId equals battery.ItemId
                        join img in _context.ItemImages on item.ItemId equals img.ItemId into images
                        from img in images.DefaultIfEmpty()
                        join oi in _context.OrderItems on item.ItemId equals oi.ItemId into orderItems
                        from oi in orderItems.DefaultIfEmpty()
                        join o in _context.Orders on oi.OrderId equals o.OrderId into orders
                        from o in orders.DefaultIfEmpty()
                        join u in _context.Users on o.BuyerId equals u.UserId into buyers
                        from u in buyers.DefaultIfEmpty()
                        join a in _context.Addresses on o.AddressId equals a.AddressId into addresses
                        from a in addresses.DefaultIfEmpty()
                        join pd in _context.PaymentDetails on item.ItemId equals pd.ItemId into payments
                        from pd in payments.DefaultIfEmpty()
                        join p in _context.Payments on pd.PaymentId equals p.PaymentId into paymentList
                        from p in paymentList.DefaultIfEmpty()
                        select new BatteryItemDto
                        {
                            ItemId = item.ItemId,
                            ItemType = item.ItemType,
                            Brand = battery.Brand,
                            Capacity = battery.Capacity,
                            Condition = battery.Condition,
                            Voltage = battery.Voltage,
                            ChargeCycles = battery.ChargeCycles,
                            ListedPrice = item.Price,
                            ActualPrice = pd != null ? pd.Amount : (decimal?)null,
                            PaymentMethod = p != null ? p.Method : null,

                            CreatedAt = item.CreatedAt,
                            SoldAt = item.UpdatedAt,
                            ImageUrl = img != null ? img.ImageUrl : null,

                            Status = o != null ? o.Status : null,

                            Buyer = u != null ? new BuyerDto
                            {
                                BuyerId = u.UserId,
                                FullName = u.FullName,
                                Phone = u.Phone,
                                Address = a != null ? $"{a.Street}, {a.Ward}, {a.District}, {a.Province}" : null
                            } : null,

                            OrderId = o != null ? o.OrderId : (int?)null
                        };


            return await query.ToListAsync();
        }
        public async Task<List<BatteryItemDto>> MapToBatteryItemsAsync(IQueryable<Item> batteryItemsQuery)
        {
            // KHÔNG dùng itemIds và List<Item> nữa
            var query = from item in batteryItemsQuery // Dùng IQueryable được truyền vào
                        join battery in _context.BatteryDetails on item.ItemId equals battery.ItemId
                        //join img in _context.ItemImages on item.ItemId equals img.ItemId into images
                        //from img in images.DefaultIfEmpty()
                        join oi in _context.OrderItems on item.ItemId equals oi.ItemId into orderItems
                        from oi in orderItems.DefaultIfEmpty()
                        join o in _context.Orders on oi.OrderId equals o.OrderId into orders
                        from o in orders.DefaultIfEmpty()
                        join u in _context.Users on o.BuyerId equals u.UserId into buyers
                        from u in buyers.DefaultIfEmpty()
                        join a in _context.Addresses on o.AddressId equals a.AddressId into addresses
                        from a in addresses.DefaultIfEmpty()
                        join pd in _context.PaymentDetails on item.ItemId equals pd.ItemId into payments
                        from pd in payments.DefaultIfEmpty()
                        join p in _context.Payments on pd.PaymentId equals p.PaymentId into paymentList
                        from p in paymentList.DefaultIfEmpty()

                            // Tính toán trạng thái ngay trong query
                        let isSold = _context.OrderItems.Any(pd_s => pd_s.ItemId == item.ItemId && _context.Orders.Any(p_s => p_s.OrderId == pd_s.OrderId && p_s.Status == OrderStatus.Completed.ToString()))
                        let isProcessing = !isSold && _context.OrderItems.Any(oi_p => oi_p.ItemId == item.ItemId && _context.Orders.Any(o_p => o_p.OrderId == oi_p.OrderId && (o_p.Status == OrderStatus.Paid.ToString() || o_p.Status == OrderStatus.Shipped.ToString())))
                        let isPending = !isSold && !isProcessing && _context.OrderItems.Any(pd_pe => pd_pe.ItemId == item.ItemId && _context.Orders.Any(p_pe => p_pe.OrderId == pd_pe.OrderId && p_pe.Status == OrderStatus.Pending.ToString()))
                        let isCanceled = !isSold && !isProcessing && !isPending &&
                                         (_context.PaymentDetails.Any(pd_c => pd_c.ItemId == item.ItemId && _context.Payments.Any(p_c => p_c.PaymentId == pd_c.PaymentId && (p_c.Status == PaymentStatus.Failed.ToString() || p_c.Status == PaymentStatus.Refunded.ToString() || p_c.Status == PaymentStatus.Expired.ToString())))
                                          || _context.OrderItems.Any(oi_c => oi_c.ItemId == item.ItemId && _context.Orders.Any(o_c => o_c.OrderId == oi_c.OrderId && o_c.Status == OrderStatus.Cancelled.ToString())))

                        select new BatteryItemDto
                        {
                            ItemId = item.ItemId,
                            ItemType = item.ItemType,
                            Brand = battery.Brand,
                            Capacity = battery.Capacity,
                            Condition = battery.Condition,
                            Voltage = battery.Voltage,
                            ChargeCycles = battery.ChargeCycles,
                            ListedPrice = item.Price,
                            ActualPrice = pd != null ? pd.Amount : (decimal?)null,
                            PaymentMethod = p != null ? p.Method : null,
                            CreatedAt = item.CreatedAt,
                            SoldAt = item.UpdatedAt,
                            ImageUrl = (from img_ in _context.ItemImages 
                                where img_.ItemId == item.ItemId 
                                select img_.ImageUrl).FirstOrDefault(),
                            Buyer = u != null ? new BuyerDto
                            {
                                BuyerId = u.UserId,
                                FullName = u.FullName,
                                Phone = u.Phone,
                                Address = a != null ? $"{a.Street}, {a.Ward}, {a.District}, {a.Province}" : null
                            } : null,
                            OrderId = o != null ? o.OrderId : (int?)null,

                            // Gán trạng thái đã tính toán
                            Status = isSold ? "sold" :
                                     isProcessing ? "processing" :
                                     isPending ? "pending_approval" :
                                     isCanceled ? "canceled" :
                                     "available"
                        };

            return await query.ToListAsync();
        }

        public async Task<List<EVItemDto>> MapToEVItemsAsync(List<Item> evItems)
        {
            var itemIds = evItems.Select(i => i.ItemId).ToList();

            var query = from item in _context.Items
                        where itemIds.Contains(item.ItemId)
                        join ev in _context.EVDetails on item.ItemId equals ev.ItemId
                        join img in _context.ItemImages on item.ItemId equals img.ItemId into images
                        from img in images.DefaultIfEmpty()
                        join oi in _context.OrderItems on item.ItemId equals oi.ItemId into orderItems
                        from oi in orderItems.DefaultIfEmpty()
                        join o in _context.Orders on oi.OrderId equals o.OrderId into orders
                        from o in orders.DefaultIfEmpty()
                        join u in _context.Users on o.BuyerId equals u.UserId into buyers
                        from u in buyers.DefaultIfEmpty()
                        join a in _context.Addresses on o.AddressId equals a.AddressId into addresses
                        from a in addresses.DefaultIfEmpty()
                        join pd in _context.PaymentDetails on item.ItemId equals pd.ItemId into payments
                        from pd in payments.DefaultIfEmpty()
                        join p in _context.Payments on pd.PaymentId equals p.PaymentId into paymentList
                        from p in paymentList.DefaultIfEmpty()
                        select new EVItemDto
                        {
                            ItemId = item.ItemId,
                            ItemType = item.ItemType,
                            Title = item.Title,
                            LicensePlate = ev.LicensePlate,
                            Mileage = ev.Mileage,
                            Color = ev.Color,
                            Year = ev.Year,
                            ListedPrice = item.Price,
                            ActualPrice = pd != null ? pd.Amount : (decimal?)null,
                            PaymentMethod = p != null ? p.Method : null,
                            Status = o != null ? o.Status : null,

                            CreatedAt = item.CreatedAt,
                            SoldAt = item.UpdatedAt,
                            ImageUrl = img != null ? img.ImageUrl : null,
                            Buyer = u != null ? new BuyerDto
                            {
                                BuyerId = u.UserId,
                                FullName = u.FullName,
                                Phone = u.Phone,
                                Address = a != null ? $"{a.Street}, {a.Ward}, {a.District}, {a.Province}" : null
                            } : null,
                            OrderId = o != null ? o.OrderId : (int?)null
                        };

            return await query.ToListAsync();
        }

        public async Task<List<EVItemDto>> MapToEVItemsAsync(IQueryable<Item> evItemsQuery)
        {
            var query = from item in evItemsQuery
                        join ev in _context.EVDetails on item.ItemId equals ev.ItemId
                        //join img in _context.ItemImages on item.ItemId equals img.ItemId into images
                        //from img in images.DefaultIfEmpty()
                        join oi in _context.OrderItems on item.ItemId equals oi.ItemId into orderItems
                        from oi in orderItems.DefaultIfEmpty()
                        join o in _context.Orders on oi.OrderId equals o.OrderId into orders
                        from o in orders.DefaultIfEmpty()
                        join u in _context.Users on o.BuyerId equals u.UserId into buyers
                        from u in buyers.DefaultIfEmpty()
                        join a in _context.Addresses on o.AddressId equals a.AddressId into addresses
                        from a in addresses.DefaultIfEmpty()
                        join pd in _context.PaymentDetails on item.ItemId equals pd.ItemId into payments
                        from pd in payments.DefaultIfEmpty()
                        join p in _context.Payments on pd.PaymentId equals p.PaymentId into paymentList
                        from p in paymentList.DefaultIfEmpty()

                        let isSold = _context.OrderItems.Any(pd_s => pd_s.ItemId == item.ItemId && _context.Orders.Any(p_s => p_s.OrderId == pd_s.OrderId && p_s.Status == OrderStatus.Completed.ToString()))
                        let isProcessing = !isSold && _context.OrderItems.Any(oi_p => oi_p.ItemId == item.ItemId && _context.Orders.Any(o_p => o_p.OrderId == oi_p.OrderId && (o_p.Status == OrderStatus.Paid.ToString() || o_p.Status == OrderStatus.Shipped.ToString())))
                        let isPending = !isSold && !isProcessing && _context.OrderItems.Any(pd_pe => pd_pe.ItemId == item.ItemId && _context.Orders.Any(p_pe => p_pe.OrderId == pd_pe.OrderId && p_pe.Status == OrderStatus.Shipped.ToString()))
                        let isCanceled = !isSold && !isProcessing && !isPending &&
                                         (_context.PaymentDetails.Any(pd_c => pd_c.ItemId == item.ItemId && _context.Payments.Any(p_c => p_c.PaymentId == pd_c.PaymentId && (p_c.Status == PaymentStatus.Failed.ToString()) || p_c.Status == PaymentStatus.Refunded.ToString() || p_c.Status == PaymentStatus.Expired.ToString()))
                                          || _context.OrderItems.Any(oi_c => oi_c.ItemId == item.ItemId && _context.Orders.Any(o_c => o_c.OrderId == oi_c.OrderId && o_c.Status == OrderStatus.Cancelled.ToString())))

                        select new EVItemDto
                        {
                            ItemId = item.ItemId,
                            ItemType = item.ItemType,
                            Title = item.Title,
                            LicensePlate = ev.LicensePlate,
                            Mileage = ev.Mileage,
                            Color = ev.Color,
                            Year = ev.Year,
                            ListedPrice = item.Price,
                            ActualPrice = pd != null ? pd.Amount : (decimal?)null,
                            PaymentMethod = p != null ? p.Method : null,

                            CreatedAt = item.CreatedAt,
                            SoldAt = item.UpdatedAt,
                            ImageUrl = (from img_ in _context.ItemImages
                                        where img_.ItemId == item.ItemId
                                        select img_.ImageUrl).FirstOrDefault(),
                            Buyer = u != null ? new BuyerDto
                            {
                                BuyerId = u.UserId,
                                FullName = u.FullName,
                                Phone = u.Phone,
                                Address = a != null ? $"{a.Street}, {a.Ward}, {a.District}, {a.Province}" : null
                            } : null,
                            OrderId = o != null ? o.OrderId : (int?)null,

                            Status = isSold ? "sold" :
                                     isProcessing ? "processing" :
                                     isPending ? "pending_approval" :
                                     isCanceled ? "canceled" :
                                     "available"
                        };

            return await query.ToListAsync();
        }

        public Task<List<Item>> GetCanceledItemsAsync(int sellerId)
        {
            throw new NotImplementedException();
        }
    }
}