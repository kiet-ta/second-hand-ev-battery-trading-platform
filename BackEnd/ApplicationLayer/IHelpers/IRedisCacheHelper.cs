using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.IHelpers
{
    public interface IRedisCacheHelper
    {
        void SetObject<T>(string key, T obj, TimeSpan? expiry = null);
        T? GetObject<T>(string key);
        bool RemoveKey(string key);
        bool Exists(string key);
    }

}
