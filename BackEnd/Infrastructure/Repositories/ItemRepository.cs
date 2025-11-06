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
                        where i.IsDeleted == false && i.Status == "active"
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
                            Moderation = i.Moderation,
                            Images = _context.ItemImages
                                .Where(img => img.ItemId == i.ItemId)
                                .Select(img => new ItemImageDto
                                {
                                    ImageId = img.ImageId,
                                    ImageUrl = img.ImageUrl
                                }).ToList(),
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
                            Mileage = d.Mileage,
                            LicenseUrl = d.LicenseUrl
                        })
                        .FirstOrDefaultAsync();
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
            //_context.Items.Update(item); // soft delete

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
                .Where(x => x.ItemType == "ev" && !(x.IsDeleted == true) && x.Status == "active")
                .OrderByDescending(x => x.CreatedAt)
                .Take(count)
                .ToListAsync();
        }

        public async Task<IEnumerable<Item>> GetLatestBatteriesAsync(int count)
        {
            return await _context.Items
                .Where(x => x.ItemType == "battery" && !(x.IsDeleted == true) && x.Status == "active")
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
                            Moderation = i.Moderation,
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
                            Moderation = i.Moderation,
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

        public async Task<PagedResultBought<ItemBoughtDto>> GetTransactionItemsWithDetailsAsync(int userId, PaginationParams paginationParams)
        {
            var baseQuery = from payment in _context.Payments
                            join pd in _context.PaymentDetails on payment.PaymentId equals pd.PaymentId
                            join item in _context.Items on pd.ItemId equals item.ItemId
                            where payment.UserId == userId && payment.Status == "completed"
                            // Left Join EV_Detail
                            join ev in _context.EVDetails on item.ItemId equals ev.ItemId into evJoin
                            from ev in evJoin.DefaultIfEmpty()
                                // Left Join Battery_Detail
                            join bat in _context.BatteryDetails on item.ItemId equals bat.ItemId into batJoin
                            from bat in batJoin.DefaultIfEmpty()
                            select new { payment, pd, item, ev, bat };

            var totalCount = await baseQuery.CountAsync();

            var pagedItems = await baseQuery
                .Skip((paginationParams.PageNumber - 1) * paginationParams.PageSize)
                .Take(paginationParams.PageSize)
                .Select(x => new ItemBoughtDto
                {
                    ItemId = x.item.ItemId,
                    ItemType = x.item.ItemType,
                    Title = x.item.Title,
                    Description = x.item.Description,
                    Price = x.item.Price,
                    PaymentId = x.payment.PaymentId,
                    OrderCode = x.payment.OrderCode,
                    TotalAmount = x.payment.TotalAmount,
                    Method = x.payment.Method,
                    Status = x.payment.Status,
                    PaymentCreatedAt = x.payment.CreatedAt,
                    Brand = x.ev.Brand,
                    Model = x.ev.Model,
                    Version = x.ev.Version,
                    Year = x.ev.Year,
                    Color = x.ev.Color,
                    Mileage = x.ev.Mileage,
                    Capacity = x.bat.Capacity,
                    Voltage = x.bat.Voltage,
                    ChargeCycles = x.bat.ChargeCycles,
                    ItemAmount = x.pd.Amount,
                    ItemImage = new List<ItemImage>()
                })
                .ToListAsync();

            if (pagedItems.Any())
            {
                var itemIds = pagedItems.Select(p => p.ItemId).Distinct().ToList();

                var allImages = await _context.ItemImages
                    .Where(img => itemIds.Contains(img.ItemId))
                    .Select(img => new { img.ItemId, img.ImageId, img.ImageUrl })
                    .ToListAsync();

                var imageLookup = allImages.GroupBy(img => img.ItemId);

                foreach (var item in pagedItems)
                {
                    var itemImages = imageLookup.FirstOrDefault(g => g.Key == item.ItemId);
                    if (itemImages != null)
                    {
                        item.ItemImage = itemImages.Select(img => new ItemImage
                        {
                            ImageId = img.ImageId,
                            ItemId = img.ItemId,
                            ImageUrl = img.ImageUrl
                        }).ToList();
                    }
                }
            }

            return new PagedResultBought<ItemBoughtDto>(pagedItems, totalCount, paginationParams.PageNumber, paginationParams.PageSize);
        }

        public async Task<PagedResultBought<ItemBoughtDto>> GetBoughtItemsWithDetailsAsync(int userId, PaginationParams paginationParams)
        {
            var baseQuery = from payment in _context.Payments
                            join pd in _context.PaymentDetails on payment.PaymentId equals pd.PaymentId
                            join oi in _context.OrderItems on pd.OrderId equals oi.OrderId
                            join o in _context.Orders on oi.OrderId equals o.OrderId
                            join item in _context.Items on pd.ItemId equals item.ItemId
                            where payment.UserId == userId && payment.Status == "completed" && o.Status == "completed"
                            // Left Join EV_Detail
                            join ev in _context.EVDetails on item.ItemId equals ev.ItemId into evJoin
                            from ev in evJoin.DefaultIfEmpty()
                                // Left Join Battery_Detail
                            join bat in _context.BatteryDetails on item.ItemId equals bat.ItemId into batJoin
                            from bat in batJoin.DefaultIfEmpty()
                            select new { payment, pd, item, ev, bat };

            var totalCount = await baseQuery.CountAsync();

            var pagedItems = await baseQuery
                .Skip((paginationParams.PageNumber - 1) * paginationParams.PageSize)
                .Take(paginationParams.PageSize)
                .Select(x => new ItemBoughtDto
                {
                    ItemId = x.item.ItemId,
                    ItemType = x.item.ItemType,
                    Title = x.item.Title,
                    Description = x.item.Description,
                    Price = x.item.Price,
                    PaymentId = x.payment.PaymentId,
                    OrderCode = x.payment.OrderCode,
                    TotalAmount = x.payment.TotalAmount,
                    Method = x.payment.Method,
                    Status = x.payment.Status,
                    PaymentCreatedAt = x.payment.CreatedAt,
                    Brand = x.ev.Brand,
                    Model = x.ev.Model,
                    Version = x.ev.Version,
                    Year = x.ev.Year,
                    Color = x.ev.Color,
                    Mileage = x.ev.Mileage,
                    Capacity = x.bat.Capacity,
                    Voltage = x.bat.Voltage,
                    ChargeCycles = x.bat.ChargeCycles,
                    ItemAmount = x.pd.Amount,
                    ItemImage = new List<ItemImage>()
                })
                .ToListAsync();

            if (pagedItems.Any())
            {
                var itemIds = pagedItems.Select(p => p.ItemId).Distinct().ToList();

                var allImages = await _context.ItemImages
                    .Where(img => itemIds.Contains(img.ItemId))
                    .Select(img => new { img.ItemId, img.ImageId, img.ImageUrl })
                    .ToListAsync();

                var imageLookup = allImages.GroupBy(img => img.ItemId);

                foreach (var item in pagedItems)
                {
                    var itemImages = imageLookup.FirstOrDefault(g => g.Key == item.ItemId);
                    if (itemImages != null)
                    {
                        item.ItemImage = itemImages.Select(img => new ItemImage
                        {
                            ImageId = img.ImageId,
                            ItemId = img.ItemId,
                            ImageUrl = img.ImageUrl
                        }).ToList();
                    }
                }
            }

            return new PagedResultBought<ItemBoughtDto>(pagedItems, totalCount, paginationParams.PageNumber, paginationParams.PageSize);
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
        //Update Processing...
        public async Task<int> GetTotalItemsSoldBySellerAsync(int sellerId)
        {
            var productLinesQuery = from i in _context.Items
                                    join oi in _context.OrderItems on i.ItemId equals oi.ItemId
                                    join o in _context.Orders on oi.OrderId equals o.OrderId
                                    join pd in _context.PaymentDetails on o.OrderId equals pd.OrderId
                                    join p in _context.Payments on pd.PaymentId equals p.PaymentId
                                    where
                                        i.UpdatedBy == sellerId &&
                                        //o.Status == "completed" //&& 
                                        p.Status == "completed"
                                    select pd.PaymentDetailId;

            var totalProductLinesSold = await productLinesQuery.CountAsync();

            return totalProductLinesSold;
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
                            }).ToList(),
                            Moderation = i.Moderation
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
                                    LicenseUrl = ev.LicenseUrl,
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

        public async Task<ItemWithSellerResult?> GetItemAndSellerByItemIdAsync(int itemId) 
        {
            var query =
                from i in _context.Items.AsTracking() 
                where i.ItemId == itemId && !i.IsDeleted
                join u in _context.Users on i.UpdatedBy equals u.UserId
                select new ItemWithSellerResult
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

                    Item = i, 

                    Images = _context.ItemImages
                            .Where(img => img.ItemId == i.ItemId)
                            .Select(img => new ItemImageDto
                            {
                                ImageId = img.ImageId,
                                ImageUrl = img.ImageUrl
                            }).ToList(),

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
                                    LicenseUrl = ev.LicenseUrl,
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

            return await query.FirstOrDefaultAsync();
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

        public async Task<IEnumerable<EVDetail>> SearchEvDetailAsync(EVSearchRequestDto request)
        {
            var query = _context.EVDetails.AsQueryable();

            if (!string.IsNullOrEmpty(request.Brand))
                query = query.Where(e => e.Brand.Contains(request.Brand));

            if (!string.IsNullOrEmpty(request.Model))
                query = query.Where(e => e.Model.Contains(request.Model));

            if (request.Year.HasValue)
                query = query.Where(e => e.Year == request.Year);

            if (!string.IsNullOrEmpty(request.Color))
                query = query.Where(e => e.Color.Contains(request.Color));

            if (request.IsRegistrationValid.HasValue)
                query = query.Where(e => e.IsRegistrationValid == request.IsRegistrationValid);

            return await query.ToListAsync();
        }

        public async Task<IEnumerable<BatteryDetail>> SearchBatteryDetailAsync(BatterySearchRequestDto request)
        {
            var query = _context.BatteryDetails.AsQueryable();

            if (!string.IsNullOrEmpty(request.Brand))
                query = query.Where(b => b.Brand.Contains(request.Brand));

            if (request.Capacity.HasValue)
                query = query.Where(b => b.Capacity == request.Capacity);

            if (request.Voltage.HasValue)
                query = query.Where(b => b.Voltage == request.Voltage);

            if (request.ChargeCycles.HasValue)
                query = query.Where(b => b.ChargeCycles <= request.ChargeCycles);

            return await query.ToListAsync();
        }
    }
}