using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Repositories.ChatRepositories
{
    public class FirebaseOptions
    {
        public string DatabaseUrl { get; set; } = null!;
        public string DatabaseSecret { get; set; } = null!; // Legacy token hoặc Auth token
        public string ServiceAccountJsonPath { get; set; } = null!; // Optional
    }
}
