using AutoMapper;
using Domain.DTOs;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Mappings
{
    public class UserProfile : Profile
    { 
        public UserProfile() 
        {
            CreateMap<User, UpdateUserDto>();
            CreateMap<User, UserDTO>();
        }
    }
}
