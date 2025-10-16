using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.IServices
{
    public interface IItemImageService
    {
        Task<IEnumerable<string>> UploadItemImagesAsync(int itemId, List<IFormFile> files);
    }
}
