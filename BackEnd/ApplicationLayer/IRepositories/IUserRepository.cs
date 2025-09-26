using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.IRepositories
{
    public interface IUserRepository
    {
        // Define repository methods here
        Task<ExternalUser?> GetUserByEmailAsync(string email);
        Task<ExternalUser?> GetUserByPhoneAsync(string phone);
        Task<ExternalUser?> GetUserDtoByIdAsync(int userId);
        Task<bool> UpdateUserDirectAsync(int id, ExternalUser userData);

        Task<bool> AdminUpdateDirectAsync(int id, ExternalUser userData);
        Task<List<ExternalUser>> GetUsersAsync();
        Task<bool> DeleteUserDirectAsync(int userId);
         IQueryable<ExternalUser> GetAllUsersQueryable();

    }
}
