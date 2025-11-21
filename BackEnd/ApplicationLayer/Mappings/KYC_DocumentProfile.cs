using Application.DTOs;
using AutoMapper;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Mappings
{
    public class KYC_DocumentProfile : Profile
    {
        public KYC_DocumentProfile()
        {
            CreateMap<KycDocument, CreateKYC_DocumentDTO>().ReverseMap();
            CreateMap<KycDocument, ApproveKyc_DocumentDTO>().ReverseMap();
        }
    }
}