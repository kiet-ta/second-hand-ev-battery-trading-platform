using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.IRepositories.IChatRepositories
{
    public interface IUserModerationRepository
    {
        //Log a violation (e.g., spam) for the user
        Task AddProfanityLogAsync(long userId, DateTimeOffset timestamp);
        //Get the number of violations over the past period (e.g. 1 hour)
        Task<int> GetProfanityCountAsync(long userId, TimeSpan timeWindow);
    }
}
