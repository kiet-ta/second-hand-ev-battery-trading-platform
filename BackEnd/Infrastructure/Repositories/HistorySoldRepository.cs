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

        public async Task<List<Item>> GetProcessingItemsAsync(int sellerId)
        {
            var items = await _context.Items
                .Where(item =>
                    item.UpdatedBy == sellerId &&
                    !(item.IsDeleted == true) &&
                    _context.OrderItems
                        .Join(_context.Orders, oi => oi.OrderId, o => o.OrderId, (oi, o) => new { oi, o })
                        .Any(joined =>
                            joined.oi.ItemId == item.ItemId &&
                            (joined.o.Status == OrderStatus.Paid.ToString() || joined.o.Status == OrderStatus.Shipped.ToString()))
                )
                .ToListAsync();

            foreach (var item in items)
            {
                item.Status = "Processing";
            }

            return items;
        }

        public async Task<List<Item>> GetPendingPaymentItemsAsync(int sellerId)
        {
            var items = await _context.Items
                .Where(item =>
                    item.UpdatedBy == sellerId &&
                    !(item.IsDeleted == true) &&
                    _context.PaymentDetails
                        .Join(_context.Payments, pd => pd.PaymentId, p => p.PaymentId, (pd, p) => new { pd, p })
                        .Any(joined =>
                            joined.pd.ItemId == item.ItemId &&
                            joined.p.Status == PaymentStatus.Pending.ToString())
                )
                .ToListAsync();

            foreach (var item in items)
            {
                item.Status = "Pending_Approval";
            }

            return items;
        }

        public async Task<List<Item>> GetCanceledItemsAsync(int sellerId)
        {
            var items = await _context.Items
                .Where(item =>
                    item.UpdatedBy == sellerId &&
                    !(item.IsDeleted == true) &&
                    (
                        _context.PaymentDetails
                            .Join(_context.Payments,
                                  pd => pd.PaymentId,
                                  p => p.PaymentId,
                                  (pd, p) => new { pd, p })
                            .Any(joined =>
                                joined.pd.ItemId == item.ItemId &&
                                (joined.p.Status == PaymentStatus.Failed
                                .ToString() ||
                                 joined.p.Status == PaymentStatus.Refunded
                                .ToString() ||
                                 joined.p.Status == PaymentStatus.Expired
                                .ToString()))
                        ||
                        _context.OrderItems
                            .Join(_context.Orders,
                                  oi => oi.OrderId,
                                  o => o.OrderId,
                                  (oi, o) => new { oi, o })
                            .Any(joined =>
                                joined.oi.ItemId == item.ItemId &&
                                joined.o.Status == OrderStatus.Cancelled.ToString())
                    )
                )
                .ToListAsync();

            foreach (var item in items)
            {
                item.Status = "Canceled";
            }

            return items;
        }

        public async Task<List<Item>> GetSoldItemsAsync(int sellerId)
        {
            var items = await _context.Items
                .Where(item =>
                    item.UpdatedBy == sellerId &&
                    !(item.IsDeleted == true) &&
                    _context.PaymentDetails
                        .Join(_context.Payments, pd => pd.PaymentId, p => p.PaymentId, (pd, p) => new { pd, p })
                        .Any(joined =>
                            joined.pd.ItemId == item.ItemId &&
                            joined.p.Status == PaymentStatus.Completed.ToString())
                )
                .ToListAsync();

            foreach (var item in items)
            {
                item.Status = "Sold";
            }

            return items;
        }

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
                            ActualPrice = item.Price * oi.Quantity,
                            PaymentMethod = p != null ? p.Method : null,

                            CreatedAt = o.CreatedAt,
                            SoldAt = o.UpdatedAt,
                            ImageUrl = img != null ? img.ImageUrl : null,
                            Buyer = u != null ? new BuyerDto
                            {
                                BuyerId = u.UserId,
                                FullName = u.FullName,
                                Phone = u.Phone,
                                Address = a != null ? $"{a.Street}, {a.Ward}, {a.District}, {a.Province}" : null
                            } : null,
                            OrderId = o != null ? o.OrderId : (int?)null,
                            Status = o.Status
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
                            ActualPrice = item.Price * oi.Quantity,
                            PaymentMethod = p != null ? p.Method : null,
                            CreatedAt = o.CreatedAt,
                            SoldAt = o.UpdatedAt,
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
                            Status = o.Status != null ? o.Status : null
                            // Gán trạng thái đã tính toán
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
                            ActualPrice = item.Price * oi.Quantity,
                            PaymentMethod = p != null ? p.Method : null,

                            CreatedAt = o.CreatedAt,
                            SoldAt = o.UpdatedAt,
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
                            ActualPrice = item.Price * oi.Quantity,
                            PaymentMethod = p != null ? p.Method : null,

                            CreatedAt = o.CreatedAt,
                            SoldAt = o.UpdatedAt,
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

                            Status = o.Status != null ? o.Status : null
                        };

            return await query.ToListAsync();
        }
    }
}