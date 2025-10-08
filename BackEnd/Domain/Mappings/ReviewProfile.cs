using Application.DTOs.ReviewDtos;
using AutoMapper;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Mappings
{
    public class ReviewProfile : Profile
    {
        
        public ReviewProfile()
        {
            CreateMap<Review, CreateReviewDto>();
            CreateMap<ReviewImage, CreateReviewImageDto>();
        }

    }
}
