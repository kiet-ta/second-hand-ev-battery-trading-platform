using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.IServices
{

        public interface IUserService
        {
            Task<IEnumerable<User>> GetAllUsersAsync();

            Task<User?> GetUserByIdAsync(int id);

            Task<User?> GetUserByEmailAsync(string email);

            Task AddUserAsync(User user);

            Task UpdateUserAsync(User user);

            Task DeleteUserAsync(int id);
        }
    }

