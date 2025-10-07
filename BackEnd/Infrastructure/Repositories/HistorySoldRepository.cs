using Application.DTOs;
using Application.IRepositories;
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
                    u.Role == "seller" &&
                    !u.IsDeleted &&
                    u.KycStatus == "approved" &&
                    u.AccountStatus != "ban"
                )
                .FirstOrDefaultAsync();
        }

        public async Task<List<Item>> GetAllSellerItemsAsync(int sellerId)
        {
            return await _context.Items
                .Where(i => i.UpdatedBy == sellerId && !(i.IsDeleted == false))
                .ToListAsync();
        }

        public async Task<List<Item>> GetProcessingItemsAsync(int sellerId)
        {
            return await _context.Items
                .Where(item =>
                    item.UpdatedBy == sellerId &&
                    item.Status == "sold" &&
                    !item.IsDeleted &&
                    _context.OrderItems
                        .Join(_context.Orders, oi => oi.OrderId, o => o.OrderId, (oi, o) => new { oi, o })
                        .Any(joined => joined.oi.ItemId == item.ItemId && (joined.o.Status == "paid" || joined.o.Status == "shipped"))
                )
                .ToListAsync();
        }

        public async Task<List<Item>> GetPendingPaymentItemsAsync(int sellerId)
        {
            return await _context.Items
                .Where(item =>
                    item.UpdatedBy == sellerId &&
                    item.Status == "active" &&
                    !item.IsDeleted &&
                    _context.PaymentDetails
                        .Join(_context.Payments, pd => pd.PaymentId, p => p.PaymentId, (pd, p) => new { pd, p })
                        .Join(_context.OrderItems, pp => pp.pd.ItemId, oi => oi.ItemId, (pp, oi) => pp)
                        .Any(joined => joined.p.Status == "pending")
                )
                .ToListAsync();
        }

        public async Task<List<Item>> GetSoldItemsAsync(int sellerId)
        {
            return await _context.Items
                .Where(item =>
                    item.UpdatedBy == sellerId &&
                    item.Status == "sold" &&
                    !item.IsDeleted &&
                    _context.PaymentDetails
                        .Join(_context.Payments, pd => pd.PaymentId, p => p.PaymentId, (pd, p) => new { pd, p })
                        .Any(joined => joined.p.Status == "completed")
                )
                .ToListAsync();
        }
#pragma warning disable CS8601#pragma warning disable CS8601
        public async Task<List<BatteryItemDTO>> MapToBatteryItemsAsync(List<Item> batteryItems)
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
                        select new BatteryItemDTO
                        {
                            ItemId = item.ItemId,
                            Brand = battery.Brand,
                            Capacity = battery.Capacity,
                            Voltage = battery.Voltage,
                            ChargeCycles = battery.ChargeCycles,
                            ListedPrice = item.Price,
                            ActualPrice = pd != null ? pd.Amount : (decimal?)null,
                            PaymentMethod = p != null ? p.Method : null,
                            Status = item.Status,
                            CreatedAt = item.CreatedAt,
                            SoldAt = item.UpdatedAt,
                            ImageUrl = img != null ? img.ImageUrl : null,
                            Buyer = u != null ? new BuyerDTO
                            {
                                BuyerId = u.UserId,
                                FullName = u.FullName,
                                Phone = u.Phone,
                                Address = a != null ? $"{a.Street}, {a.Ward}, {a.District}, {a.Province}" : null
                            } : null
                        };

            return await query.ToListAsync();
        }

        public async Task<List<EVItemDTO>> MapToEVItemsAsync(List<Item> evItems)
        {
            var itemIds = evItems.Select(i => i.ItemId).ToList();

            var query = from item in _context.Items
                        where itemIds.Contains(item.ItemId)
                        join ev in _context.EvDetails on item.ItemId equals ev.ItemId
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
                        select new EVItemDTO
                        {
                            ItemId = item.ItemId,
                            Title = item.Title,
                            LicensePlate = ev.LicensePlate,
                            Mileage = ev.Mileage,
                            Color = ev.Color,
                            Year = ev.Year,
                            ListedPrice = item.Price,
                            ActualPrice = pd != null ? pd.Amount : (decimal?)null,
                            PaymentMethod = p != null ? p.Method : null,
                            Status = item.Status,
                            CreatedAt = item.CreatedAt,
                            SoldAt = item.UpdatedAt,
                            ImageUrl = img != null ? img.ImageUrl : null,
                            Buyer = u != null ? new BuyerDTO
                            {
                                BuyerId = u.UserId,
                                FullName = u.FullName,
                                Phone = u.Phone,
                                Address = a != null ? $"{a.Street}, {a.Ward}, {a.District}, {a.Province}" : null
                            } : null
                        };

            return await query.ToListAsync();
        }
    }
}
