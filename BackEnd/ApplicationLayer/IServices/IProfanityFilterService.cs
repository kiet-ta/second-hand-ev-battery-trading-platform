using Application.DTOs.SignalRDtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.IServices
{
    public interface IProfanityFilterService
    {
        ProfanityFilterResult Filter(string text);
        string CleanMessage(string message);
        bool ContainsProfanity(string message);
    }
}
