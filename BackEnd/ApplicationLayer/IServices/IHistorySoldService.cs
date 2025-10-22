using Application.DTOs.ItemDtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.IServices
{
    public interface IHistorySoldService
    {
        Task<List<object>> GetAllSellerItemsAsync(int sellerId);
        Task<PagedResultBought<object>> GetAllSellerItemsAsync(int sellerId, PaginationParams pagination);

    }

}
