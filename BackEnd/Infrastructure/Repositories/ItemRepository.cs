using Application.DTOs.ItemDtos;
using Application.DTOs.ItemDtos.BatteryDto;
using Application.DTOs.UserDtos;
using Application.IRepositories;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Repositories
{
    public class ItemRepository : IItemRepository
    {
        private readonly EvBatteryTradingContext _context;

        public ItemRepository(EvBatteryTradingContext context) => _context = context;

        public IQueryable<Item> Query() => _context.Items.AsQueryable();

        public IQueryable<ItemDto> QueryItemsWithSeller()
        {
            // EF will understand navigation from Configurations
            var query = from i in _context.Items
                        join u in _context.Users
                            on i.UpdatedBy equals u.UserId into gj
                        from user in gj.DefaultIfEmpty() // LEFT JOIN
                        //join im in _context.ItemImages
                        //    on i.ItemId equals im.ItemId into imj
                        //from itemImage in imj.DefaultIfEmpty()
                        where !(i.IsDeleted == true)   // remove soft deleted items
                        select new ItemDto
                        {
                            ItemId = i.ItemId,
                            ItemType = i.ItemType,
                            CategoryId = i.CategoryId,
                            Title = i.Title,
                            Description = i.Description,
                            Price = i.Price,
                            Quantity = i.Quantity,
                            CreatedAt = i.CreatedAt,
                            UpdatedAt = i.UpdatedAt,
                            //Images = imj.Select(im => new ItemImageDto
                            //{
                            //    ImageId = im.ImageId,
                            //    ImageUrl = im.ImageUrl
                            //}).ToList()
                            //UpdatedBy = i.UpdatedBy,
                            //SellerName = user != null
                            //? (user.FullName ?? string.Empty)
                            //: string.Empty
                        };

            return query.AsNoTracking(); // Optimized for read-only queries
        }

        public async Task<PagedResultItem<ItemDto>> SearchItemsAsync(
        string itemType,
        string title,
        decimal? minPrice,
        decimal? maxPrice,
        int page,
        int pageSize,
        string sortBy,
        string sortDir)
        {
            if (page <= 0) page = 1;
            if (pageSize <= 0) pageSize = 20;

            var query = from i in _context.Items
                        join u in _context.Users
                            on i.UpdatedBy equals u.UserId into gj
                        from user in gj.DefaultIfEmpty()
                        where i.IsDeleted == false
                        select new ItemDto
                        {
                            ItemId = i.ItemId,
                            ItemType = i.ItemType,
                            CategoryId = i.CategoryId,
                            Title = i.Title,
                            Description = i.Description,
                            Price = i.Price,
                            Quantity = i.Quantity,
                            Status = i.Status,
                            CreatedAt = i.CreatedAt,
                            UpdatedAt = i.UpdatedAt,
                            SellerName = user != null ? user.FullName : string.Empty,
                            Images = _context.ItemImages
                                .Where(img => img.ItemId == i.ItemId)
                                .Select(img => new ItemImageDto
                                {
                                    ImageId = img.ImageId,
                                    ImageUrl = img.ImageUrl
                                }).ToList()
                        };

            // Filter by itemType
            if (!string.IsNullOrWhiteSpace(itemType) && itemType.ToLower() != "all")
            {
                query = query.Where(i => i.ItemType == itemType.Trim().ToLower());
            }

            // Filter by title
            if (!string.IsNullOrWhiteSpace(title))
            {
                query = query.Where(i => i.Title.ToLower().Contains(title.Trim().ToLower()));
            }

            // Filter by price range
            if (minPrice.HasValue)
            {
                query = query.Where(i => i.Price >= minPrice.Value);
            }

            if (maxPrice.HasValue)
            {
                query = query.Where(i => i.Price <= maxPrice.Value);
            }

            // Sorting
            bool desc = sortDir.Equals("desc", StringComparison.OrdinalIgnoreCase);
            query = sortBy switch
            {
                "Price" => desc ? query.OrderByDescending(i => i.Price) : query.OrderBy(i => i.Price),
                "Title" => desc ? query.OrderByDescending(i => i.Title) : query.OrderBy(i => i.Title),
                _ => desc ? query.OrderByDescending(i => i.UpdatedAt) : query.OrderBy(i => i.UpdatedAt)
            };

            // Get total count
            var total = await query.LongCountAsync();

            // Pagination
            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            // Load item details
            foreach (var item in items)
            {
                if (item.ItemType == "ev")
                {
                    var detail = await _context.EVDetails
                        .Where(d => d.ItemId == item.ItemId)
                        .Select(d => new EVDetailDto
                        {
                            Brand = d.Brand,
                            Model = d.Model,
                            Version = d.Version,
                            Year = d.Year,
                            BodyStyle = d.BodyStyle,
                            Color = d.Color,
                            LicensePlate = d.LicensePlate,
                            HasAccessories = d.HasAccessories,
                            PreviousOwners = d.PreviousOwners,
                            IsRegistrationValid = d.IsRegistrationValid,
                            Mileage = d.Mileage
                        })
                        .FirstOrDefaultAsync();
                    item.ItemDetail = detail;
                }
                else if (item.ItemType == "battery")
                {
                    var detail = await _context.BatteryDetails
                        .Where(d => d.ItemId == item.ItemId)
                        .Select(d => new BatteryDetailDto
                        {
                            Brand = d.Brand,
                            Capacity = d.Capacity,
                            Voltage = d.Voltage,
                            ChargeCycles = d.ChargeCycles
                        })
                        .FirstOrDefaultAsync();
                    item.ItemDetail = detail;
                }
            }

            return new PagedResultItem<ItemDto>
            {
                Page = page,
                PageSize = pageSize,
                TotalCount = total,
                Items = items
            };
        }

        public async Task<Item> AddAsync(Item item, CancellationToken? ct = null)
        {
            var en = (await _context.Items.AddAsync(item)).Entity;
            return en;
        }

        public void Delete(Item item)
        {
            // I fixed here because Update() will mark the whole entity as Modified → if the service only has IsDeleted = true set then it's OK, but if the entity is being tracked, it might override other fields.
            //item.IsDeleted = true;
            //_context.Items.Update(item); // xóa mềm

            item.IsDeleted = true;
            _context.Entry(item).Property(x => x.IsDeleted).IsModified = true;
        }

        public async Task<IEnumerable<Item>> GetAllAsync() =>
            await _context.Items.Where(i => !i.IsDeleted).ToListAsync();

        public async Task<Item?> GetByIdAsync(int itemId, CancellationToken? ct = null)
            => await _context.Items.FirstOrDefaultAsync(item => item.ItemId == itemId, ct ?? CancellationToken.None);

        public void Update(Item item) => _context.Items.Update(item);

        public async Task<IEnumerable<Item>> GetItemsByFilterAsync(CancellationToken ct = default)
            => await _context.Items.Where(i => !i.IsDeleted).ToListAsync(ct);

        public async Task<bool> ExistsAsync(int itemId, CancellationToken? ct = null)
            => await _context.Items.AnyAsync(i => i.ItemId == itemId);

        //ChatGPT recommended me to use IUnitOfWork instance of SaveChangesAsync
        public async Task SaveChangesAsync() => await _context.SaveChangesAsync();

        public async Task<IEnumerable<Item>> GetLatestEVsAsync(int count)
        {
            return await _context.Items
                .Where(x => x.ItemType == "EV" && !(x.IsDeleted == true))
                .OrderByDescending(x => x.CreatedAt)
                .Take(count)
                .ToListAsync();
        }

        public async Task<IEnumerable<Item>> GetLatestBatteriesAsync(int count)
        {
            return await _context.Items
                .Where(x => x.ItemType == "Battery" && !(x.IsDeleted == true))
                .OrderByDescending(x => x.CreatedAt)
                .Take(count)
                .ToListAsync();
        }

        public async Task<ItemWithDetailDto?> GetItemWithDetailsAsync(int id)
        {
            var query = from i in _context.Items
                        where i.ItemId == id && !(i.IsDeleted == true)
                        join im in _context.ItemImages
                            on i.ItemId equals im.ItemId into imj
                        from itemImage in imj.DefaultIfEmpty()
                        join ev in _context.EVDetails
                            on i.ItemId equals ev.ItemId into evj
                        from evDetail in evj.DefaultIfEmpty()
                        join bat in _context.BatteryDetails
                            on i.ItemId equals bat.ItemId into batj
                        from batDetail in batj.DefaultIfEmpty()
                        select new ItemWithDetailDto
                        {
                            ItemId = i.ItemId,
                            Title = i.Title,
                            ItemType = i.ItemType,
                            CategoryId = i.CategoryId,
                            Description = i.Description,
                            Price = i.Price,
                    //Moderation = item.Moderation,
                            Quantity = i.Quantity,
                            CreatedAt = i.CreatedAt,
                            UpdatedAt = i.UpdatedAt,
                            UpdatedBy = i.UpdatedBy,
                            ItemImage = _context.ItemImages
                            .Where(img => img.ItemId == i.ItemId)
                            .Select(img => new ItemImageDto
                            {
                                ImageId = img.ImageId,
                                ImageUrl = img.ImageUrl
                            }).ToList(),
                            EVDetail = evDetail,
                            BatteryDetail = batDetail
                        };

            return await query.AsNoTracking().FirstOrDefaultAsync();
        }

        public async Task<IEnumerable<ItemWithDetailDto>> GetAllItemsWithDetailsAsync()
        {
            var query = from i in _context.Items
                        where !(i.IsDeleted == true)
                        join im in _context.ItemImages
                            on i.ItemId equals im.ItemId into imj
                        from itemImage in imj.DefaultIfEmpty()
                        join ev in _context.EVDetails
                            on i.ItemId equals ev.ItemId into evj
                        from evDetail in evj.DefaultIfEmpty()
                        join bat in _context.BatteryDetails
                            on i.ItemId equals bat.ItemId into batj
                        from batDetail in batj.DefaultIfEmpty()
                        select new ItemWithDetailDto
                        {
                            ItemId = i.ItemId,
                            Title = i.Title,
                            ItemType = i.ItemType,
                            CategoryId = i.CategoryId,
                            Description = i.Description,
                            Price = i.Price,
                            Quantity = i.Quantity,
                    //Moderation = item.Moderation,
                            CreatedAt = i.CreatedAt,
                            UpdatedAt = i.UpdatedAt,
                            UpdatedBy = i.UpdatedBy,
                            ItemImage = _context.ItemImages
                            .Where(img => img.ItemId == i.ItemId)
                            .Select(img => new ItemImageDto
                            {
                                ImageId = img.ImageId,
                                ImageUrl = img.ImageUrl
                            }).ToList(),
                            EVDetail = evDetail,
                            BatteryDetail = batDetail
                        };

            return await query.AsNoTracking().ToListAsync();
        }

        public async Task<IEnumerable<ItemBoughtDto>> GetBoughtItemsWithDetailsAsync(int userId)
        {
            // Query original
            var query = from payment in _context.Payments
                        join pd in _context.PaymentDetails on payment.PaymentId equals pd.PaymentId
                        join item in _context.Items on pd.ItemId equals item.ItemId
                        where payment.UserId == userId && payment.Status == "completed"
                        select new
                        {
                            payment,
                            pd,
                            item
                        };

            // build result detail (join EV & Battery)
            var result = await (from q in query
                                    // left join EV_Detail
                                join ev in _context.EVDetails
                                    on q.item.ItemId equals ev.ItemId into evJoin
                                from ev in evJoin.DefaultIfEmpty()
                                    // left join Battery_Detail
                                join bat in _context.BatteryDetails
                                    on q.item.ItemId equals bat.ItemId into batJoin
                                from bat in batJoin.DefaultIfEmpty()
                                //join im in _context.ItemImages
                                //    on q.item.ItemId equals im.ItemId into imJoin
                                //from im in imJoin.DefaultIfEmpty()
                                select new ItemBoughtDto
                                {
                                    ItemId = q.item.ItemId,
                                    ItemType = q.item.ItemType,
                                    Title = q.item.Title,
                                    Description = q.item.Description,
                                    Price = q.item.Price,

                                    PaymentId = q.payment.PaymentId,
                                    OrderCode = q.payment.OrderCode,
                                    TotalAmount = q.payment.TotalAmount,
                                    Method = q.payment.Method,
                                    Status = q.payment.Status,
                                    PaymentCreatedAt = q.payment.CreatedAt,

                                    // EV
                                    Brand = ev.Brand,
                                    Model = ev.Model,
                                    Version = ev.Version,
                                    Year = ev.Year,
                                    Color = ev.Color,
                                    Mileage = ev.Mileage,

                                    // Battery
                                    Capacity = bat.Capacity,
                                    Voltage = bat.Voltage,
                                    ChargeCycles = bat.ChargeCycles,

                                    // Amount of item
                                    ItemAmount = q.pd.Amount,

                                    ItemImage = _context.ItemImages
                                        .Where(img => img.ItemId == q.item.ItemId)
                                        .Select(img => new ItemImage
                                        {
                                            ImageId = img.ImageId,
                                            ImageUrl = img.ImageUrl
                                        }).ToList()
                                }).ToListAsync();

            return result;
        }

        //Feature: Seller Dashboard
        public async Task<int> CountAllBySellerAsync(int sellerId)
        {
            return await _context.Items.CountAsync(i => i.UpdatedBy == sellerId && !(i.IsDeleted == true));
        }

        public async Task<int> CountByStatusAsync(int sellerId, string status)
        {
            return await _context.Items.CountAsync(i => i.UpdatedBy == sellerId && i.Status == status && !(i.IsDeleted == true));
        }

        public async Task<decimal> GetTotalRevenueAsync(int sellerId)
        {
            return await _context.PaymentDetails
                .Where(p => _context.Items
                    .Any(i => i.ItemId == p.ItemId && i.UpdatedBy == sellerId))
                .SumAsync(p => p.Amount);
        }

        public async Task AddImageAsync(ItemImage image)
        => await _context.ItemImages.AddAsync(image);

        public async Task<IEnumerable<ItemImage>> GetByItemIdAsync(int itemId)
        {
            return await _context.ItemImages
                .Where(x => x.ItemId == itemId)
                .ToListAsync();
        }

        public async Task<IEnumerable<Item>> GetBySellerIdAsync(int sellerId)
        {
            return await _context.Items
                .Where(i => i.UpdatedBy == sellerId
                            && !i.IsDeleted
                            && i.Status == "active")
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<int> GetTotalProductsAsync(int sellerId)
        {
            return await _context.Items
                .CountAsync(i => i.UpdatedBy == sellerId
                                 && !i.IsDeleted
                                 && i.Status == "active");
        }

        public async Task<IEnumerable<ItemSellerDto>> GetItemsBySellerIdAsync(int sellerId)
        {
            var query = from i in _context.Items
                        join c in _context.Categories on i.CategoryId equals c.CategoryId
                        join img in _context.ItemImages on i.ItemId equals img.ItemId into imgGroup
                        where !i.IsDeleted
                              && i.Status == "active"
                              && i.UpdatedBy == sellerId
                        select new ItemSellerDto
                        {
                            ItemId = i.ItemId,
                            Title = i.Title,
                            Description = i.Description,
                            Price = i.Price,
                            Quantity = i.Quantity,
                            Status = i.Status,
                            CreatedAt = i.CreatedAt,
                            UpdatedAt = i.UpdatedAt,
                            CategoryName = c.Name,
                            Images = imgGroup.Select(img => new ItemImageDto
                            {
                                ImageId = img.ImageId,
                                ImageUrl = img.ImageUrl
                            }).ToList()
                        };

            return await query.ToListAsync();
        }

        public async Task<int> CountActiveAsync()
        {
            return await _context.Items
                .CountAsync(i => i.Status == "active" && i.IsDeleted == false);
        }

        public async Task<IEnumerable<(string ItemType, int Count)>> GetItemTypeCountsAsync()
        {
            var result = await _context.Items
                .Where(i => !i.IsDeleted)
                .GroupBy(i => i.ItemType)
                .Select(g => new { ItemType = g.Key, Count = g.Count() })
                .ToListAsync();

            return result.Select(r => (r.ItemType, r.Count));
        }

        public async Task<UserItemDetailDto?> GetItemWithSellerByItemIdAsync(int itemId)
        {
            var query =
                from i in _context.Items
                where i.ItemId == itemId && !i.IsDeleted
                join u in _context.Users on i.UpdatedBy equals u.UserId
                select new UserItemDetailDto
                {
                    Seller = new UserDto
                    {
                        UserId = u.UserId,
                        FullName = u.FullName,
                        Email = u.Email,
                        Phone = u.Phone,
                        AvatarProfile = u.AvatarProfile,
                        Bio = u.Bio
                    },

                    Item = new ItemDto
                    {
                        ItemId = i.ItemId,
                        ItemType = i.ItemType,
                        CategoryId = i.CategoryId,
                        Title = i.Title,
                        Description = i.Description,
                        Price = i.Price,
                        Quantity = i.Quantity,
                        CreatedAt = i.CreatedAt,
                        UpdatedAt = i.UpdatedAt,
                        UpdatedBy = i.UpdatedBy,
                        Images = _context.ItemImages
                            .Where(img => img.ItemId == i.ItemId)
                            .Select(img => new ItemImageDto
                            {
                                ImageId = img.ImageId,
                                ImageUrl = img.ImageUrl
                            }).ToList()
                    },

                    EVDetail = (from ev in _context.EVDetails
                                where ev.ItemId == i.ItemId
                                select new EVDetailDto
                                {
                                    ItemId = ev.ItemId,
                                    Brand = ev.Brand,
                                    Model = ev.Model,
                                    Version = ev.Version,
                                    Year = ev.Year,
                                    BodyStyle = ev.BodyStyle,
                                    Color = ev.Color,
                                    LicensePlate = ev.LicensePlate,
                                    HasAccessories = ev.HasAccessories,
                                    PreviousOwners = ev.PreviousOwners,
                                    IsRegistrationValid = ev.IsRegistrationValid,
                                    Mileage = ev.Mileage,
                                    Title = i.Title,
                                    Price = i.Price,
                                    Status = i.Status
                                }).FirstOrDefault(),

                    BatteryDetail = (from b in _context.BatteryDetails
                                     where b.ItemId == i.ItemId
                                     select new BatteryDetailDto
                                     {
                                         ItemId = b.ItemId,
                                         Brand = b.Brand,
                                         Capacity = b.Capacity,
                                         Voltage = b.Voltage,
                                         ChargeCycles = b.ChargeCycles,
                                         UpdatedAt = b.UpdatedAt,
                                         Title = i.Title,
                                         Price = i.Price,
                                         Status = i.Status
                                     }).FirstOrDefault()
                };

            return await query.AsNoTracking().FirstOrDefaultAsync();
        }

        public async Task<bool> SetItemTagAsync(int itemId, string tag)
        {
            var item = await _context.Items.FirstOrDefaultAsync(i => i.ItemId == itemId);
            if (item == null)
            {
                return false;
            }
            item.Moderation = tag;
            _context.Items.Update(item);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}