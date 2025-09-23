using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.IRepositories
{
    public interface IHasher
    {
        string Hash(string inputString);
        bool VerifyHashed(string hashedString, string providedString);
    }
}
