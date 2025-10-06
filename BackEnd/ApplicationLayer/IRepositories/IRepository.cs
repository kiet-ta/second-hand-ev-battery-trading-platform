using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.IRepositories
{
    public interface IRepository<T> where T : class
    {
        //IQueryable<T> Query(); // return IQueryable for composing queries in service

        //Task<T?> GetByIdAsync(int id);

        //Task<IEnumerable<T>> GetAllAsync();

        //Task AddAsync(T item);

        //void Update(T item);

        //void Delete(T item);

        //Task SaveChangesAsync();

        
    }
}
